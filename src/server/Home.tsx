import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import "../index.css";


function Home() {
  return (
    <div
      className="fixed inset-0 overflow-hidden bg-cover bg-center text-white"
      style={{ backgroundImage: 'url(\"/background.png\")' }}
    >
      {/* 顶部右上角连接钱包按钮 */}
      <div className="absolute top-6 right-8 z-10">
        <WalletMultiButton />
      </div>

      {/* 中间内容区域 */}
      <div className="flex flex-col items-center justify-center h-full gap-10">
        {/* 项目标题 */}
        <h1 className="text-4xl font-bold tracking-wide">🎨 NFTMEME</h1>

        {/* 旋转 OG NFT 图标 */}
        <motion.img
          src="/og-nft.png"
          alt="OG NFT"
          className="w-56 h-56 object-contain rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />

        {/* View Leaderboard 跳转 */}
        <Link
          to="/leaderboard"
          className="text-sm underline text-white hover:text-gray-200 transition"
        >
          View Leaderboard
        </Link>

        {/* 解锁按钮（无功能，仅展示） */}
        <button className="bg-gradient-to-r from-green-400 to-pink-500 text-white px-6 py-3 text-lg font-bold rounded-full shadow-xl hover:scale-105 transition">
          🪙 Unlock OG Identity (1 SOL)
        </button>
      </div>
    </div>
  );
}

export default Home;
