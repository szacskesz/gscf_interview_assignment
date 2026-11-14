import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4201';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env['CI']),
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', grep: /@cross-browser/, use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', grep: /@cross-browser/, use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', grep: /@mobile/, use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm start -- --configuration e2e --host 127.0.0.1 --port 4201',
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
