import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

export default defineConfig({
  test: {
    maxWorkers: 1,
    fileParallelism: false,
    projects: [
      {
        test: {
          name: 'unit',
          sequence: { groupOrder: 1 },
          include: ['tests/**/*.test.ts'],
          exclude: ['tests/demo/browser/**', 'tests/world/browser/**'],
        },
      },
      {
        test: {
          name: 'world-browser',
          sequence: { groupOrder: 2 },
          include: ['tests/world/browser/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            fileParallelism: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1280, height: 900 },
          },
        },
      },
      {
        test: {
          name: 'demo-browser',
          sequence: { groupOrder: 3 },
          include: ['tests/demo/browser/*.browser.test.ts'],
          browser: {
            enabled: true,
            headless: true,
            fileParallelism: false,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
            viewport: { width: 1280, height: 900 },
          },
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/index.ts',
        'src/action.ts',
        'src/lib.ts',
        'src/core/types.ts',
        'src/themes/terrain/pixel/generated/**',
      ],
      thresholds: {
        statements: 95,
        branches: 90,
        functions: 95,
        lines: 95,
      },
    },
  },
});
