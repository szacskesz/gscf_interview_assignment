import { defineConfig } from '@playwright/test';

const baseURL = 'http://127.0.0.1:6007';

export default defineConfig({
  testDir: './tests',
  use: { baseURL, trace: 'retain-on-failure' },
  outputDir: '../test-results/stories',
  webServer: {
    command: 'npm run storybook -- --port 6007 --ci',
    stdout: 'pipe',
    cwd: '..',
    url: `${baseURL}/index.json`,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
