import { createClient } from '@supabase/supabase-js';

// 1. 连接 Supabase（使用 service_role_key）
const supabase = createClient(
  'https://vpinbblavyiryvdoyvsn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwaW5iYmxhdnlpcnl2ZG95dnNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI1NjY3MiwiZXhwIjoyMDY0ODMyNjcyfQ.xAyrtOMFy1-AmDa2ffR8GzccjugnJ0P3LtIPi0qK7Jk'
);

// 2. 获取当前轮
async function getCurrentRound() {
  const now = new Date().toISOString();
  const { data } = await supabase
    .from('lottery_rounds')
    .select('*')
    .lte('start_time', now)
    .gte('end_time', now)
    .single();
  return data;
}

// 3. 执行开奖逻辑（无自动转账）
async function drawWinner() {
  const currentRound = await getCurrentRound();
  if (!currentRound) return console.log('❌ 当前没有进行中的轮次');

  const { data: entries } = await supabase
    .from('lottery_entries')
    .select('*')
    .eq('round_id', currentRound.id);

  if (!entries || entries.length === 0) return console.log('⚠️ 当前轮没有参与者');

  const winner = entries[Math.floor(Math.random() * entries.length)];
  const prizeAmount = entries.length * 0.01;

  console.log(`🎉 本轮中奖地址：${winner.wallet}`);
  console.log(`🏆 奖励金额：${prizeAmount} SOL`);
  console.log(`💡 请手动向该地址进行转账`);
  if (winner.twitter) {
    console.log(`📢 对应 X 用户：@${winner.twitter}`);
  }

  // 4. 保存开奖结果
  await supabase.from('lottery_history').insert({
    wallet: winner.wallet,
    amount: prizeAmount,
    round_id: currentRound.id,
    ticket_number: winner.ticket_number,
    twitter: winner.twitter,
  });

  // 5. 结束当前轮次，开启新一轮
  const now = new Date();
 const nextEnd = new Date(now.getTime() + 5 * 60 * 1000); // ✅ 5分钟

  await supabase.from('lottery_rounds').update({ status: 'ended' }).eq('id', currentRound.id);
  await supabase.from('lottery_rounds').insert({
    start_time: now.toISOString(),
    end_time: nextEnd.toISOString(),
    status: 'active',
  });

  console.log('✅ 当前轮已结束，新轮已开启');
}

drawWinner().catch(console.error);
