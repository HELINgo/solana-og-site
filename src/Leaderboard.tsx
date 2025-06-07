import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ITEMS_PER_PAGE = 25;

const Leaderboard: React.FC = () => {
  const [scores, setScores] = useState<{ [wallet: string]: number }>({});
  const [twitterMap, setTwitterMap] = useState<{ [wallet: string]: string }>({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const storedScores = JSON.parse(localStorage.getItem('scores') || '{}');
    const storedTwitter = JSON.parse(localStorage.getItem('twitterMap') || '{}');
    setScores(storedScores);
    setTwitterMap(storedTwitter);
  }, []);

  const sortedScores = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const totalPages = Math.ceil(sortedScores.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = sortedScores.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

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
      }}
    >
      <div style={{ padding: 40 }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'underline' }}>
          ← Back to Home
        </Link>

        <h1 style={{ fontSize: '36px', textAlign: 'center', marginTop: 20 }}>🏆 OG Leaderboard</h1>

        <div style={{ marginTop: 40, maxWidth: 1000, marginLeft: 'auto', marginRight: 'auto' }}>
          {currentItems.length === 0 ? (
            <p style={{ textAlign: 'center', opacity: 0.8 }}>No scores yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.3)' }}>
                  <th style={{ textAlign: 'left', padding: 10 }}>Rank</th>
                  <th style={{ textAlign: 'left', padding: 10 }}>Wallet</th>
                  <th style={{ textAlign: 'right', padding: 10 }}>Score</th>
                  <th style={{ textAlign: 'center', padding: 10 }}>X</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map(([wallet, score], index) => (
                  <tr key={wallet} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <td style={{ padding: 10 }}>{startIndex + index + 1}</td>
                    <td style={{ padding: 10 }}>{wallet.slice(0, 4)}...{wallet.slice(-4)}</td>
                    <td style={{ padding: 10, textAlign: 'right' }}>{score}</td>
                    <td style={{ padding: 10, textAlign: 'center' }}>
                      {twitterMap[wallet] ? (
                        <a
                          href={`https://x.com/${twitterMap[wallet]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#1DA1F2', textDecoration: 'underline', fontSize: 14 }}
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

        {/* 分页按钮 + 上一页/下一页 */}
        <div style={{ textAlign: 'center', marginTop: 30 }}>
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            style={{
              margin: '0 8px',
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid white',
              borderRadius: 6,
              color: 'white',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              opacity: currentPage === 1 ? 0.5 : 1
            }}
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i + 1)}
              style={{
                margin: '0 4px',
                padding: '6px 12px',
                background: currentPage === i + 1 ? '#8b5cf6' : 'transparent',
                border: '1px solid white',
                borderRadius: 6,
                color: 'white',
                cursor: 'pointer',
                fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
              }}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{
              margin: '0 8px',
              padding: '6px 12px',
              background: 'transparent',
              border: '1px solid white',
              borderRadius: 6,
              color: 'white',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              opacity: currentPage === totalPages ? 0.5 : 1
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

