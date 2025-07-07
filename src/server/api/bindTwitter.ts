// pages/api/bindTwitter.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { wallet, twitter } = req.body;

  if (!wallet || !twitter) {
    return res.status(400).json({ success: false, error: '缺少参数' });
  }

  try {
    const { error } = await supabase
      .from('lottery_entries')
      .update({ twitter })
      .eq('wallet', wallet)
      .order('time', { ascending: false })
      .limit(1);

    if (error) throw error;

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('❌ 绑定失败:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
