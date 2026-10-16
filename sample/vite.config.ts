import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { viteInlineCss } from 'plume-ssr-server';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      plugins: [['swc-class-decorator-plugin', {}]],
      useAtYourOwnRisk_mutateSwcOptions: (options) => {
        options.jsc!.experimental!.runPluginFirst = true;
      },
    }),
    viteInlineCss(),
  ],
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
