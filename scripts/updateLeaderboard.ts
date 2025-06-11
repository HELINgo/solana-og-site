// scripts/updateLeaderboard.ts

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

// 替换成你自己的 Supabase 项目信息
const supabase = createClient(
  'https://vpinbblavyiryvdoyvsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjY3MiwiZXhwIjoyMDY0ODMyNjcyfQ.xAyrtOMFy1-AmDa2ffR8GzccjugnJ0P3LtIPi0qK7Jk'
);

// 从 Twitter 链接中提取用户名
const extractHandle = (url: string) => {
  const match = url.match(/x\.com\/([^\/]+)/);
  return match ? match[1] : null;
};

// 模拟热度：可替换为真实 Twitter API 获取
const getMockHeat = async (handle: string) => {
  return Math.floor(Math.random() * 10000 + 5000); // 模拟热度值
};

// 更新一个表（token_leaderboard 或 nft_leaderboard）
const updateLeaderboard = async (table: 'token_leaderboard' | 'nft_leaderboard') => {
  const { data } = await supabase.from(table).select('*');
  if (!data) return;

  for (const item of data) {
    const handle = extractHandle(item.twitter);
    if (!handle) continue;

    const heat = await getMockHeat(handle);
    await supabase.from(table).update({ heat }).eq('name', item.name);
    console.log(`[${table}] ${item.name} 热度更新为 ${heat}`);
  }
};

// 主函数
(async () => {
  await updateLeaderboard('token_leaderboard');
  await updateLeaderboard('nft_leaderboard');
})();
