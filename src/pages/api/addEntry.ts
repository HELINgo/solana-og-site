import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

// ✅ 使用 service_role 权限
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { wallet, count } = req.body;

  // ✅ 第2步：添加调用日志
  console.log('📩 积分更新请求收到:', wallet, count);

  if (!wallet || !count) {
    return res.status(400).json({ success: false, message: '参数不完整' });
  }

  try {
    // ✅ 每张彩票 0.03 积分
    const totalScore = count * 0.03;

    // ✅ 调用积分函数
    const { error } = await supabase.rpc('add_or_update_score', {
      addr: wallet,
      delta: totalScore,
    });

    if (error) {
      console.error('❌ 积分函数调用失败:', error);
      return res.status(500).json({ success: false, message: '积分更新失败' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ 更新积分失败:', err);
    res.status(500).json({ success: false, message: '积分写入异常' });
  }
}


