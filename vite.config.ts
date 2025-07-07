// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import rollupNodePolyfills from 'rollup-plugin-polyfill-node';

export default defineConfig({
  base: '/'
  plugins: [react()],
  define: {
    'process.env': {}, // 防止环境变量报错
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      buffer: 'buffer',
      process: 'process', // ✅ 修复路径错误
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
          process: 'process', // ✅ 注入 polyfill
        }),
        rollupNodePolyfills(),
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    include: ['buffer', 'process'],
  },
});





