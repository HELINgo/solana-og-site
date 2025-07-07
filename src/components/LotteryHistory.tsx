import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface HistoryItem {
  id: string;
  wallet: string;
  amount: number;
  number: number;
  twitter: string | null;
  round_time: string;
}

const LotteryHistory = () => {
  const [records, setRecords] = useState<HistoryItem[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    const fetchTotal = async () => {
      const { count, error } = await supabase
        .from('lottery_history')
        .select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        setTotal(count);
      }
    };
    fetchTotal();
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from('lottery_history')
        .select('*')
        .order('round_time', { ascending: false })
        .range(from, to);
      if (!error && data) {
        setRecords(data);
      }
    };
    fetchHistory();
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-white/10 p-6 rounded-2xl shadow-xl text-white">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        📜 Historical lottery records
      </h2>

      {records.length === 0 ? (
        <p className="text-gray-400">No record yet</p>
      ) : (
        <div className="space-y-3">
          {records.map((item) => (
            <div
              key={item.id}
              className="bg-black/30 px-4 py-3 rounded-lg flex flex-wrap items-center justify-between text-sm shadow-md"
            >
              <div className="flex items-center gap-2">
                <span>🎯</span>
                <span
                  className="cursor-pointer text-purple-300 hover:underline"
                  onClick={() => {
                    navigator.clipboard.writeText(item.wallet);
                    alert('Address copied：' + item.wallet);
                  }}
                >
                  {item.wallet.slice(0, 4)}...{item.wallet.slice(-4)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span>📎</span>
                {item.twitter ? (
                  <a
                    href={`https://x.com/${item.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    @{item.twitter}
                  </a>
                ) : (
                  <span className="text-gray-400">Not bound</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span>🎟</span>
                <span>{item.number}</span>
              </div>

              <div className="flex items-center gap-2">
                <span>💰</span>
                <span className="text-yellow-300">{item.amount} SOL</span>
              </div>

              <div className="flex items-center gap-2">
                <span>🕒</span>
                <span>{new Date(item.round_time).toLocaleString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ Pagination buttons */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous page
        </button>
        <span className="text-sm text-white"></span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Next page
        </button>
      </div> {/* ✅ Pagination end */}

      {/* ✅ Scratch Card Rules section */}
      <div className="mt-10 text-white text-center px-4">
        <h2 className="text-2xl font-bold mb-4">🎮 Scratch Card Rules 🎮</h2>
        <div className="max-w-3xl mx-auto text-left text-sm sm:text-base leading-snug sm:leading-relaxed space-y-1">
  <p>1. Scratch Card is a brand new entertainment and leisure game on SOLANA 🎮 aims to make every player happy 🥳 help players relax 😎 and earn points.</p>
  <p>2. Each round of scratch card is 24 hours. Every 24 hours, the lucky number will be automatically selected and the prize will be taken away 💰</p>
  <p>3. Each player can buy 1-10 lucky numbers at a price of 0.01 SOL.</p>
  <p>4. Players will transfer SOL to the fund pool by purchasing numbers. In each round, one player will take away 95% of the prize pool. The remaining 5% will continue to remain in the prize pool for the next round. The initial balance is 5%.</p>
  <p>5. Each number purchased can get 0.03 points, which can be viewed in the points ranking list.</p>
  <p>6. The scratch card game guarantees a series of fairness. The code will be open source. Nothing more than to manipulate everything.</p>
  <p>7. Scratch cards are only used for entertainment and leisure games 🎮 It is prohibited to engage in illegal activities through scratch cards. We will keep evidence and cooperate with relevant departments.</p>
</div>

      </div> {/* ✅ Rules outer container */}

   {/* ✅ Outer return container */}
</div>

  );
};

export default LotteryHistory;





