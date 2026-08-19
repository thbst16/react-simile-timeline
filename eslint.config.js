// ESLint flat config (ESLint 9). Replaces .eslintrc.cjs, which the eslintrc
// format ESLint 9+ no longer reads. The rule set is a faithful port of the
// previous config; every intentional change is called out in a comment.
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import react from 'eslint-plugin-react';
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

  // plugin:react/recommended + plugin:react/jsx-runtime
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],

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
    settings: {
      react: { version: 'detect' },
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

      // React
      'react/prop-types': 'off',
      'react/react-in-jsx-scope': 'off',

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
