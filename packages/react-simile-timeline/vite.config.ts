import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      name: 'ReactSimileTimeline',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
      // Vite 6 changed the default lib CSS asset name from `style.css` to the
      // package name. The exports map publishes `./style.css` and the
      // root-level shim re-exports `dist/style.css`, so letting the default
      // through renames a published entrypoint and 404s every documented
      // `react-simile-timeline/style.css` import.
      cssFileName: 'style',
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
    sourcemap: true,
    // Vite 8 replaced esbuild with rolldown/oxc as the default pipeline and
    // demoted esbuild to an optional peer. Naming it here would keep a
    // dependency in the tree that nothing else needs and that carries its own
    // advisory; 'oxc' is Vite 8's own minifier.
    minify: 'oxc',
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
});
