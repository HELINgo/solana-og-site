// scripts/createTestExpiredRound.ts
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const insertExpiredRound = async () => {
  const now = new Date();
  const start_time = new Date(now.getTime() - 48 * 60 * 60 * 1000); // 48小时前
  const end_time = new Date(now.getTime() - 24 * 60 * 60 * 1000);   // 24小时前

  const { error } = await supabase.from('lottery_rounds').insert([{
    id: randomUUID(),
    start_time: start_time.toISOString(),
    end_time: end_time.toISOString(),
    status: 'open',
    is_current: true,
  }]);

  if (error) {
    console.error('❌ 插入测试轮次失败:', error.message);
  } else {
    console.log('✅ 成功插入一个已过期的轮次');
  }
};

insertExpiredRound();
