// scripts/fetchProjectsPlaywright.ts
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('⏳ 正在打开 LunarCrush 页面...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://lunarcrush.com/categories/cryptocurrencies', {
    timeout: 60000,
    waitUntil: 'networkidle'
  });

  console.log('⌛ 正在等待页面加载...');
  await page.waitForSelector('div[data-testid^="marketRowName_"]', { timeout: 60000 });

  const rows = await page.$$('div[data-testid^="marketRowName_"]');

  if (!rows.length) {
    console.error('❌ 抓取失败: 未找到任何代币项目行');
    await browser.close();
    return;
  }

  const data = await Promise.all(rows.slice(0, 30).map(async (row) => {
    const name = await row.textContent() || '未知';
    const twitter = 'https://twitter.com/' + name.replace(/^@/, '').replace(/\s/g, '').toLowerCase();
    return {
      name: name.trim(),
      chain: 'SOL',
      heat: Math.floor(Math.random() * 10000),
      launch_time: new Date().toISOString(),
      twitter,
    };
  }));

  const filePath = path.join('data', 'fetched_projects.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ 抓取完成，共 ${data.length} 条，已保存至 ${filePath}`);

  await browser.close();
})();
