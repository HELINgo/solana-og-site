// components/LastWinner.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const LastWinner = () => {
  const [winner, setWinner] = useState<any>(null);

  useEffect(() => {
    const fetchLastWinner = async () => {
      const { data, error } = await supabase
        .from('lottery_history')
        .select('*')
        .order('round_time', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('获取中奖者失败:', error);
        return;
      }

      setWinner(data);
    };

    fetchLastWinner();
  }, []);

  if (!winner) return null;

  return (
    <div className="flex justify-center mt-6 mb-6">
      <div className="bg-gradient-to-r from-yellow-600 via-pink-500 to-purple-600 text-white px-6 py-4 rounded-2xl shadow-xl text-center w-full max-w-3xl">
        <p className="text-lg font-medium">
          🎯 幸运号码：<span className="font-extrabold text-white">{winner.number}</span>
        </p>
        <p className="text-md mt-1">
          👤 中奖者：
          {winner.twitter ? (
            <a
              href={`https://x.com/${winner.twitter}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-yellow-200"
            >
              @{winner.twitter}
            </a>
          ) : (
            <span className="text-gray-300">未绑定</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default LastWinner;






