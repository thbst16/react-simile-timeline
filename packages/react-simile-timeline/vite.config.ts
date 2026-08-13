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
      rollupTypes: true,
      afterBuild: () => {
        // The CJS entry needs declarations of its own. package.json sets
        // "type": "module", so a .d.ts is ESM-flavoured types - pointing the
        // require condition at it makes the package masquerade as ESM, which
        // @arethetypeswrong/cli flags. Only the file extension carries that
        // signal; the rolled-up declaration content is identical for both
        // module systems, so it is copied verbatim.
        copyFileSync(
          resolve(__dirname, 'dist/index.d.ts'),
          resolve(__dirname, 'dist/index.d.cts')
        );
      },
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'ReactSimileTimeline',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
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
    minify: 'esbuild',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
