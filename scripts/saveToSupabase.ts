// scripts/saveToSupabase.ts
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface Project {
  name: string;
  heat: number;
  launch_time: string;
  twitter: string;
  intro?: string;
  logo?: string;
  chain?: string;
  type: 'token' | 'nft';
}

export async function saveProjects(projects: Project[]) {
  const tokenProjects = projects.filter(p => p.type === 'token');
  const nftProjects = projects.filter(p => p.type === 'nft');

  if (tokenProjects.length > 0) {
    const { error } = await supabase
      .from('token_leaderboard')
      .insert(tokenProjects, { ignoreDuplicates: true });
    if (error) console.error('❌ Failed to save token projects:', error);
    else console.log(`✅ Saved ${tokenProjects.length} token projects`);
  }

  if (nftProjects.length > 0) {
    const { error } = await supabase
      .from('nft_leaderboard')
      .insert(nftProjects, { ignoreDuplicates: true });
    if (error) console.error('❌ Failed to save NFT projects:', error);
    else console.log(`✅ Saved ${nftProjects.length} NFT projects`);
  }
}

