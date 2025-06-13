// api/updateLeaderboard.ts
import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { supabase } from '../../src/supabaseClient';

// 判断是否为 NFT 项目
const isNFT = (name: string) => {
  return /nft|art|ape|punk|monkey|collection/i.test(name);
};

// ESModule 风格的 API handler
const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'fetched_projects.json');

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'fetched_projects.json 文件不存在' });
    }

    const raw = fs.readFileSync(filePath, 'utf-8');
    const projects = JSON.parse(raw);

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

    return res.status(200).json({ message: '数据处理完成', successCount, failCount });
  } catch (err: any) {
    console.error('服务器错误:', err);
    return res.status(500).json({ error: '服务器错误', detail: err.message });
  }
};

export default handler;

