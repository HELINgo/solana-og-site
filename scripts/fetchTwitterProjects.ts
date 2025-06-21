// scripts/fetchTwitterProjects.ts
import axios from 'axios';
import * as dotenv from 'dotenv';
import { saveProjects, Project } from './saveToSupabase';
dotenv.config();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const SEARCH_TERMS = [
  'fairlaunch',
  'launch soon',
  'new token',
  'mint soon',
  'stealth',
  'airdrop'
];
const MAX_RESULTS = 30;

export async function fetchTwitterProjects(): Promise<void> {
  const query = SEARCH_TERMS.map(t => `"${t}"`).join(' OR ');
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)} -is:retweet lang:en&max_results=${MAX_RESULTS}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`;

  try {
    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${BEARER_TOKEN}` }
    });

    const tweets = res.data.data;
    const users = res.data.includes?.users || [];

    const projects: Project[] = [];

    for (const tweet of tweets) {
      const user = users.find(u => u.id === tweet.author_id);
      if (!user) continue;

      const text = tweet.text;
      const username = user.username;
      const name = user.name;
      const createdAt = tweet.created_at;
      const metrics = tweet.public_metrics;
      const heat =
        (metrics.like_count || 0) +
        (metrics.retweet_count || 0) +
        (metrics.reply_count || 0);

      const isToken = /token|fairlaunch|stealth|launch/i.test(text);
      const isNFT = /nft|pfp|mint/i.test(text);
      const isLaunched = /already live|now live|on uniswap|trading now|chart/i.test(text);

      if ((isToken || isNFT) && !isLaunched && username) {
        const project: Project = {
          name: name || username,
          twitter: `https://x.com/${username}`,
          launch_time: createdAt,
          heat,
          intro: text.slice(0, 160),
          logo: user.profile_image_url,
          chain: 'X',
          type: isNFT ? 'nft' : 'token'
        };
        projects.push(project);
      }
    }

    console.log(`✅ 共抓取到 ${projects.length} 个未上线项目`);
    await saveProjects(projects);
  } catch (err) {
    console.error('❌ 抓取失败:', err);
  }
}

// ✅ 允许被导入，也可独立执行
if (require.main === module) {
  fetchTwitterProjects();
}

