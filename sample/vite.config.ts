import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import { viteInlineCss } from 'plume-ssr-server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh(), viteInlineCss()],
  build: {
    outDir: 'build',
  },
  optimizeDeps: {
    exclude: ['@wessberg/di-compiler'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
});
