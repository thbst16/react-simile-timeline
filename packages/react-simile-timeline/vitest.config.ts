import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      // Measure the whole public source, not only files a test happens to
      // import, so the baseline reflects real coverage and untested modules
      // are visible rather than silently omitted.
      include: ['src/**/*.{ts,tsx}'],
      includeUntested: true,
      exclude: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/test/**',
        'src/index.ts', // barrel re-exports only
        'src/**/index.ts', // sub-barrels
        'src/**/*.d.ts',
        'src/types/**', // type declarations, no runtime
      ],
      // Thresholds set just under the measured baseline (statements 56.68,
      // branches 37.04, functions 67.4, lines 57.12 as of #22). They ratchet:
      // a regression fails CI, and #23 raises them as component tests land.
      thresholds: {
        statements: 55,
        branches: 35,
        functions: 65,
        lines: 55,
      },
      // Thresholds set from the measured baseline (see #22). They ratchet: a
      // drop fails CI, and they are raised as #23 adds component tests.
    },
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
});
