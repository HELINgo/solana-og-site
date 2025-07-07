// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast'; // ✅ 全局 toast 组件

import Home from './server/Home'; // ✅ 修改路径
import MainApp from './server/MainApp'; // ✅ 修改路径
import Leaderboard from './Leaderboard';
import OGTools from './server/GTools'; // ✅ 修改路径
import Lottery from './server/Lottery'; // ✅ 修改路径

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
