import { defineConfig } from '@playwright/test';

const localURL = `http://127.0.0.1:4173${process.env.TEST_BASE_PATH || '/ilnara/'}`;
export default defineConfig({
  testDir: './tests',
  timeout: 180000,
  expect: { timeout: 12000 },
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.TEST_URL || localURL,
    viewport: { width: 393, height: 873 },
    launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] },
    trace: 'retain-on-failure',
  },
  webServer: process.env.TEST_URL ? undefined : {
    command: 'npm run preview -- --port 4173',
    url: localURL,
    reuseExistingServer: !process.env.CI,
  },
});
