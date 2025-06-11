// src/App.tsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import MainApp from "./pages/MainApp";
import GTools from "./pages/GTools";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainApp />} />
      <Route path="/og-tools" element={<GTools />} />
    </Routes>
  );
};

export default App;
