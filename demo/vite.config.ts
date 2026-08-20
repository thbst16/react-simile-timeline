import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
    // Force a single React copy into the bundle. The workspace also carries
    // React 19 (the library's own dev/test dependency); without deduping, the
    // production build resolves the library's `react` import to 19 while the
    // demo app uses its declared React 18, bundling two Reacts. The second
    // React's dispatcher is never initialised, so the first hook call throws
    // "Cannot read properties of null (reading 'useState')" and the page is
    // blank. Dev mode dedupes on its own; the production rollup does not.
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
});
