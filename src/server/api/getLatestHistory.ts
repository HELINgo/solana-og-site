// pages/api/getLatestHistory.ts
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { data, error } = await supabase
      .from('lottery_history')
      .select('id, wallet, amount, number, twitter, round_time')
      .order('round_time', { ascending: false })
      .limit(1); // ✅ 只查1条

    if (error) {
      console.error('读取上一轮记录失败:', error);
      return res.status(500).json({ success: false, message: '数据库查询失败', error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('服务器内部错误:', err);
    res.status(500).json({ success: false, message: '服务器错误', error: err });
  }
}

