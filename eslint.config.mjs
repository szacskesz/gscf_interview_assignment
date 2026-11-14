import js from '@eslint/js';
import angular from 'angular-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import boundaries from 'eslint-plugin-boundaries';
import tseslint from 'typescript-eslint';

const sourceFiles = ['apps/**/*.ts', 'libs/**/*.ts'];
const privateImports = {
  group: ['@gscf/*/*', '**/dist/**'],
  message: 'Import the library by its package public API, such as @gscf/ui-common.',
};

export default defineConfig(
  globalIgnores([
    'TMP/**',
    '**/dist/**',
    '**/out-tsc/**',
    '**/.angular/**',
    '**/coverage/**',
    'apps/disputes/mocks/mockServiceWorker.js',
  ]),
  {
    files: sourceFiles,
    extends: [js.configs.recommended, tseslint.configs.recommended, angular.configs.tsRecommended],
    processor: angular.processInlineTemplates,
    plugins: { boundaries },
    settings: {
      'import/resolver': { node: { extensions: ['.ts', '.js'] } },
      'boundaries/elements': [
        { type: 'app', pattern: 'apps/*' },
        { type: 'core', pattern: 'libs/core' },
        { type: 'feature', pattern: 'libs/feature/*' },
        { type: 'ui', pattern: 'libs/ui/*' },
        { type: 'data-access', pattern: 'libs/data-access/*' },
      ],
    },
    rules: {
      '@angular-eslint/no-input-rename': 'off',
      '@angular-eslint/no-output-rename': 'off',
      'boundaries/dependencies': ['error', { default: 'disallow' }],
      'no-restricted-imports': [
        'error',
        {
          patterns: [privateImports],
        },
      ],
    },
  },
  {
    files: ['libs/core/**/*.ts', 'libs/data-access/**/*.ts', 'libs/ui/common/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@gscf/ui-common',
              message: 'Only application and feature consumers may import this UI library.',
            },
          ],
          patterns: [privateImports],
        },
      ],
    },
  },
  {
    files: ['libs/ui/form/**/*.ts', 'libs/ui/notifications/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        { paths: ['@gscf/ui-form', '@gscf/ui-notifications'], patterns: [privateImports] },
      ],
    },
  },
  {
    files: ['apps/**/src/app/**/*.html', 'libs/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
);
