// scripts/enrichProjectDetails.ts
import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

(async () => {
  const filePath = path.join('data', 'fetched_projects.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const projects = JSON.parse(raw);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const item of projects) {
    if (!item.twitter || item.twitter === 'EMPTY') continue;

    try {
      const username = item.twitter.replace(/^https:\/\/(x|twitter)\.com\//, '').replace(/\/$/, '');
      const twitterUrl = `https://x.com/${username}`;

      await page.goto(twitterUrl, { timeout: 30000 });
      await page.waitForSelector('meta[property="og:image"]', { timeout: 10000 });

      const logo = await page.$eval('meta[property="og:image"]', el => el.getAttribute('content'));
      const intro = await page.$eval('meta[name="description"]', el => el.getAttribute('content'));

      item.logo = logo || '';
      item.intro = intro || '';
      console.log(`✅ 补全成功: ${item.name}`);
    } catch (err) {
      console.error(`⚠️ 无法获取 Twitter 信息: ${item.name}`, err.message);
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(projects, null, 2));
  console.log('🎉 所有项目 logo 和简介已补全完毕');

  await browser.close();
})();
