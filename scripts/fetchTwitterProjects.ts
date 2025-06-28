// ✅ scripts/fetchTwitterProjects.ts
import axios from 'axios';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { Project } from './saveToSupabase';

dotenv.config();

const BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN!;
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SEARCH_TERMS = Array.from(new Set([
  'solana', 'eth', 'ethereum', 'bsc', 'arbitrum', 'base',
  'memes', 'meme', 'nft', 'nfts', 'nftmeme',
  'new token', 'token launch', 'mint soon', 'mint date', 'nft drop',
  'fair launch', 'new nft', 'airdrop soon', 'wl spot', 'presale',
  'stealth launch', 'token presale', 'public mint', 'claim nft',
  'mint live', 'launch today', 'pre mint', 'solanameme', 'ethmeme'
]));

const MAX_RESULTS = 100;

export async function fetchTwitterProjects(): Promise<void> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const start_time = sevenDaysAgo.toISOString();

  const query = `${SEARCH_TERMS.map(t => `"${t}"`).join(' OR ')} -is:retweet -is:quote lang:en`;
  const url = `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&start_time=${start_time}&max_results=${MAX_RESULTS}&tweet.fields=created_at,public_metrics&expansions=author_id&user.fields=username,name,profile_image_url`;

  try {
    const res = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${BEARER_TOKEN}`
      }
    });

    const tweets = res.data.data || [];
    const users = res.data.includes?.users || [];
    const allProjects: Project[] = [];

    for (const tweet of tweets) {
      const user = users.find(u => u.id === tweet.author_id);
      if (!user) continue;

      const text = tweet.text?.toLowerCase() || '';
      const username = user.username.toLowerCase();
      const name = user.name;
      const createdAt = tweet.created_at;
      const metrics = tweet.public_metrics;
      const like = metrics.like_count || 0;
      const retweet = metrics.retweet_count || 0;
      const heat = like + retweet;

      if (heat < 1) continue;

      // ✅ 项目关键词判断
      const isToken = /token|launch|fairlaunch|erc20|presale|solana|bsc|eth/.test(text);
      const isNFT = /nft|mint|drop|collection|airdrop|wl|meme/.test(text);
      const isLaunched = /already live|now live|on uniswap|chart|cmc/.test(text);

      

      if ((isToken || isNFT) && !isLaunched && username) {
        const project: Project = {
          name: name || username,
          twitter: `https://x.com/${username}`,
          launch_time: createdAt,
          heat,
          intro: tweet.text.slice(0, 160),
          logo: user.profile_image_url,
          chain: 'X',
          type: isNFT ? 'nft' : 'token'
        };
        allProjects.push(project);
      }
    }

    const topProjects = allProjects.sort((a, b) => b.heat - a.heat).slice(0, 20);
    console.log(`✅ 共筛选出 ${topProjects.length} 条热门项目`);

    for (const project of topProjects) {
      const table = project.type === 'nft' ? 'nft_leaderboard' : 'token_leaderboard';
      const { data: existing } = await supabase
        .from(table)
        .select('heat')
        .eq('twitter', project.twitter)
        .single();

      if (!existing || project.heat > existing.heat) {
        await supabase.from(table).upsert(project, { onConflict: ['twitter'] });
        console.log(`✅ 已保存/更新：${project.twitter}`);
      } else {
        console.log(`⏭️ 已存在且热度更高或相同：${project.twitter}`);
      }
    }
  } catch (err) {
    console.error('❌ 抓取失败:', err);
  }
}

if (require.main === module) {
  fetchTwitterProjects();
}

