// src/utils/updateScore.ts

import { createClient } from '@supabase/supabase-js';

// ✅ 使用前端环境变量
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

/**
 * 更新积分函数
 * @param wallet 用户的钱包地址
 * @param count 本次购票张数
 */
export async function updateScore(wallet: string, count: number): Promise<boolean> {
  if (!wallet || !count) {
    console.error('❌ 钱包地址或数量缺失');
    return false;
  }

  const totalScore = count * 0.03;

  console.log(`📩 积分更新中... 钱包: ${wallet}, 积分: ${totalScore}`);

 const { error } = await supabase.rpc('add_or_update_score', {
  addr: wallet,
  delta: totalScore.toString(), // ✅ 显式转为字符串
});

  if (error) {
    console.error('❌ 积分更新失败:', error.message);
    return false;
  }

  console.log('✅ 积分更新成功');
  return true;
}
