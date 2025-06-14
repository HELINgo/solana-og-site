import puppeteer from 'puppeteer';

const projects = [
  { name: 'DogeWarrior', slug: 'dogewarrior' },
  { name: 'SolChad', slug: 'solchad' },
];

const fetchGalaxyScore = async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  for (const project of projects) {
    const url = `https://lunarcrush.com/coins/${project.slug}`;
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('.coin-detail__scores-item-value', { timeout: 10000 });

      const score = await page.$eval('.coin-detail__scores-item-value', el => el.textContent?.trim());
      console.log(`[${project.name}] Galaxy Score: ${score}`);
    } catch (err) {
      console.error(`[${project.name}] 获取失败:`, err);
    }
  }

  await browser.close();
};

fetchGalaxyScore();
