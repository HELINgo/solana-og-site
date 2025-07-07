import { supabase } from '../lib/supabase';

export const fetchCurrentRoundId = async (): Promise<string | null> => {
  const { data, error } = await supabase
    .from('lottery_rounds')
    .select('id')
    .eq('is_current', true)
    .order('end_time', { ascending: false }) // 按结束时间倒序排序
    .limit(1) // 只取一条
    .single(); // 强制只返回一条数据，否则报错

  if (error) {
    console.error('[fetchCurrentRoundId] 查询错误:', error.message);
    return null;
  }

  if (!data) {
    console.warn('[fetchCurrentRoundId] 未找到当前轮次');
    return null;
  }

  return data.id;
};

