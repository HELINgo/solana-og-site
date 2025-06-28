// scripts/drawLottery.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// 获取过去 24 小时时间范围
const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const startTime = yesterday.toISOString();
const endTime = now.toISOString();

async function drawLottery() {
  // 获取本轮所有记录
  const { data: entries, error } = await supabase
    .from('lottery_entries')
    .select('*')
    .gte('created_at', startTime)
    .lte('created_at', endTime);

  if (error) {
    console.error('❌ 查询失败:', error);
    return;
  }

  if (!entries || entries.length === 0) {
    console.log('⚠️ 没有符合条件的购买彩票记录');
    return;
  }

  // 所有号码列表（包含 wallet + number）
  const allNumbers = entries.flatMap(entry =>
    entry.numbers.map((num: number) => ({
      wallet: entry.wallet,
      twitter: entry.twitter || null,
      number: num,
    }))
  );

  const totalCount = allNumbers.length;
  const prizeAmount = totalCount * 0.01;

  // 随机选中一个号码
  const winner = allNumbers[Math.floor(Math.random() * totalCount)];

  console.log(`🎉 中奖号码: ${winner.number}`);
  console.log(`🎯 中奖钱包: ${winner.wallet}`);
  console.log(`💰 奖金: ${prizeAmount} SOL`);

  // 写入开奖结果表
  await supabase.from('lottery_history').insert([
    {
      winner_wallet: winner.wallet,
      twitter: winner.twitter,
      prize: prizeAmount,
      number: winner.number,
    },
  ]);

  // 清空旧的 entries（准备下一轮）
  await supabase.from('lottery_entries').delete().gte('created_at', startTime).lte('created_at', endTime);

  console.log('✅ 开奖完成，已记录历史并清空 entries');
}

drawLottery();
