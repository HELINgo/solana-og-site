// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inject from '@rollup/plugin-inject';
import rollupNodePolyfills from 'rollup-plugin-polyfill-node';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      stream: 'node-libs-browser/mock/empty',
      crypto: 'crypto-browserify',
    },
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      plugins: [
        inject({
          Buffer: ['buffer', 'Buffer'],
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



