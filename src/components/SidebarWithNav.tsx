// src/components/SidebarWithNav.tsx
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useNavigate } from 'react-router-dom';

export default function SidebarWithNav() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col items-end space-y-3">
      {/* 钱包连接按钮 */}
      <WalletMultiButton />

      {/* 分栏按钮 */}
      <button
        onClick={() => navigate('/leaderboard')}
        className="bg-white text-black font-semibold px-4 py-2 rounded-lg shadow hover:scale-105 transition"
      >
        🏆 View Leaderboard
      </button>
      <button
        onClick={() => navigate('/og-tools')}
        className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:scale-105 transition"
      >
        🚀 Enter OG Tools
      </button>
    </div>
  );
}
