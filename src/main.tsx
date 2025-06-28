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

// ✅ Solana 主网 RPC
const network = 'https://mainnet.helius-rpc.com/?api-key=93707546-ed51-468e-ad92-7399bef01649';

// ✅ 初始化钱包列表
const rawWallets = [
  new PhantomWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new SolflareWalletAdapter(),
  new BitKeepWalletAdapter(),
];

// ✅ 去重钱包名称（避免多个 MetaMask）
const seenNames = new Set();
const wallets = rawWallets.filter((wallet) => {
  if (seenNames.has(wallet.name)) {
    console.warn(`⚠️ 重复钱包已跳过: ${wallet.name}`);
    return false;
  }
  seenNames.add(wallet.name);
  return true;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect={true}>
        <WalletModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);




















