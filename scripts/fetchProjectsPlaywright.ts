// scripts/fetchProjectsPlaywright.ts
import { chromium } from 'playwright';
import fs from 'fs/promises';

(async () => {
  console.log('⏳ 正在打开 LunarCrush 页面...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://lunarcrush.com/categories/cryptocurrencies', { timeout: 60000 });

  // 等待“Recently Added”区块加载出来
  await page.waitForSelector('text=Recently Added', { timeout: 60000 });

  // 获取“Recently Added”下面的所有项目卡片
  const items = await page.$$eval('div:has-text("Recently Added") >> xpath=.. >> xpath=.. >> div >> div', nodes => {
    return nodes.map(el => {
      const nameEl = el.querySelector('div span');
      const priceEl = el.querySelector('div span + span');
      const name = nameEl?.textContent?.trim() || '未知';
      const price = priceEl?.textContent?.trim() || '';
      return { name, price };
    });
  });

  const projects = items.filter(p => p.name !== '未知').map(p => ({
    name: p.name,
    chain: 'SOL', // 默认填 SOL，后续可以改进
    heat: Math.floor(Math.random() * 10000 + 5000), // 先用随机数模拟热度
    launch_time: new Date().toISOString(),
    twitter: 'EMPTY',
  }));

  console.log('📦 抓取结果:', projects);

  // 保存到文件，供后续使用
  await fs.writeFile('data/fetched_projects.json', JSON.stringify(projects, null, 2));
  console.log('✅ 数据已保存到 data/fetched_projects.json');

  await browser.close();
})();
