import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import '@solana/wallet-adapter-react-ui/styles.css';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';

import {
  PhantomWalletAdapter,
  TokenPocketWalletAdapter,
  SolflareWalletAdapter,
  BitKeepWalletAdapter,
} from '@solana/wallet-adapter-wallets';

import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { BrowserRouter } from 'react-router-dom';

/* ✅ Solana 主网 RPC */
const network =
  'https://mainnet.helius-rpc.com/?api-key=93707546-ed51-468e-ad92-7399bef01649';

/* ✅ 初始化钱包列表 —— 这里的顺序 = 弹窗显示顺序
   1. Phantom
   2. WalletConnect
   3. Solflare
   4. TokenPocket
   5. BitKeep
*/
const rawWallets = [
  new PhantomWalletAdapter(),

  // ⭐ WalletConnect（一次囊括 OKX / Binance / Trust…，并排除 MetaMask）
  new WalletConnectWalletAdapter({
    network: WalletAdapterNetwork.Mainnet,
    options: {
      projectId: import.meta.env.VITE_WC_PROJECT_ID as string,
      metadata: {
        name: 'NFTMEME',
        description: 'NFTMEME OG site',
        url: 'https://nftmeme001.com',
        icons: ['https://nftmeme001.com/logo.png'],
      },
      // 👇 关键：排除 MetaMask，避免重复
      excludeWalletIds: ['metamask'],
    },
  }),

  new SolflareWalletAdapter(),
  new TokenPocketWalletAdapter(),
  new BitKeepWalletAdapter(),
];

/* ✅ 去重钱包名称（避免重复显示） */
const seenNames = new Set<string>();
const wallets = rawWallets.filter((wallet) => {
  if (seenNames.has(wallet.name)) return false;
  seenNames.add(wallet.name);
  return true;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={network}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>,
);






















