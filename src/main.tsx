import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import App from './App.tsx';
import Leaderboard from './Leaderboard.tsx';
import OGTools from './pages/GTools.tsx'; // ✅ 修正路径：从 ./OGTools.tsx 改成 ./pages/GTools.tsx

import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react';

import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  MathWalletAdapter,
  CoinbaseWalletAdapter,
  LedgerWalletAdapter
} from '@solana/wallet-adapter-wallets';

import '@solana/wallet-adapter-react-ui/styles.css';

const endpoint = 'https://mainnet.helius-rpc.com/?api-key=93707546-ed51-468e-ad92-7399bef01649';

const wallets = [
  new PhantomWalletAdapter(),
  new MathWalletAdapter(),
  new CoinbaseWalletAdapter(),
  new LedgerWalletAdapter()
];

const Loading = () => (
  <div
    style={{
      height: '100vh',
      backgroundColor: 'black',
      color: 'white',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      fontSize: '18px',
      textShadow: '1px 1px 2px black',
    }}
  >
    Loading NFTMEME...
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ConnectionProvider endpoint={endpoint}>
    <WalletProvider wallets={wallets} autoConnect>
      <WalletModalProvider>
        <BrowserRouter>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/og-tools" element={<OGTools />} /> {/* ✅ OG 专属页面 */}
            </Routes>
          </Suspense>
        </BrowserRouter>
      </WalletModalProvider>
    </WalletProvider>
  </ConnectionProvider>
);




















