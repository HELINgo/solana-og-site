// api/updateLeaderboard.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// 从环境变量读取 Supabase 配置（在 Vercel 控制台已配置好）
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 简单判断名称是否属于 NFT 项目
const isNFT = (name: string): boolean => {
  return /nft|art|ape|punk|monkey|collection/i.test(name)
}

// 你的数据抓取逻辑（这里示例写死两条记录）
async function fetchProjects() {
  return [
    {
      name: '@Polymarket',
      chain: 'SOL',
      heat: 7937,
      launch_time: new Date().toISOString(),
    },
    {
      name: '@MEXC_Listings',
      chain: 'SOL',
      heat: 8856,
      launch_time: new Date().toISOString(),
    },
  ]
}

// 默认导出一个异步函数，Vercel 会把它当作 Serverless 函数来执行
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  try {
    const projects = await fetchProjects()
    let successCount = 0
    let failCount = 0

    for (const item of projects) {
      const score = item.heat + 500
      const twitter = item.name.startsWith('@')
        ? `https://twitter.com/${item.name.slice(1)}`
        : 'EMPTY'
      const table = isNFT(item.name)
        ? 'nft_leaderboard'
        : 'token_leaderboard'

      const { error } = await supabase
        .from(table)
        .upsert({
          name: item.name,
          chain: item.chain,
          heat: score,
          launch_time: item.launch_time,
          twitter,
        })

      if (error) {
        console.error('❌ 插入失败', item.name, error)
        failCount++
      } else {
        console.log('✅ 插入成功', item.name)
        successCount++
      }
    }

    res.status(200).json({
      message: '更新完成',
      successCount,
      failCount,
    })
  } catch (err: any) {
    console.error('❌ 服务器错误', err)
    res.status(500).json({
      error: '服务器错误',
      detail: err.message ?? String(err),
    })
  }
}
