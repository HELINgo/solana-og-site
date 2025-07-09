import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// ✅ 使用 service_role 权限
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { wallet, count } = req.body;

  // ✅ 第2步：添加调用日志
  console.log('📩 Points update request received:', wallet, count);

  if (!wallet || !count) {
    return res.status(400).json({ success: false, message: 'Incomplete parameters' });
  }

  try {
    // ✅ 每张彩票 0.03 积分
    const totalScore = count * 0.03;

    // ✅ 调用积分函数并打印返回结果
    const { data, error } = await supabase.rpc('add_or_update_score', {
      addr: wallet,
      delta: totalScore,
    });

    console.log('📤 Supabase RPC return:', { data, error }); // ✅ 添加调试日志

    if (error) {
      console.error('❌ The integral function call failed:', error);
      return res.status(500).json({ success: false, message: 'Points update failed' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('❌ Failed to update points:', err);
    res.status(500).json({ success: false, message: 'Points writing exception' });
  }
}


