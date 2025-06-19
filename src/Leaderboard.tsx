import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from './supabaseClient';

const ITEMS_PER_PAGE = 25;

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<{ [wallet: string]: number }>({});
  const [twitterMap, setTwitterMap] = useState<{ [wallet: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: scoreData } = await supabase
        .from('scores')
        .select('wallet, score')
        .order('score', { ascending: false });

      const { data: twitterData } = await supabase
        .from('twitter_handles')
        .select('wallet, handle');

      const scoreMap: { [wallet: string]: number } = {};
      const twMap: { [wallet: string]: string } = {};

      if (scoreData) {
        for (const item of scoreData) {
          if (item.wallet && typeof item.score === 'number') {
            scoreMap[item.wallet] = item.score;
          }
        }
      }

      if (twitterData) {
        for (const item of twitterData) {
          if (item.wallet && item.handle) {
            twMap[item.wallet] = item.handle;
          }
        }
      }

      setScores(scoreMap);
      setTwitterMap(twMap);
    };

    fetchLeaderboard();
  }, []);

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const totalPages = Math.ceil(sortedScores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedScores.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        overflow: 'auto',
        textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
        paddingBottom: 80,
      }}
    >
      <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'underline', fontSize: 14 }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: '32px', textAlign: 'center', marginTop: 20 }}>
          🏆 OG Leaderboard
        </h1>

        <div style={{ marginTop: 30, overflowX: 'auto', maxWidth: '100%' }}>
          {currentItems.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.8 }}>No scores yet.</p>
          ) : (
            <table style={{
              width: '100%',
              minWidth: 500,
              borderCollapse: 'collapse',
              fontSize: 14
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.4)' }}>
                  <th style={{ textAlign: 'left', padding: 12 }}>#</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Wallet</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Score</th>
                  <th style={{ textAlign: 'center', padding: 12 }}>X</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(([wallet, score], index) => (
                  <tr key={wallet} style={{
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    transition: 'background 0.3s',
                  }}>
                    <td style={{ padding: 12 }}>{startIndex + index + 1}</td>
                    <td style={{ padding: 12 }}>{wallet.slice(0, 4)}...{wallet.slice(-4)}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>{score}</td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      {twitterMap[wallet] ? (
                        <a
                          href={`https://x.com/${twitterMap[wallet]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: 13 }}
                        >
                          @{twitterMap[wallet]}
                        </a>
                      ) : (
                        <span style={{ opacity: 0.3 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: 40,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 8
        }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid white',
              borderRadius: 6,
              color: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              style={{
                padding: '8px 16px',
                background: currentPage === i + 1 ? '#8b5cf6' : 'transparent',
                border: '1px solid white',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer',
                fontWeight: currentPage === i + 1 ? 'bold' : 'normal',
                boxShadow: currentPage === i + 1 ? '0 0 8px rgba(139, 92, 246, 0.5)' : 'none',
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: '1px solid white',
              borderRadius: 6,
              color: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
