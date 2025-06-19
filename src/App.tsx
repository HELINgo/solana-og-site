// src/App.tsx
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Home from './pages/Home';
import MainApp from './pages/MainApp';
import Leaderboard from './Leaderboard';
import OGTools from './pages/GTools'; // ✅ 修复了文件名

function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<MainApp />} />
        <Route path="/home" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/og-tools" element={<OGTools />} />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
