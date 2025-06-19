import { exec } from 'child_process';

function runUpdate() {
  console.log(`🕒 开始执行 updateLeaderboard.ts 脚本: ${new Date().toLocaleString()}`);
  exec('npx ts-node scripts/updateLeaderboard.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`❌ 错误: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`⚠️ 警告: ${stderr}`);
    }
    console.log(`✅ 输出:\n${stdout}`);
  });
}

// 每隔 3 小时执行一次（毫秒单位：3 小时 = 3 * 60 * 60 * 1000）
setInterval(runUpdate, 3 * 60 * 60 * 1000);

// 启动时先执行一次
runUpdate();
