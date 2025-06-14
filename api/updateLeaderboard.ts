// api/updateLeaderboard.ts

import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

// —— 1. 先检查环境变量是否存在 —— 
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('👉 ENV:', {
  SUPABASE_URL,
  SUPABASE_KEY_HEAD: SUPABASE_SERVICE_ROLE_KEY?.slice(0, 8) || null
})

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error(
    '❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment'
  )
  // 这里先不抛，让函数加载完，后面直接返回 500
}

// —— 2. 初始化 Supabase 客户端 —— 
const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
)

/** 简单判断项目名里是否带 NFT 相关关键词 */
const isNFT = (name: string) =>
  /nft|art|ape|punk|monkey|collection/i.test(name)

/** TODO: 替换成你真实的抓取逻辑 */
async function fetchProjects(): Promise<
  Array<{ name: string; chain: string; heat: number; launch_time: string }>
> {
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

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  console.log('👉 Called /api/updateLeaderboard')
  // 如果环境变量缺失，直接 500
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res
      .status(500)
      .json({ error: '环境变量缺失，请检查 SUPABASE_URL 和 SUPABASE_SERVICE_ROLE_KEY' })
  }

  try {
    const projects = await fetchProjects()
    let successCount = 0
    let failCount = 0

    for (const item of projects) {
      const score = item.heat + 500
      const twitter = item.name.startsWith('@')
        ? `https://twitter.com/${item.name.slice(1)}`
        : null
      const table = isNFT(item.name)
        ? 'nft_leaderboard'
        : 'token_leaderboard'

      const { error } = await supabase
        .from(table)
        .upsert({
          name: item.name,
          chain: item.chain ?? '未知',
          heat: score,
          launch_time: item.launch_time,
          twitter,
        })

      if (error) {
        console.error('❌ 插入失败:', item.name, error)
        failCount++
      } else {
        console.log('✅ 插入成功:', item.name, '→', table)
        successCount++
      }
    }

    return res
      .status(200)
      .json({ message: '更新完成', successCount, failCount })
  } catch (err: any) {
    console.error('❌ 服务器错误:', err)
    return res
      .status(500)
      .json({ error: '服务器错误', detail: err.message })
  }
}

