// scripts/fillProjectMeta.ts
import 'dotenv/config';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY，请检查 .env 文件');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const tables = ['token_leaderboard', 'nft_leaderboard'];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  for (const table of tables) {
    const { data: projects } = await supabase.from(table).select('*');
    if (!projects) continue;

    for (const row of projects) {
      const raw = row.twitter?.trim();
      if (!raw || raw === 'EMPTY' || row.logo || row.intro) {
        continue; // 🔁 跳过已抓取过的项目
      }

      const username = raw
        .replace(/^https:\/\/(x|twitter)\.com\//i, '')
        .replace('@', '')
        .trim();

      if (!username) continue;

      try {
        console.log(`🌐 正在抓取 @${username} ...`);
        await page.goto(`https://twitter.com/${username}`, { timeout: 30000 });

        const logo = await page
          .locator('img[src*="profile_images"]')
          .first()
          .getAttribute('src');

        const desc =
          (await page
            .locator('div[data-testid="UserDescription"] span')
            .first()
            .innerText()
            .catch(() => '')) || '';

        if (!logo && !desc) {
          console.log(`⚠️ 跳过 @${username}，没有抓到内容`);
          continue;
        }

        await supabase
          .from(table)
          .update({ logo, intro: desc })
          .eq('id', row.id);

        console.log(`✅ 成功更新 @${username}`);
      } catch (err: any) {
        console.log(`❌ 抓取 @${username} 失败：${err.message || err}`);
      }
    }
  }

  await browser.close();
})();

