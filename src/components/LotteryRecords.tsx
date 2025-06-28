import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

  const fetchCurrentRoundId = async (): Promise<string | null> => {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('lottery_rounds')
      .select('id')
      .lte('start_time', now)
      .gte('end_time', now)
      .maybeSingle();

    if (error || !data) {
      console.error('获取当前轮次失败:', error);
      return null;
    }
    return data.id;
  };

  const fetchRecords = async (page: number) => {
    const roundId = await fetchCurrentRoundId();
    if (!roundId) return;

    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    // 获取当前页数据
    const { data, error } = await supabase
      .from('lottery_entries')
      .select('wallet, ticket_number, x, created_at', { count: 'exact' })
      .eq('round_id', roundId)
      .order('created_at', { ascending: false })
      .range(from, to);

    // 获取总条数
    const { count } = await supabase
      .from('lottery_entries')
      .select('*', { count: 'exact', head: true })
      .eq('round_id', roundId);

    if (error) {
      console.error('读取记录失败:', error);
    } else {
      setRecords(data || []);
      setTotalPages(Math.ceil((count || 0) / PAGE_SIZE));
    }
  };

  useEffect(() => {
    fetchRecords(currentPage);
    const interval = setInterval(() => fetchRecords(currentPage), 10000);
    return () => clearInterval(interval);
  }, [currentPage]);

  return (
    <div className="bg-white/10 p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-bold mb-4">🖊 当前轮购买记录（24小时）</h2>
      {records.length === 0 ? (
        <p className="text-gray-400">暂无记录</p>
      ) : (
        <>
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-white border-b border-white/20">
                <th className="py-2 text-left">地址</th>
                <th className="py-2 text-left">X 账号</th>
                <th className="py-2 text-left">彩票号码</th>
                <th className="py-2 text-left">时间</th>
              </tr>
            </thead>
            <tbody>
              {records.map((entry, i) => (
                <tr key={i} className="border-b border-white/10">
                  <td className="py-2 text-purple-300">{entry.wallet.slice(0, 4)}..{entry.wallet.slice(-4)}</td>
                  <td className="py-2 text-indigo-300">
                    {entry.x ? (
                      <a href={`https://x.com/${entry.x}`} target="_blank" rel="noopener noreferrer">@{entry.x}</a>
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

          {/* 分页按钮 */}
          <div className="flex justify-center gap-4">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              上一页
            </button>
            <span className="text-white pt-2">第 {currentPage} 页 / 共 {totalPages} 页</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default LotteryRecords;

