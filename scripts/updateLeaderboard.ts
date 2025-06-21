// scripts/updateLeaderboard.ts
import { fetchTwitterProjects } from './fetchTwitterProjects';
import { saveProjects } from './saveToSupabase';

async function main() {
  try {
    const projects = await fetchTwitterProjects();
    console.log(`✅ 共抓取到 ${projects.length} 个未上线项目`);
    await saveProjects(projects);
  } catch (err) {
    console.error('❌ 更新失败:', err);
  }
}

main();
