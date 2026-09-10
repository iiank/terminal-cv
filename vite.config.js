import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],

  // Relative base keeps the build portable: domain root, subfolder
  // or a GitHub Pages project path all work without further changes.
  base: './',

  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false
  },

  define: {
    // Stamped in at build time, read by the developer-only page.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
