// ESLint flat config (ESLint 10). React linting is provided by
// @eslint-react/eslint-plugin (the maintained successor to eslint-plugin-react,
// which crashes on ESLint 10 - it calls a context API ESLint 10 removed).
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintReact from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  // Replaces the old `ignorePatterns`. `.eslintrc.cjs` is gone, so it is not
  // listed here.
  {
    ignores: ['**/dist/**', '**/node_modules/**', 'demo/playwright-report/**'],
  },

  // eslint:recommended
  js.configs.recommended,

  // @typescript-eslint/recommended
  ...tseslint.configs.recommended,

  // @eslint-react recommended for TypeScript. Replaces eslint-plugin-react's
  // flat/recommended + jsx-runtime. The new-JSX-transform assumption (no
  // `import React` needed) is built in, and there is no prop-types rule to
  // disable since the plugin is TypeScript-first - so the two `react/*` off
  // switches the old config carried are no longer needed.
  eslintReact.configs['recommended-typescript'],

  // Language options previously expressed as `env` and `parserOptions`.
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },

  // plugin:react-hooks/recommended. v7's bundled flat config would enable a
  // dozen new React-Compiler rules (immutability, purity, set-state-in-effect,
  // and so on). That is a rule-set expansion, not a port, so the plugin is
  // registered here and only the two rules the previous config carried are set
  // below. Adopting the compiler rule set is its own decision, tracked
  // separately, not folded into a toolchain migration.
  {
    plugins: { 'react-hooks': reactHooks },
  },

  // The project's own rules, ported verbatim from .eslintrc.cjs.
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',

      // @eslint-react's recommended-typescript is stricter than the
      // eslint-plugin-react recommended it replaced. These rules flag existing,
      // working patterns the previous config never enforced; they are disabled
      // to keep the ESLint 10 migration behaviour-preserving. Adopting them -
      // starting with the genuinely real web-api-no-leaked-fetch finding - is a
      // separate quality pass tracked in #72.
      '@eslint-react/no-array-index-key': 'off',
      '@eslint-react/set-state-in-effect': 'off',
      '@eslint-react/web-api-no-leaked-fetch': 'off',
      '@eslint-react/use-state': 'off',

      // React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // General
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },

  // Node CLI scripts print to stdout by design.
  {
    files: ['scripts/**/*.{js,mjs}'],
    rules: {
      'no-console': 'off',
    },
  },

  // Must be last: turns off every stylistic rule Prettier owns.
  prettier
);
