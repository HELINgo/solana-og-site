// api/updateLeaderboard.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchProjects } from '../scripts/fetchTwitterProjects';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await fetchProjects();
    res.status(200).json({ success: true, message: 'Leaderboard updated successfully' });
  } catch (err: any) {
    console.error('❌ Update failed:', err);
    res.status(500).json({ success: false, error: err.message || 'Unknown error' });
  }
}

