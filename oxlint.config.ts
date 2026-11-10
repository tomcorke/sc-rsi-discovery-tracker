import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['react', 'typescript', 'oxc'],
  jsPlugins: [
    'eslint-plugin-sonarjs',
    '@stylistic/eslint-plugin',
    './oxlint-plugin.js',
  ],
  categories: { correctness: 'error' },
  ignorePatterns: ['dist'],
  rules: {
    ...sonarjs.configs.recommended.rules,
    'react/rules-of-hooks': 'error',
    'react/exhaustive-deps': 'error',
    'react/only-export-components': ['warn', { allowConstantExport: true }],
    'typescript/no-explicit-any': 'error',

    'max-depth': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    'sonarjs/cognitive-complexity': ['error', 15],

    // Space code out: a blank line around blocks, after declarations and before returns.
    '@stylistic/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always',
        prev: '*',
        next: ['return', 'block-like', 'export'],
      },
      {
        blankLine: 'always',
        prev: ['const', 'let', 'var', 'block-like', 'directive', 'import'],
        next: '*',
      },
      {
        blankLine: 'any',
        prev: ['const', 'let', 'var'],
        next: ['const', 'let', 'var'],
      },
      { blankLine: 'any', prev: 'import', next: 'import' },
      { blankLine: 'any', prev: 'export', next: 'export' },
    ],

    // Components import only their own CSS module; global styles load once from main.tsx.
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['**/*.css', '!**/*.module.css'],
            message: 'Import a co-located .module.css instead.',
          },
        ],
      },
    ],
    'local/css-module-import-name': 'error',
  },
  overrides: [
    {
      files: ['src/main.tsx'],
      rules: { 'no-restricted-imports': 'off' },
    },
  ],
});
