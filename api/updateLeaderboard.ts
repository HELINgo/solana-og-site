// /api/updateLeaderboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '../../src/supabaseClient';

const isNFT = (name: string) =>
  /nft|art|ape|punk|monkey|collection/i.test(name);

// 模拟从外部重新抓取数据（在这里写死部分演示数据，真实环境你应改为 Playwright 抓取）
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const projects = await fetchProjects();

    let successCount = 0;
    let failCount = 0;

    for (const item of projects) {
      const score = item.heat + 500;
      const twitter = item.name.startsWith('@')
        ? `https://twitter.com/${item.name.replace('@', '')}`
        : 'EMPTY';
      const targetTable = isNFT(item.name) ? 'nft_leaderboard' : 'token_leaderboard';

      const { error } = await supabase.from(targetTable).upsert({
        name: item.name,
        chain: item.chain || '未知',
        heat: score,
        launch_time: item.launch_time,
        twitter,
      });

      if (error) {
        console.error(`❌ 插入失败: ${item.name}`, error);
        failCount++;
      } else {
        console.log(`✅ 插入成功: ${item.name} -> ${targetTable}`);
        successCount++;
      }
    }

    return res.status(200).json({ message: '更新成功', successCount, failCount });
  } catch (err: any) {
    console.error('❌ API 错误:', err);
    return res.status(500).json({ error: '服务器错误', detail: err.message });
  }
}
