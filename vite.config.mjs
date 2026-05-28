import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    cssCodeSplit: false,
    lib: {
      entry: './src/main.js',
      name: 'JsOffcanvas',
      formats: ['es', 'umd'],
      fileName: (format) => format === 'umd' ? 'js-offcanvas.min.js' : 'js-offcanvas.es.js'
    },
    rollupOptions: {
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => assetInfo.name === 'style.css'
          ? 'js-offcanvas.min.css'
          : '[name][extname]'
      }
    },
    minify: 'esbuild'
  },
  server: {
    hmr: {
      overlay: false
    }
  }
});
