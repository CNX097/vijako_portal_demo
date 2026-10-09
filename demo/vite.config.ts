import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' để bản build chạy được ở mọi thư mục / static host (GitHub Pages, Netlify…)
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          antd: ['antd', '@ant-design/icons'],
        },
      },
    },
    chunkSizeWarningLimit: 1500,
  },
});
