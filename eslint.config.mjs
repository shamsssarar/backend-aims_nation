import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  // 1. Files to lint
  { files: ['**/*.{js,mjs,cjs,ts}'] },

  // 2. Ignore build files
  { ignores: ['dist', 'node_modules'] },

  // 3. Environment Setup
  { languageOptions: { globals: globals.node } },

  // 4. The Rulesets (Standard + Prettier)
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // 5. Prettier Config (ALWAYS LAST)
  eslintConfigPrettier,

  // 6. Your Custom Rules
  {
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];
