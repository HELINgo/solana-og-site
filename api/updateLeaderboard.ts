// api/updateLeaderboard.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// 读取环境变量（你已经在 Vercel 上设置过了）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const isNFT = (name: string) =>
  /nft|art|ape|punk|monkey|collection/i.test(name);

const fetchProjects = async () => {
  return [
    {
      name: '@Polymarket',
      chain: 'SOL',
      heat: 7937,
      launch_time: new Date().toISOString(),
    },
    {
      name: '@MEXC_Listings',
      chain: 'SOL',
      heat: 8856,
      launch_time: new Date().toISOString(),
    },
  ];
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const projects = await fetchProjects();
    let successCount = 0;
    let failCount = 0;

    for (const item of projects) {
      const score = item.heat + 500;
      const twitter = item.name.startsWith('@')
        ? `https://twitter.com/${item.name.replace('@', '')}` : 'EMPTY';

      const table = isNFT(item.name) ? 'nft_leaderboard' : 'token_leaderboard';

      const { error } = await supabase.from(table).upsert({
        name: item.name,
        chain: item.chain,
        heat: score,
        launch_time: item.launch_time,
        twitter,
      });

      if (error) {
        console.error('❌ 插入失败', item.name, error);
        failCount++;
      } else {
        console.log('✅ 成功:', item.name);
        successCount++;
      }
    }

    res.status(200).json({ message: '更新完成', successCount, failCount });
  } catch (err: any) {
    console.error('❌ 服务器错误:', err.message);
    res.status(500).json({ error: '服务器错误', detail: err.message });
  }
}

