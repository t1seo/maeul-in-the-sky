import { defineConfig } from '@playwright/test';

const serverUrl = `http://127.0.0.1:${process.env.MAEUL_QA_PORT ?? '4317'}`;

export default defineConfig({
  testDir: './tests/visual',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  outputDir: 'test-results/browser',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  snapshotPathTemplate: '{testDir}/snapshots/{platform}/{projectName}/{testFilePath}/{arg}{ext}',
  use: {
    baseURL: serverUrl,
    locale: 'en-US',
    timezoneId: 'UTC',
    colorScheme: 'dark',
    deviceScaleFactor: 1,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: (['chromium', 'firefox', 'webkit'] as const).flatMap((browserName) => [
    {
      name: `${browserName}-desktop`,
      use: { browserName, viewport: { width: 1280, height: 900 } },
    },
    { name: `${browserName}-mobile`, use: { browserName, viewport: { width: 390, height: 844 } } },
    {
      name: `${browserName}-reduced`,
      use: { browserName, viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' as const },
    },
  ]),
  webServer: {
    command: 'node --import tsx tests/visual/server.ts',
    url: `${serverUrl}/docs/demo/`,
    reuseExistingServer: false,
    timeout: 30_000,
  },
});
