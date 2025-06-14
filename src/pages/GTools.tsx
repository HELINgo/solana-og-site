// src/pages/OGTools.tsx
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
  if (diff <= 0) return '✅ 已上线';
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
      <div style={{ padding: 40, textAlign: 'center', color: 'white', backgroundColor: '#000', minHeight: '100vh' }}>
        <h2>❌ Access Denied</h2>
        <p>This page is for OG users only.</p>
        <button onClick={() => navigate('/')} style={{ marginTop: 20, padding: '10px 20px', border: 'none', borderRadius: 8, background: '#1DA1F2', color: 'white', cursor: 'pointer' }}>
          🔙 Go Back
        </button>
      </div>
    );
  }

  if (isOG === null) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000', color: 'white' }}>
        Loading...
      </div>
    );
  }

  const renderProjectCard = (project: ProjectItem, idx: number) => (
    <div key={project.id || idx} style={{ background: '#111', padding: 16, borderRadius: 12, marginBottom: 16, display: 'flex', gap: 12 }}>
      {project.logo && (
        <img src={project.logo} alt="logo" style={{ width: 64, height: 64, borderRadius: 8 }} />
      )}
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <strong>{idx + 1}. {project.name}</strong>
          <a href={project.twitter} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>X ↗</a>
        </div>
        <p style={{ fontSize: 12, opacity: 0.85 }}>{project.intro || '暂无简介'}</p>
        <p>链：{project.chain}</p>
        <p>热度值：{project.heat}</p>
        <p>上线时间：{formatCountdown(project.launch_time)}</p>
      </div>
    </div>
  );

  return (
    <div style={{ backgroundColor: '#000', color: 'white', minHeight: '100vh', padding: 40 }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <WalletMultiButton />
      </div>

      <h1 style={{ fontSize: 32, marginBottom: 20 }}>🚀 OG Tools</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
        <div>
          <h2>📊 热门代币项目排行</h2>
          {tokens.length === 0 ? <p>暂无数据</p> : tokens.map(renderProjectCard)}
        </div>
        <div>
          <h2>🎨 热门 NFT 项目排行</h2>
          {nfts.length === 0 ? <p>暂无数据</p> : nfts.map(renderProjectCard)}
        </div>
      </div>
    </div>
  );
};

export default OGTools;
