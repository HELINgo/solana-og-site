// src/utils/fetchLeaderboard.ts
import { supabase } from '../supabaseClient'

export async function fetchTokenLeaderboard() {
  const { data, error } = await supabase
    .from('token_leaderboard')
    .select('*')
    .order('heat', { ascending: false })

  if (error) {
    console.error('❌ 拉取 token_leaderboard 失败:', error)
    return []
  }
  return data
}

export async function fetchNftLeaderboard() {
  const { data, error } = await supabase
    .from('nft_leaderboard')
    .select('*')
    .order('heat', { ascending: false })

  if (error) {
    console.error('❌ 拉取 nft_leaderboard 失败:', error)
    return []
  }
  return data
}
