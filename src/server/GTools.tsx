import { type FC, useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet } from '@solana/wallet-adapter-react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface ProjectItem {
  id?: string;
  name: string;
  chain: string;
  heat: number;
  launch_time: string;
  twitter: string;
  logo?: string;
  intro?: string;
}

const formatCountdown = (dateStr: string) => {
  const now = new Date();
  const launch = new Date(dateStr);
  const diff = launch.getTime() - now.getTime();
  if (diff <= 0) return '✅ Already online';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `⏳ ${hours}h ${mins}m`;
};

const OGTools: FC = () => {
  const { publicKey } = useWallet();
  const [isOG, setIsOG] = useState<boolean | null>(null);
  const [tokens, setTokens] = useState<ProjectItem[]>([]);
  const [nfts, setNfts] = useState<ProjectItem[]>([]);
  const navigate = useNavigate();

  const getTimeScore = (launchTime: string) => {
    const now = new Date();
    const launch = new Date(launchTime);
    const diffHours = (launch.getTime() - now.getTime()) / (1000 * 60 * 60);
    return Math.max(0, 1000 - Math.abs(diffHours));
  };

  const fetchLeaderboardData = async () => {
    const [{ data: tokenData }, { data: nftData }] = await Promise.all([
      supabase.from('token_leaderboard').select('*'),
      supabase.from('nft_leaderboard').select('*'),
    ]);

    if (tokenData) {
      const sorted = [...tokenData].sort((a, b) => {
        const aScore = a.heat + getTimeScore(a.launch_time);
        const bScore = b.heat + getTimeScore(b.launch_time);
        return bScore - aScore;
      });
      setTokens(sorted);
    }

    if (nftData) {
      const sorted = [...nftData].sort((a, b) => {
        const aScore = a.heat + getTimeScore(a.launch_time);
        const bScore = b.heat + getTimeScore(b.launch_time);
        return bScore - aScore;
      });
      setNfts(sorted);
    }
  };

  useEffect(() => {
    fetchLeaderboardData();
    const interval = setInterval(fetchLeaderboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkOGStatus = async () => {
      if (!publicKey) {
        setIsOG(false);
        return;
      }
      const { data } = await supabase
        .from('og_list')
        .select('*')
        .eq('wallet', publicKey.toBase58())
        .maybeSingle();
      setIsOG(!!data);
    };
    checkOGStatus();
  }, [publicKey]);

  if (isOG === false) {
    return (
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        padding: 40,
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: 28, marginBottom: 16 }}>❌ Access Denied</h2>
        <p style={{ fontSize: 14, opacity: 0.9, marginBottom: 20 }}>This page is for OG users only.</p>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            fontSize: 14,
            borderRadius: 8,
            background: '#1DA1F2',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
          }}
        >
          🔙 Back to Home
        </button>
      </div>
    );
  }

  if (isOG === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#000',
        color: 'white'
      }}>
        Verifying OG identity...
      </div>
    );
  }

  const renderProjectCard = (project: ProjectItem, idx: number) => (
    <div key={project.id || idx} style={{
      background: '#111',
      padding: 16,
      borderRadius: 12,
      marginBottom: 16,
      display: 'flex',
      gap: 12
    }}>
      {project.logo && (
        <img src={project.logo} alt="logo"
          style={{ width: 64, height: 64, borderRadius: 8 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong>{idx + 1}. {project.name}</strong>
          <a href={project.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>X ↗</a>
        </div>
        <p style={{ fontSize: 12, opacity: 0.85 }}>{project.intro || 'No introduction'}</p>
        <p>chain：{project.chain}</p>
        <p>Heat value：{project.heat}</p>
        <p>Online time：{formatCountdown(project.launch_time)}</p>
      </div>
    </div>
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      height: '100vh',
      width: '100vw',
      overflow: 'auto',
      backgroundImage: 'url("/background.png")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      color: 'white',
      textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
    }}>
      <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
        {/* Wallet & 分栏导航 */}
        <div style={{ position: 'fixed', top: 20, right: 20, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <WalletMultiButton />
          <div style={{
            marginTop: 10,
            background: 'rgba(255, 255, 255, 0.1)',
            padding: 10,
            borderRadius: 12,
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            fontSize: 14
          }}>
            <a href="/" style={{ color: '#fff', textDecoration: 'none' }}>🏠 Home</a>
            <a href="/leaderboard" style={{ color: '#00FFFF', textDecoration: 'none' }}>🏆 View Leaderboard</a>
            <a href="/og-tools" style={{ color: '#1DA1F2', textDecoration: 'none' }}>🚀 Popular wealth</a>
          </div>
        </div>

        <h1 style={{ fontSize: 36, textAlign: 'center', marginBottom: 30 }}>🚀 Popular wealth</h1>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
        }}>
          <div>
            <h2>📊 Popular Token Project Ranking</h2>
            {tokens.length === 0 ? <p>No data yet</p> : tokens.map(renderProjectCard)}
          </div>
          <div>
            <h2>🎨 Popular NFT Project Ranking</h2>
            {nfts.length === 0 ? <p>No data yet</p> : nfts.map(renderProjectCard)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OGTools;

