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

const isNFT = (name: string) =>
  /nft|art|ape|punk|monkey|collection/i.test(name.toLowerCase());

(async () => {
  const filePath = path.join('data', 'fetched_projects.json');
  if (!fs.existsSync(filePath)) {
    console.error('❌ 未找到项目数据文件，请先运行 fetchProjectsPlaywright.ts');
    return;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const projects: ProjectItem[] = JSON.parse(raw);

  const inserted = new Set<string>();

  for (const item of projects) {
    const key = `${item.name}-${item.chain}`;
    if (inserted.has(key)) continue;
    inserted.add(key);

    const score = item.heat + 500;
    const table = isNFT(item.name) ? 'nft_leaderboard' : 'token_leaderboard';
    const twitterLink = item.twitter === '' || item.twitter === 'EMPTY'
      ? `https://twitter.com/${item.name.replace(/^@/, '')}`
      : item.twitter;

    const { error } = await supabase.from(table).upsert({
      name: item.name,
      chain: item.chain,
      heat: score,
      launch_time: item.launch_time,
      twitter: twitterLink,
    });

    if (error) {
      console.error(`❌ 插入失败: ${item.name}`, error);
    } else {
      console.log(`✅ 插入成功: ${item.name} -> ${table}`);
    }
  }
})();

