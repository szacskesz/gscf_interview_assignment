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
const packageNames = [
  '@gscf/core',
  '@gscf/disputes-data-access',
  '@gscf/disputes-mock',
  '@gscf/disputes-feature',
  '@gscf/ui-common',
  '@gscf/ui-form',
];

function restrictPackages(files, allowed, ignores = []) {
  const prohibited = packageNames.filter((name) => !allowed.includes(name));
  return {
    files,
    ignores,
    rules: {
      'no-restricted-imports': ['error', { paths: prohibited, patterns: [privateImports] }],
      'no-restricted-syntax': [
        'error',
        ...prohibited.map((name) => ({
          selector: `ImportExpression[source.value="${name}"]`,
          message: `This layer cannot depend on ${name}.`,
        })),
      ],
    },
  };
}

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
  restrictPackages(['libs/core/**/*.ts'], []),
  restrictPackages(['libs/data-access/disputes/**/*.ts', 'libs/ui/common/**/*.ts'], ['@gscf/core']),
  restrictPackages(
    ['libs/data-access/disputes-mock/**/*.ts'],
    ['@gscf/core', '@gscf/disputes-data-access'],
  ),
  restrictPackages(['libs/ui/form/**/*.ts'], ['@gscf/core', '@gscf/ui-common']),
  restrictPackages(
    ['libs/feature/**/*.ts'],
    packageNames.filter(
      (name) => !['@gscf/disputes-feature', '@gscf/disputes-mock'].includes(name),
    ),
  ),
  restrictPackages(
    ['apps/**/*.ts'],
    packageNames.filter((name) => name !== '@gscf/disputes-mock'),
    ['apps/disputes/src/mocks/start-mock-api.ts'],
  ),
  {
    files: ['apps/**/src/app/**/*.html', 'libs/**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
  },
);
