import { supabase } from './supabaseClient';
import { type FC, useEffect, useState } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SystemProgram, Transaction, PublicKey } from '@solana/web3.js';

const App: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [isOG, setIsOG] = useState(false);
  const [checkingOG, setCheckingOG] = useState(true);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [twitterHandle, setTwitterHandle] = useState('');
  const [savedTwitter, setSavedTwitter] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
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
        .single();

      const { data: twitterData } = await supabase
        .from('twitter_handles')
        .select('handle')
        .eq('wallet', wallet)
        .single();

      setIsOG(!!ogData);
      setSavedTwitter(twitterData?.handle || null);
      setCheckingOG(false);
    };

    fetchData();
  }, [publicKey]);

  const handleTransfer = async () => {
    if (!publicKey) return alert('Please connect your wallet first!');
    try {
      const recipient = new PublicKey('14L7Q9PnRccFzBQ28hA74S2BgeD6EUqdHgpSg9LFE1n');
      const lamports = 0.01 * 1e9;
      const transaction = new Transaction().add(
        SystemProgram.transfer({ fromPubkey: publicKey, toPubkey: recipient, lamports })
      );
      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      const key = publicKey.toBase58();
      await supabase.from('og_list').insert({ wallet: key });

      if (inviteCode && inviteCode !== key) {
        const { data, error } = await supabase
          .from('scores')
          .select('score')
          .eq('wallet', inviteCode)
          .single();

        if (!error && data) {
          const updatedScore = (data.score || 0) + 1;
          await supabase.from('scores').update({ score: updatedScore }).eq('wallet', inviteCode);
        } else {
          await supabase.from('scores').insert({ wallet: inviteCode, score: 1 });
        }
      }

      setIsOG(true);
      alert('🎉 Transfer successful! You are now OG!');
    } catch (err: any) {
      console.error("Transfer failed:", err);
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

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, height: '100vh', width: '100vw', backgroundImage: 'url("/background.png")', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat', color: 'white', textShadow: '1px 1px 4px rgba(0,0,0,0.6)', overflow: 'auto' }}>
      <div style={{ position: 'absolute', top: 20, right: 20 }}><WalletMultiButton /></div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100%', paddingTop: 80, paddingBottom: 80 }}>
        <h1 style={{ fontSize: '40px', marginBottom: '10px' }}>🎨 NFTMEME</h1>
        <a href="/leaderboard" style={{ fontSize: '14px', color: '#ffffff', textDecoration: 'underline', marginBottom: '40px' }}>View Leaderboard</a>

        {!checkingOG && !isOG && (
          <button onClick={handleTransfer} style={{ padding: '16px 32px', fontSize: '18px', fontWeight: 'bold', borderRadius: '12px', cursor: 'pointer', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', color: 'white', border: 'none', boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)', transition: 'all 0.3s ease' }}
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}>
            Obtain OG identity (interaction fee 0.01SOL)
          </button>
        )}

        {publicKey && isOG && (
          <div style={{ marginTop: 40, padding: 20, maxWidth: 340, background: 'rgba(255, 255, 255, 0.1)', borderRadius: 16, boxShadow: '0 8px 20px rgba(0,0,0,0.2)', color: 'white', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 20 }}>🎖️ You are already OG!</h2>
            <p style={{ fontSize: 14, opacity: 0.85 }}>Thank you for supporting NFTMEME.</p>

            <img
              src="/og-badge.png"
              alt="OG Badge"
              style={{
                width: 100,
                height: 100,
                marginTop: 20,
                borderRadius: 12,
                boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              }}
            />

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
                  <input type="text" placeholder="Enter your X username" value={twitterHandle} onChange={(e) => setTwitterHandle(e.target.value)} style={{ padding: '8px', borderRadius: '8px', border: 'none', width: '100%', marginBottom: '10px' }} />
                  <button onClick={handleSaveTwitter} style={{ padding: '8px 16px', background: '#1DA1F2', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    Bind X
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', gap: 16, zIndex: 10 }}>
        <a href="https://x.com/solananftmeme?s=21" target="_blank" rel="noopener noreferrer">
          <img src="/x-logo.png" alt="X" style={{ width: 32, height: 32 }} />
        </a>
        <a href="https://t.me/NFTMEME000" target="_blank" rel="noopener noreferrer">
          <img src="/tg-logo.png" alt="Telegram" style={{ width: 32, height: 32 }} />
        </a>
        <a href="https://t.me/NFTMEME001" target="_blank" rel="noopener noreferrer">
          <img src="/tg-logo.png" alt="Telegram" style={{ width: 32, height: 32 }} />
        </a>
      </div>
    </div>
  );
};

export default App;
