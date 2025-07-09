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
      console.error('Failed to read the last round of records:', error);
      return res.status(500).json({ success: false, message: 'Database query failed', error });
    }

    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Server internal error:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
}

