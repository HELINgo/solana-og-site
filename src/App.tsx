// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast'; // ✅ 全局 toast 组件

import Home from './pages/Home';
import MainApp from './pages/MainApp';
import Leaderboard from './Leaderboard';
import OGTools from './pages/GTools'; // ✅ 修复了文件名
import Lottery from './pages/Lottery'; // ✅ 添加 Lottery 页面

function App() {
  const location = useLocation();

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<MainApp />} />
          <Route path="/home" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/og-tools" element={<OGTools />} />
          <Route path="/lottery" element={<Lottery />} /> {/* ✅ 添加 lottery 页面 */}
        </Routes>
      </AnimatePresence>

      <Toaster position="top-center" /> {/* ✅ 全局提示器 */}
    </>
  );
}

export default App;
