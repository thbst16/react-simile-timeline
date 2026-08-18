import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { copyFileSync } from 'fs';
import { resolve } from 'path';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      // Renamed from `rollupTypes` in vite-plugin-dts 5. The old name is not
      // an error, it is silently ignored - which emits a 1.1 kB re-export
      // stub plus a dist/ tree of per-file declarations instead of the single
      // 19.9 kB rolled-up bundle, while the build still reports success.
      bundleTypes: true,
      afterBuild: () => {
        // The CJS entry needs declarations of its own. package.json sets
        // "type": "module", so a .d.ts is ESM-flavoured types - pointing the
        // require condition at it makes the package masquerade as ESM, which
        // @arethetypeswrong/cli flags. Only the file extension carries that
        // signal; the rolled-up declaration content is identical for both
        // module systems, so it is copied verbatim.
        copyFileSync(
          resolve(import.meta.dirname, 'dist/index.d.ts'),
          resolve(import.meta.dirname, 'dist/index.d.cts')
        );
      },
    }),
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
