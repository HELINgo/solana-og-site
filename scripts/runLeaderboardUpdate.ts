// scripts/runLeaderboardUpdate.ts
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const isNFT = (name: string) =>
  /nft|art|ape|punk|monkey|collection/i.test(name.toLowerCase());

async function run() {
  console.log('⏳ 开始抓取项目...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://lunarcrush.com/categories/cryptocurrencies', { timeout: 60000 });
  await page.waitForTimeout(3000);

  const rows = await page.$$('[data-testid^="marketRowName_"]');
  if (!rows || rows.length === 0) {
    await browser.close();
    console.error('❌ 未找到任何项目行');
    return;
  }

  const projects = await Promise.all(rows.slice(0, 20).map(async (row, i) => {
    const name = (await row.textContent())?.trim() || `项目${i + 1}`;
    return {
      name,
      chain: 'SOL',
      heat: Math.floor(Math.random() * 10000),
      launch_time: new Date().toISOString(),
      twitter: `https://twitter.com/${name.replace(/^@/, '')}`
    };
  }));

  await browser.close();

  let successCount = 0;
  let failCount = 0;
  const inserted = new Set();

  for (const item of projects) {
    const key = `${item.name}-${item.chain}`;
    if (inserted.has(key)) continue;
    inserted.add(key);

    const score = item.heat + 500;
    const table = isNFT(item.name) ? 'nft_leaderboard' : 'token_leaderboard';

    const { error } = await supabase.from(table).upsert({
      name: item.name,
      chain: item.chain,
      heat: score,
      launch_time: item.launch_time,
      twitter: item.twitter,
    });

    if (error) {
      console.error(`❌ 插入失败: ${item.name}`, error);
      failCount++;
    } else {
      console.log(`✅ 插入成功: ${item.name} → ${table}`);
      successCount++;
    }
  }

  console.log(`🎉 更新完成：成功 ${successCount} 项，失败 ${failCount} 项`);
}

run();
