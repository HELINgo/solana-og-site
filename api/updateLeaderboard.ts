import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // ✅ 动态导入，确保兼容 TS 模块
    const module = await import('../../scripts/fetchTwitterProjects');
    const fetchTwitterProjects = module.fetchTwitterProjects;

    if (typeof fetchTwitterProjects !== 'function') {
      throw new Error('fetchTwitterProjects is not a function');
    }

    await fetchTwitterProjects();
    res.status(200).json({ success: true, message: '✅ Leaderboard updated' });
  } catch (error) {
    console.error('❌ 更新失败:', error);
    res.status(500).json({ success: false, error: String(error) });
  }
}
