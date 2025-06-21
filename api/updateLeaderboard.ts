// api/updateLeaderboard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const SEARCH_TERMS = [
  'fairlaunch', 'launch soon', 'new token', 'mint soon', 'stealth', 'airdrop'
];
const MAX_RESULTS = 30;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ 打印 token 开头调试（仅用于临时调试，请部署后删除）
    console.log('🔐 BEARER_TOKEN starts with:', BEARER_TOKEN?.slice(0, 10));

    const query = SEARCH_TERMS.map(t => `"${t}"`).join(' OR ');
    const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)} -is:retweet lang:en&max_results=${MAX_RESULTS}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`;

    const response = await axios.get(url, {
  headers: { Authorization: BEARER_TOKEN } // ✅ 这里直接使用环境变量
});


    const tweets = response.data.data;
    const users = response.data.includes?.users || [];

    const projects: any[] = [];

    for (const tweet of tweets) {
      const user = users.find(u => u.id === tweet.author_id);
      if (!user) continue;

      const text = tweet.text;
      const username = user.username;
      const name = user.name;
      const createdAt = tweet.created_at;
      const metrics = tweet.public_metrics;
      const heat = metrics.like_count + metrics.retweet_count + metrics.reply_count;

      const isToken = /token|fairlaunch|stealth|launch/i.test(text);
      const isNFT = /nft|pfp|mint/i.test(text);
      const isLaunched = /already live|now live|on uniswap|trading now|chart/i.test(text);

      if ((isToken || isNFT) && !isLaunched && username) {
        const project = {
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

    const tokenProjects = projects.filter(p => p.type === 'token');
    const nftProjects = projects.filter(p => p.type === 'nft');

    if (tokenProjects.length > 0) {
      await supabase.from('token_leaderboard').upsert(tokenProjects, {
        onConflict: ['twitter'],
        ignoreDuplicates: true,
      });
    }

    if (nftProjects.length > 0) {
      await supabase.from('nft_leaderboard').upsert(nftProjects, {
        onConflict: ['twitter'],
        ignoreDuplicates: true,
      });
    }

    res.status(200).json({ success: true, message: `✅ Updated ${projects.length} projects` });
  } catch (error) {
    console.error('❌ 更新失败:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
}
