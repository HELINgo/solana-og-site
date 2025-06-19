import { supabase } from '../supabaseClient';
import { type FC, useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey } from '@solana/web3.js';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const MainApp: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const navigate = useNavigate();

  const [isOG, setIsOG] = useState(false);
  const [checkingOG, setCheckingOG] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [savedTwitter, setSavedTwitter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) setInviteCode(ref);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!publicKey) {
        setIsOG(false);
        setCheckingOG(false);
        return;
      }

      const wallet = publicKey.toBase58();

      const { data: ogData } = await supabase
        .from('og_list')
        .select('*')
        .eq('wallet', wallet)
        .maybeSingle();

      setIsOG(!!ogData);

      const { data: twitterData } = await supabase
        .from('twitter_handles')
        .select('handle')
        .eq('wallet', wallet)
        .maybeSingle();

      setSavedTwitter(twitterData?.handle || null);
      setCheckingOG(false);
    };

    fetchData();
  }, [publicKey]);

  const handleTransfer = async () => {
    if (!publicKey) return alert('Please connect your wallet first!');
    try {
      const recipient = new PublicKey('14L7Q9PnRccFzBQ28hA74S2BgeD6EUqdHgpSg9LFE1n');
      const lamports = 1 * 1e9;

      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: recipient, lamports })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'processed');

      const key = publicKey.toBase58();

      await supabase.from('og_list').upsert(
        { wallet: key, x_handle: savedTwitter ?? '' },
        { onConflict: 'wallet' }
      );

      const { data: existingScore } = await supabase
        .from('scores')
        .select('score')
        .eq('wallet', key)
        .maybeSingle();

      if (existingScore) {
        await supabase
          .from('scores')
          .update({ score: existingScore.score + 1 })
          .eq('wallet', key);
      } else {
        await supabase
          .from('scores')
          .insert({ wallet: key, score: 1 });
      }

      if (inviteCode && inviteCode !== key) {
        const { data: inviterScore } = await supabase
          .from('scores')
          .select('score')
          .eq('wallet', inviteCode)
          .maybeSingle();

        if (inviterScore) {
          await supabase
            .from('scores')
            .update({ score: inviterScore.score + 1 })
            .eq('wallet', inviteCode);
        } else {
          await supabase
            .from('scores')
            .insert({ wallet: inviteCode, score: 1 });
        }
      }

      setIsOG(true);
      alert('🎉 Transfer successful! You are now OG!');
    } catch (err: any) {
      console.error('Transfer failed:', err);
      alert(`❌ Transfer failed: ${err.message || err}`);
    }
  };

  const handleSaveTwitter = async () => {
    if (!publicKey || !twitterHandle.trim()) return;
    await supabase
      .from('twitter_handles')
      .upsert({ wallet: publicKey.toBase58(), handle: twitterHandle.trim() });
    setSavedTwitter(twitterHandle.trim());
    alert('✅ X handle linked successfully');
  };

  const handleCopy = () => {
    const url = `https://nftmeme001.com/?ref=${publicKey?.toBase58()}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const handleGoToTools = () => navigate('/og-tools');
  const handleGoHome = () => navigate('/');

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: 'url("/background.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        color: 'white',
        textShadow: '1px 1px 4px rgba(0,0,0,0.6)',
        overflowX: 'hidden',
        overflowY: 'auto',
        paddingBottom: 80,
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部：标题 + 钱包按钮 + 分栏 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', flexWrap: 'wrap' }}>
        <h1 style={{ fontSize: '28px', margin: 0 }}>🎨 NFTMEME</h1>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginTop: 8 }}>
          <WalletMultiButton />
          <button onClick={handleGoHome} style={{ padding: '6px 12px', borderRadius: 8, background: '#333', color: 'white', border: 'none' }}>🏠 Home</button>
          <a href="/leaderboard" style={{ padding: '6px 12px', borderRadius: 8, background: '#333', color: 'white', textDecoration: 'none' }}>🏆 View Leaderboard</a>
          <button onClick={handleGoToTools} style={{ padding: '6px 12px', borderRadius: 8, background: '#333', color: 'white', border: 'none' }}>🚀 Popular passwords</button>
        </div>
      </div>

      {/* NFT 图像和按钮区域 */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <motion.img
          src="/og-nft.png"
          alt="OG NFT"
          style={{ width: '60vw', maxWidth: '200px', height: 'auto', marginBottom: '30px', borderRadius: '9999px' }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
        />

        {!checkingOG && !isOG && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleTransfer}
            transition={{ duration: 0.2 }}
            style={{
              padding: '16px 32px',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '12px',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #00FFA3, #DC1FFF)',
              color: 'white',
              border: 'none',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
              backdropFilter: 'blur(10px)',
              marginBottom: 20,
            }}
          >
            🎖 Unlock OG Identity (1 SOL)
          </motion.button>
        )}

        {publicKey && isOG && (
          <div style={{ marginTop: 10, padding: 20, maxWidth: 340, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.2)', color: 'white', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20 }}>🎖️ You are already OG!</h2>
            <p style={{ fontSize: 14, opacity: 0.85 }}>Thank you for supporting NFTMEME.</p>
            <p onClick={handleCopy} style={{ marginTop: 20, fontSize: 12, cursor: 'pointer', textDecoration: 'underline', wordBreak: 'break-all' }}>
              Invite Link (click to copy):<br />
              <code>{`https://nftmeme001.com/?ref=${publicKey.toBase58()}`}</code><br />
              {copied && <span style={{ color: '#4ade80' }}>✅ Copied!</span>}
            </p>

            <div style={{ marginTop: 20 }}>
              {savedTwitter ? (
                <p style={{ fontSize: 12 }}>
                  ✅ X Linked: <a href={`https://x.com/${savedTwitter}`} target="_blank" rel="noopener noreferrer" style={{ color: '#1DA1F2' }}>@{savedTwitter}</a>
                </p>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Enter your X username"
                    value={twitterHandle}
                    onChange={(e) => setTwitterHandle(e.target.value)}
                    style={{ padding: '8px', borderRadius: '8px', border: 'none', width: '100%', marginBottom: '10px' }}
                  />
                  <button onClick={handleSaveTwitter} style={{ padding: '8px 16px', background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Bind X
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 底部链接 */}
      <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
        <a href="https://x.com/solananftmeme?s=21" target="_blank" rel="noopener noreferrer">
          <img src="/x-logo.png" alt="X" style={{ width: 32, height: 32 }} />
        </a>
        <a href="https://t.me/NFTMEME000" target="_blank" rel="noopener noreferrer">
          <img src="/tg-logo.png" alt="Telegram" style={{ width: 32, height: 32 }} />
        </a>
        <a href="https://t.me/NFTMEME001" target="_blank" rel="noopener noreferrer">
          <img src="/tg-logo.png" alt="Telegram" style={{ width: 32, height: 32 }} />
        </a>
        <a href="https://sites.google.com/view/nft001" target="_blank" rel="noopener noreferrer">
          <img src="/bai-logo.png" alt="Whitepaper" style={{ width: 32, height: 32, objectFit: 'contain' }} />
        </a>
      </div>
    </div>
  );
};

export default MainApp;
