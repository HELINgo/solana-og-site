// scripts/fetchProjectsPlaywright.ts
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  console.log('⏳ 正在打开 LunarCrush Markets 页面...');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://lunarcrush.com/markets', { timeout: 60000 });

  await page.waitForSelector('[aria-label="Market Table"] tbody tr');

  const rows = await page.$$('[aria-label="Market Table"] tbody tr');

  const data = await Promise.all(rows.slice(0, 30).map(async (row) => {
    const name = await row.$eval('td:nth-child(2)', el => el.textContent?.trim() || '未知');
    const chain = 'ETH'; // 暂时默认
    const twitter = await row.$eval('td:nth-child(3) a', el => el.getAttribute('href') || 'EMPTY');

    return {
      name,
      chain,
      heat: Math.floor(Math.random() * 10000), // 假热度
      launch_time: new Date().toISOString(),
      twitter: twitter.startsWith('http') ? twitter : 'https://x.com' + twitter,
    };
  }));

  const filePath = path.join('data', 'fetched_projects.json');
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`✅ 抓取完成，数据保存至 ${filePath}`);

  await browser.close();
})();

