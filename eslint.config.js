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
      // eslint-plugin-react recommended it replaced. #72 assessed each rule
      // parked during the ESLint 10 migration.
      //
      // Adopted (real findings, now fixed):
      //   web-api-no-leaked-fetch - the URL fetches use an AbortController.
      //   no-array-index-key      - list keys derive from the data, not the index.
      '@eslint-react/web-api-no-leaked-fetch': 'error',
      '@eslint-react/no-array-index-key': 'error',
      //
      // Kept off - the rule fights a legitimate pattern in this codebase:
      //   use-state: demands the setter be named `set<State>`, but the raw
      //     useState setters are deliberately `...State`-suffixed
      //     (setSelectedEventState, setHoveredEventState, setCenterDateState) so
      //     they don't collide with the public actions setSelectedEvent /
      //     setHoveredEvent / setCenterDate, which do more than set state.
      //     Renaming would shadow those actions.
      //   set-state-in-effect: fires on the async data-loading effects
      //     (setLoading / setError / setTimelineData) and the centerDate
      //     prop-sync - an idiomatic pattern whose only clean fix is a data-layer
      //     refactor, not a bug fix. It is a React-Compiler-style optimisation
      //     hint and belongs with that rule set's adoption, deferred separately
      //     (see the react-hooks note above).
      '@eslint-react/use-state': 'off',
      '@eslint-react/set-state-in-effect': 'off',

      // These two suggest React 19-only forms - rendering `<Context>` directly
      // as a provider, and the `use` hook in place of `useContext`. Neither
      // exists in React 18, and the library's peer range is `^18 || ^19`, so the
      // current `<Context.Provider>` / `useContext` usage is required, not a
      // style choice. They are disabled so lint stays deterministic: @eslint-react
      // only fires them when it detects React 19, and that detection varies with
      // install hoisting, which made CI lint intermittently red.
      '@eslint-react/no-context-provider': 'off',
      '@eslint-react/no-use-context': 'off',

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
