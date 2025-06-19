// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';

import {
  WalletModalProvider,
} from '@solana/wallet-adapter-react-ui';

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TokenPocketWalletAdapter,
  BitKeepWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import { BrowserRouter } from 'react-router-dom';

// ✅ 使用你的 Helius 主网 RPC
const network = 'https://mainnet.helius-rpc.com/?api-key=93707546-ed51-468e-ad92-7399bef01649';

const wallets = [
  new PhantomWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new SolflareWalletAdapter(),
  new BitKeepWalletAdapter(),
];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect={true}> {/* ✅ 自动连接 */}
        <WalletModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);



















