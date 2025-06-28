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
        📜 历史开奖记录
      </h2>

      {records.length === 0 ? (
        <p className="text-gray-400">暂无记录</p>
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
                    alert('地址已复制：' + item.wallet);
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
                  <span className="text-gray-400">未绑定</span>
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

      {/* 分页按钮 */}
      <div className="flex justify-center mt-6 gap-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
        >
          上一页
        </button>
        <span className="text-sm text-white">
          第 {page} 页 / 共 {totalPages} 页
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50"
        >
          下一页
        </button>
      </div>
    </div>
  );
};

export default LotteryHistory;




