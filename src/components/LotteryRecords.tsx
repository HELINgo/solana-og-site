import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchCurrentRoundId } from '../utils/fetchCurrentRoundId';
import toast from 'react-hot-toast';

interface RecordEntry {
  wallet: string;
  ticket_number: number;
  x?: string;
  created_at: string;
}

const PAGE_SIZE = 10;

const LotteryRecords = () => {
  const [records, setRecords] = useState<RecordEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRecords = async (page: number) => {
    const roundId = await fetchCurrentRoundId();
    if (!roundId) {
      console.error('❌ 无法获取当前轮次 ID');
      return;
    }

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    const { data, error, count } = await supabase
      .from('lottery_entries')
      .select('wallet, ticket_number, x, created_at', { count: 'exact' })
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('❌ 获取购买记录失败:', error.message);
      return;
    }

    setRecords(data || []);
    setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
  };

  useEffect(() => {
    fetchRecords(currentPage);
    const interval = setInterval(() => fetchRecords(currentPage), 10000);
    return () => clearInterval(interval);
  }, [currentPage]);

  return (
    <div className="bg-white/10 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">🖊 Current round of purchase records (24 hours）</h2>
      {records.length === 0 ? (
        <p className="text-gray-400">No record yet</p>
      ) : (
        <>
          {/* ⭐︎ 手机端出现横向滚动条，整行保持一条 */}
          <div className="overflow-x-auto">
            <table className="min-w-[750px] text-sm mb-4 whitespace-nowrap">
              <thead>
                <tr className="text-white border-b border-white/20">
                  <th className="py-2 text-left">address</th>
                  <th className="py-2 text-left">X Account</th>
                  <th className="py-2 text-left">Scratch Card Number</th>
                  <th className="py-2 text-left">time</th>
                </tr>
              </thead>
              <tbody>
                {records.map((entry, i) => (
                  <tr key={i} className="border-b border-white/10">
                    <td
                      className="py-2 text-purple-300 cursor-pointer"
                      title={entry.wallet}
                      onClick={() => {
                        navigator.clipboard.writeText(entry.wallet);
                        toast.success('Purchase address copied');
                      }}
                    >
                      {entry.wallet.slice(0, 4)}..{entry.wallet.slice(-4)}
                    </td>
                    <td className="py-2 text-indigo-300">
                      {entry.x ? (
                        <a
                          href={`https://x.com/${entry.x}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          @{entry.x}
                        </a>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="py-2 text-yellow-300">{entry.ticket_number}</td>
                    <td className="py-2 text-gray-400">
                      {new Date(entry.created_at).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'numeric',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 分页按钮 */}
          <div className="flex justify-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Previous page
            </button>

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              Next page
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LotteryRecords;





