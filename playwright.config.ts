import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'] }
    }
  ],
  webServer: [
    {
      command: 'node backend/dist/index.js',
      url: 'http://localhost:4000/api/ready',
      reuseExistingServer: !process.env.CI
    },
    {
      command: 'node ../node_modules/vite/bin/vite.js preview',
      cwd: './frontend',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI
    }
  ]
});
