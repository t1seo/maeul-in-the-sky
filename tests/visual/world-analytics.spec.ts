import { expect, test, type Page } from '@playwright/test';
import { parseSnapshot } from '../../src/core/settings/parse.js';

const snapshot = parseSnapshot({
  schemaVersion: 1,
  kind: 'maeul-snapshot',
  username: 'analytics-fixture',
  year: 2024,
  settings: { motion: 'off' },
  source: { kind: 'import' },
  weeks: [
    {
      firstDay: '2024-01-28',
      days: [
        { date: '2024-01-31', count: 5, level: 1 },
        { date: '2024-02-01', count: 0, level: 0 },
        { date: '2024-02-02', count: 10, level: 2 },
      ],
    },
  ],
  activity: {
    source: 'github-contributions',
    from: '2024-01-31T00:00:00.000Z',
    to: '2024-02-02T23:59:59.999Z',
    months: [
      {
        month: '2024-01',
        from: '2024-01-31T00:00:00.000Z',
        to: '2024-01-31T23:59:59.999Z',
        commits: 3,
        pullRequests: 1,
        issues: 0,
        reviews: 0,
        repositories: 0,
        restricted: 1,
      },
      {
        month: '2024-02',
        from: '2024-02-01T00:00:00.000Z',
        to: '2024-02-02T23:59:59.999Z',
        commits: 7,
        pullRequests: 2,
        issues: 1,
        reviews: 0,
        repositories: 0,
        restricted: 0,
      },
    ],
  },
});

async function boot(page: Page): Promise<void> {
  await page.goto('/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
}

async function importSnapshot(page: Page, value: unknown): Promise<void> {
  await page.locator('#world-file').setInputFiles({
    name: 'activity.snapshot.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(value)),
  });
  await expect(page.locator('#world-source')).toContainText('@analytics-fixture');
}

function metric(page: Page, name: string) {
  return page
    .locator('.analytics-metric')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
}

test('activity shows actual source counts, month filters and accessible chart values', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await boot(page);
  await importSnapshot(page, snapshot);
  await page.locator('#replay-range').fill('0');
  await page.locator('#replay-range').dispatchEvent('input');
  await page.locator('#open-analytics').click();
  await expect(page.locator('#analytics-dialog')).toBeVisible();
  await expect(metric(page, 'Contributions')).toContainText('15');
  await expect(metric(page, 'Commit contributions')).toContainText('10');
  await expect(metric(page, 'PRs opened')).toContainText('3');
  await expect(page.locator('#analytics-period')).toContainText('2024-01-31');
  await expect(page.locator('#analytics-period')).toContainText('2024-02-02');
  await expect(page.locator('#analytics-breakdown svg')).toBeVisible();
  await page.locator('#analytics-month').selectOption('2024-02');
  await expect(metric(page, 'Contributions')).toContainText('10');
  await expect(metric(page, 'Commit contributions')).toContainText('7');
  await expect(metric(page, 'PRs opened')).toContainText('2');
  await page.locator('#analytics-granularity').selectOption('day');
  const point = page.locator('#analytics-trend svg [tabindex="0"]').first();
  await point.focus();
  await expect(page.locator('#analytics-trend .analytics-tooltip')).toContainText('0');
  await page.getByText('View the numbers', { exact: true }).click();
  await expect(page.locator('#analytics-table')).toContainText('2024-02-01');
  await expect(page.locator('#analytics-table')).toContainText('2024-02-02');
  await expect(page.locator('#analytics-table table').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('#analytics-dialog [data-close]').click();
  await expect(page.locator('#open-analytics')).toBeFocused();
  expect(errors).toEqual([]);
});

test('old snapshots retain real contribution charts without invented commit counts', async ({
  page,
}) => {
  await boot(page);
  const { activity: _activity, ...legacy } = snapshot;
  await importSnapshot(page, legacy);
  await page.locator('#open-analytics').click();
  await expect(metric(page, 'Contributions')).toContainText('15');
  await expect(page.locator('#analytics-trend svg')).toBeVisible();
  await expect(page.locator('#analytics-breakdown svg')).toHaveCount(0);
  await expect(page.locator('#analytics-availability')).toContainText(/not available|unavailable/i);
  await expect(metric(page, 'Commit contributions').locator('.analytics-metric-value')).toHaveText(
    'Not available',
  );
});

test('English native dropdowns keep an inset arrow and usable mobile layout', async ({ page }) => {
  await boot(page);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#actor-follow option').first()).toHaveText('Free exploration');
  for (const id of ['actor-follow', 'world-layout', 'world-version']) {
    const style = await page.locator(`#${id}`).evaluate((node) => {
      const css = getComputedStyle(node);
      return {
        padding: parseFloat(css.paddingRight),
        image: css.backgroundImage,
        position: css.backgroundPositionX,
      };
    });
    expect(style.padding).toBeGreaterThanOrEqual(42);
    expect(style.image).toContain('data:image/svg+xml');
    expect(style.position).toContain('16px');
  }
  await page.locator('#world-layout').selectOption('island');
  await expect(page.locator('#world-layout')).toHaveValue('island');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.emulateMedia({ forcedColors: 'active' });
  expect(
    await page.locator('#actor-follow').evaluate((node) => getComputedStyle(node).backgroundImage),
  ).toBe('none');
});

test('Activity in the SVG demo carries the current history into the dashboard', async ({
  page,
}) => {
  await page.goto('/docs/demo/');
  await page.locator('#explore-activity').click();
  await expect(page).toHaveURL(/panel=activity/);
  await expect(page.locator('#analytics-dialog')).toBeVisible();
  await expect(page.locator('#analytics-source')).toContainText(/sample/i);
  await expect(page.locator('#analytics-trend svg')).toBeVisible();
});
