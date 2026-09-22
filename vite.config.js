import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
  plugins: [
    vue(),
    Icons({ compiler: 'vue3' })
  ],

  // Relative base keeps the build portable: a domain root, a subfolder or a
  // GitHub Pages project path all work unchanged.
  base: './',

  build: {
    outDir: 'dist',
    target: 'es2020',
    sourcemap: false
  },

  define: {
    // Stamped in at build time and shown on last_updated.log.
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  }
});
