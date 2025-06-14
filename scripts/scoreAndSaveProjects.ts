// scripts/scoreAndSaveProjects.ts
import fs from 'fs';
import path from 'path';
import { supabase } from '../src/supabaseClient';

interface ProjectItem {
  name: string;
  chain: string;
  heat: number;
  launch_time: string;
  twitter: string;
}

// 判断是否是 NFT 项目
const isNFT = (name: string) => {
  return /nft|art|ape|punk|monkey|collection/i.test(name.toLowerCase());
};

(async () => {
  const filePath = path.join('data', 'fetched_projects.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const projects: ProjectItem[] = JSON.parse(raw);

  const inserted = new Set();

  for (const item of projects) {
    const key = `${item.name}-${item.chain}`;
    if (inserted.has(key)) continue;
    inserted.add(key);

    const score = item.heat + 500;
    const targetTable = isNFT(item.name) ? 'nft_leaderboard' : 'token_leaderboard';

    const twitterLink = item.twitter === 'EMPTY'
      ? `https://twitter.com/${item.name.replace(/^@/, '')}`
      : item.twitter;

    const { error } = await supabase.from(targetTable).upsert({
      name: item.name,
      chain: item.chain || '未知',
      heat: score,
      launch_time: item.launch_time,
      twitter: twitterLink,
    });

    if (error) {
      console.error(`❌ 插入失败: ${item.name}`, error);
    } else {
      console.log(`✅ 插入成功: ${item.name} -> ${targetTable}`);
    }
  }
})();
