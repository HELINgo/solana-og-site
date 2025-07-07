import { useEffect, useState } from 'react';
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import toast from 'react-hot-toast';

import { supabase } from '../lib/supabase';
import LotteryRecords from '../components/LotteryRecords';
import LotteryHistory from '../components/LotteryHistory';
import LastWinner from '../components/LastWinner';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n'; // 确保路径正确

const PROGRAM_ADDRESS = '97WhTiopMEqN8mf8hdrWq78nLn3FbMwAiBdm4DEwpyaq';
const BACKEND_DEV_ADDRESS = '14L7Q9PnRccFzBQ28hA74S2BgeD6EUqdHgpSg9LFE1n';

const Lottery = () => {
  const { publicKey, sendTransaction, connected } = useWallet();
  const [buyCount, setBuyCount] = useState(1);
  const [xHandle, setXHandle] = useState('');
  const [savedX, setSavedX] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [poolBalance, setPoolBalance] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasReloaded, setHasReloaded] = useState(false);
  const { t } = useTranslation(); 

  const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=93707546-ed51-468e-ad92-7399bef01649");

  const getCurrentRoundId = async (): Promise<string | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lottery_rounds')
      .select('id')
      .lte('start_time', now)
      .gte('end_time', now)
      .maybeSingle();

    if (error || !data) {
      console.error('轮次查询失败:', error);
      return null;
    }

    return data.id;
  };

  useEffect(() => {
    if (!connected || !publicKey) return;
    const fetchBalances = async () => {
      try {
        const [pool, wallet] = await Promise.all([
          connection.getBalance(new PublicKey(PROGRAM_ADDRESS)),
          connection.getBalance(publicKey),
        ]);
        setPoolBalance(pool / LAMPORTS_PER_SOL);
        setWalletBalance(wallet / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error('余额读取失败：', e);
      }
    };
    fetchBalances();
    const interval = setInterval(fetchBalances, 5000);
    return () => clearInterval(interval);
  }, [connected, publicKey]);

  useEffect(() => {
    if (!publicKey) return;
    const fetchX = async () => {
      const { data, error } = await supabase
        .from('x_handles')
        .select('x')
        .eq('wallet', publicKey.toBase58())
        .maybeSingle();
      if (data?.x) {
        setSavedX(data.x);
        setXHandle(data.x);
      }
      if (error) console.error('读取 x 失败:', error);
    };
    fetchX();
  }, [publicKey]);

  useEffect(() => {
  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('lottery_rounds')
      .select('end_time')
      .eq('status', 'open')
      .order('start_time', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data && data.end_time) {
      const rawEndTime = new Date(data.end_time);
      const beijingEndTime = new Date(rawEndTime.getTime() + 8 * 60 * 60 * 1000);
      const now = new Date();
      const secondsLeft = Math.floor((beijingEndTime.getTime() - now.getTime()) / 1000);
      setTimeLeft(secondsLeft);

      if (secondsLeft <= 0 && !hasReloaded) {
        setHasReloaded(true);
        setTimeout(() => {
          window.location.reload();
        }, 3000); // ✅ 延迟 3 秒刷新，避免 Supabase 数据延迟未更新时误刷
      }
    }
  }, 1000);

  return () => clearInterval(interval); // ✅ 正确放置在 useEffect 外层 return 位置
}, [hasReloaded]);


  const formatTime = (seconds: number) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0');
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  const getExistingTicketNumbers = async (roundId: string): Promise<number[]> => {
    const { data, error } = await supabase
      .from('lottery_entries')
      .select('ticket_number')
      .eq('round_id', roundId);

    if (error) {
      console.error('读取已存在号码失败:', error);
      return [];
    }

    return data.map((row: any) => row.ticket_number);
  };

  const generateUniqueTicketNumbers = async (
    roundId: string,
    count: number
  ): Promise<number[]> => {
    const existingNumbers = await getExistingTicketNumbers(roundId);
    const uniqueNumbers: Set<number> = new Set(existingNumbers);
    const newNumbers: number[] = [];

    while (newNumbers.length < count) {
      const num = Math.floor(Math.random() * 1000000);
      if (!uniqueNumbers.has(num)) {
        uniqueNumbers.add(num);
        newNumbers.push(num);
      }
    }

    return newNumbers;
  };

  const handleBindX = async () => {
    if (!publicKey) return toast.error('请先连接钱包');
    const x = xHandle.trim().replace(/^@/, '');
    if (!x) return toast.error('请输入你的 X 用户名');

    const { error } = await supabase
  .from('x_handles')
  .upsert(
    [{
      wallet: publicKey.toBase58(),
      x: x, // 显式指定字段
    }],
    {
      onConflict: 'wallet', // ✅ 注意这里是字符串，而不是数组
    }
  );

    if (!error) {
      setSavedX(x);
      toast.success('✅ 绑定成功');
    } else {
      console.error('绑定失败', error);
      toast.error('❌ 绑定失败');
    }
  };

  const handleBuy = async () => {
    if (!publicKey || !sendTransaction) return toast.error('请先连接钱包');
    if (buyCount < 1 || buyCount > 10) return toast.error('购买数量需在 1~10 之间');
    if (!savedX) return toast.error('请先绑定 X 账号');

    setLoading(true);
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(PROGRAM_ADDRESS),
          lamports: buyCount * 0.01 * LAMPORTS_PER_SOL,
        }),
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(BACKEND_DEV_ADDRESS),
          lamports: 0.01 * LAMPORTS_PER_SOL,
        })
      );
      const sig = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(sig, 'confirmed');
      toast.success('✅ 购买成功');

      const roundId = await getCurrentRoundId();
      if (!roundId) return toast.error('❌ 当前无有效轮次');

      const ticketNumbers = await generateUniqueTicketNumbers(roundId, buyCount);
      const insertData = ticketNumbers.map((num) => ({
        wallet: publicKey.toBase58(),
        round_id: roundId,
        ticket_number: num,
        amount: 0.01,
        dev_fee_paid: true,
        x: savedX,
      }));

            const { error } = await supabase.from('lottery_entries').insert(insertData);
      if (error) {
        console.error(error);
        toast.error('❌ 分配失败');
      } else {
        toast.success(`🎉 分配号码：${ticketNumbers.join(', ')}`);
        
        // ✅ 积分更新调用
        try {
          const { updateScore } = await import('../utils/updateScore'); // 动态引入
          await updateScore(publicKey.toBase58(), buyCount);
        } catch (err) {
          console.error('积分写入失败', err);
        }
      }

    } catch (err) {
      console.error('转账失败', err);
      toast.error('❌ 转账失败');
    }
    setLoading(false);
  };

  return (
    <div className="relative w-full min-h-screen text-white overflow-x-hidden"
      style={{
        backgroundImage: "url('/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}>
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />

      <div className="fixed top-2 left-1/2 transform -translate-x-1/2 z-40 text-center">
  <h2 className="text-2xl font-semibold text-yellow-300 mb-2">{t('🎉lastwinner')}</h2>
  <LastWinner />
</div>

  <div className="fixed top-4 right-4 z-50 flex items-center gap-3">
  {/* 钱包连接按钮 */}
  <WalletMultiButton />

  {/* 返回主页按钮 */}
  <a
    href="/"
    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:scale-105 transition-transform"
  >
    {t('back_home')}
  </a>
</div>



{/* 顶部钱包按钮 + 返回主页 */}
<div className="px-4 pt-4">
  <div className="flex items-center gap-3">
    <WalletMultiButton />
    <a
      href="/"
      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold px-4 py-2 rounded-xl shadow hover:scale-105 transition-transform"
    >
      {t('back_home')}
    </a>
    <select
  value={i18n.language} // ✅ 关键点在这里
  onChange={(e) => i18n.changeLanguage(e.target.value)}
  className="bg-black/60 text-white border border-white/30 px-3 py-1 rounded-xl shadow"
>
  <option value="zh">Chinese</option>
  <option value="en">English</option>
</select>


  </div>

  {/* 👇 移到下方靠左显示 */}
  <div className="mt-3 bg-white/10 text-white px-4 py-3 rounded-xl shadow text-sm space-y-1 w-fit">
    <p>{t('pool')}<span className="text-yellow-300 font-semibold">{poolBalance.toFixed(2)} SOL</span></p>
    <p>🪙 {t('walletbalance')}：<span className="text-green-300">{walletBalance.toFixed(3)} SOL</span></p>
    <p> {t('countdown')}<span className="text-blue-300">{formatTime(timeLeft)}</span></p>
  </div>
</div>



      {connected && (
        <>
          {/* 购票卡片 */}
          <div className="flex justify-center mt-[30px] mb-[20px]">
            <div className="bg-white/10 p-6 rounded-2xl shadow-xl max-w-xl w-full">
              <label className="block mb-3 text-white font-medium text-sm"> {t('buy_quantity')}</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={buyCount}
                  onChange={(e) => setBuyCount(parseInt(e.target.value))}
                  className="bg-black/40 text-white px-4 py-2 rounded-xl border border-white/20 w-28 text-center"
                />
                <button
                  onClick={handleBuy}
                  disabled={loading}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition-transform"
                >
                  {loading ? t('buying') : ` ${t('buy_now')}`}
                </button>
              </div>
            </div>
          </div>

          {/* 绑定 X 账号区域 */}
          <div className="flex justify-center">
            <div className="bg-white/10 p-6 rounded-2xl mb-12 max-w-2xl w-full shadow-xl">
              {savedX ? (
                <p className="text-green-400 font-medium"> {t('bind_success')}@{savedX}</p>
              ) : (
                <>
                  <label className="block mb-2 text-white font-semibold">{t('bind_x')}</label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      value={xHandle}
                      onChange={(e) => setXHandle(e.target.value)}
                      placeholder="@yourhandle"
                      className="bg-white/20 border text-white px-4 py-2 rounded-xl w-full"
                    />
                    <button
                      onClick={handleBindX}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl font-semibold"
                    >
                      {t('bind_btn')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* 展示记录组件 */}
      <div className="max-w-5xl mx-auto w-full space-y-10 px-4">
        <LotteryRecords />
        <LotteryHistory />
      </div>
    </div>
  );
};

export default Lottery;
