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
      // Thresholds sit just under the measured baseline so they ratchet: a
      // regression fails CI, and they are raised as coverage grows. Raised by
      // #23, which added TimelineProvider, usePan, EventMarker and EventPopup
      // tests (statements 76.55, branches 63.13, functions 83.7, lines 77.51).
      thresholds: {
        statements: 75,
        branches: 60,
        functions: 80,
        lines: 75,
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
