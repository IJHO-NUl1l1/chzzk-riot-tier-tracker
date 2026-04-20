import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup/index.html'),
      },
      output: {
        entryFileNames: 'popup/[name].js',
        chunkFileNames: 'popup/[name].js',
        assetFileNames: 'popup/[name].[ext]',
        // 청크 분리 안 함 — Extension은 단일 파일이 안전
        manualChunks: undefined,
      },
    },
  },
});
