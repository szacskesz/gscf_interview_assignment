import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  stories: ['../libs/ui/**/*.stories.ts'],
  framework: { name: '@storybook/angular', options: {} },
  staticDirs: ['../apps/disputes/public'],
};

export default config;
