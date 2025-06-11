// api/updateLeaderboard.ts

import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabase = createClient(
  'https://vpinbblavyiryvdoyvsn.supabase.co',
  '你的 Supabase anon 公钥' // 推荐设置为环境变量
);

// 提取 Twitter 用户名
const extractHandle = (url: string) => {
  const match = url.match(/x\.com\/([^\/]+)/);
  return match ? match[1] : null;
};

// 模拟热度（可改为真实 API）
const getMockHeat = async (handle: string) => {
  return Math.floor(Math.random() * 10000 + 5000);
};

// 更新一个表
const updateLeaderboard = async (table: 'token_leaderboard' | 'nft_leaderboard') => {
  const { data } = await supabase.from(table).select('*');
  if (!data) return;

  for (const item of data) {
    const handle = extractHandle(item.twitter);
    if (!handle) continue;
    const heat = await getMockHeat(handle);
    await supabase.from(table).update({ heat }).eq('name', item.name);
  }
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await updateLeaderboard('token_leaderboard');
  await updateLeaderboard('nft_leaderboard');
  res.status(200).json({ message: 'Leaderboard updated successfully' });
}
