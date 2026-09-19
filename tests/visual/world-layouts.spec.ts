import { expect, test, type Page } from '@playwright/test';
import { createWorldDocument, parseWorldDocument } from '../../src/world/data/document.js';
import { buildWorld, defaultWorldView } from '../../src/world/model/index.js';
import type { WorldInput } from '../../src/world/model/types.js';
import { inputFor } from '../world/model/helpers.js';
import { downloadBytes } from './helpers.js';

const choices = [
  ['archipelago', '월별 군도'],
  ['island', '하나의 큰 섬'],
  ['seasonal', '사계절 군도'],
] as const;

function world(source: WorldInput) {
  const scene = buildWorld(source);
  return createWorldDocument({
    scene,
    sourceSnapshot: source.snapshot,
    view: { ...defaultWorldView(scene), motion: 'off' },
  });
}

const annual = world(
  inputFor([
    ['2024-01-01', 5],
    ['2024-02-29', 0],
    ['2024-12-31', 9],
  ]),
);

async function boot(page: Page, document = annual): Promise<void> {
  await page.addInitScript(
    (value) => sessionStorage.setItem('maeul-world-transfer', JSON.stringify(value)),
    document,
  );
  await page.goto(process.env.MAEUL_WORLD_QA_URL ?? '/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
}

async function choose(page: Page, layout: string): Promise<void> {
  await page.locator('#world-layout').selectOption(layout);
  await expect(page.locator('#world-host svg')).toHaveAttribute('data-layout', layout);
}

async function upload(page: Page, value: string): Promise<void> {
  await page.locator('#world-file').setInputFiles({
    name: 'world.json',
    mimeType: 'application/json',
    buffer: Buffer.from(value),
  });
  await expect(page.locator('#world-status')).toContainText('세계를 가져왔습니다');
}

test('all three landforms preserve selected date, counts and mobile access', async ({
  page,
}, info) => {
  // Given an annual world and a selected leap day.
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await boot(page);
  await page.locator('#world-date').fill('2024-02-29');
  await page.locator('#world-date').dispatchEvent('change');
  const calendar = await page
    .locator('#world-host [data-day-id]')
    .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label')));
  // When each of the three landforms is selected.
  for (const [layout, label] of choices) {
    await choose(page, layout);
    // Then the dated evidence remains unchanged and all controls fit the viewport.
    await expect(page.locator('#map-caption')).toContainText(label);
    await expect(page.locator('#world-date')).toHaveValue('2024-02-29');
    await expect(page.locator('#day-details')).toContainText('0번의 기여');
    await expect(page.locator('#stat-contributions')).toHaveText('5');
    expect(
      await page
        .locator('#world-host [data-day-id]')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
    ).toEqual(calendar);
    await expect(page.locator('#layout-note')).toBeVisible();
    await expect(page.locator('#season-legend [data-season]')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.locator('#world-layout').scrollIntoViewIfNeeded();
    const screenshotPath = info.outputPath(`${layout}-explorer.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    await info.attach(`${layout}-explorer`, {
      path: screenshotPath,
      contentType: 'image/png',
    });
  }
  await expect(page.locator('#world-version option[value="classic"]')).toHaveCount(1);
  await expect(page.locator('#world-host [data-season-label]')).toHaveCount(4);
  expect(errors).toEqual([]);
});

test('seasonal layout and date survive local reload and exported JSON import', async ({ page }) => {
  // Given a seasonal world saved with an observed zero day selected.
  await boot(page);
  await choose(page, 'seasonal');
  await page.locator('#world-date').fill('2024-02-29');
  await page.locator('#world-date').dispatchEvent('change');
  await page.locator('#save-world').click();
  await expect(page.locator('#world-status')).toContainText('보관했습니다');
  await page.locator('[data-dialog="photo-dialog"]').click();
  const pending = page.waitForEvent('download');
  await page.locator('#export-world').click();
  const serialized = (await downloadBytes(await pending)).toString('utf8');
  const saved = parseWorldDocument(serialized);
  // When the stored world is reopened after reload and the export is imported again.
  await page.reload();
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-dialog="library-dialog"]').click();
  await page
    .locator('#library-list')
    .getByRole('button', { name: '세계 열기', exact: true })
    .click();
  await expect(page.locator('#world-layout')).toHaveValue('seasonal');
  await expect(page.locator('#world-date')).toHaveValue('2024-02-29');
  await choose(page, 'archipelago');
  await upload(page, serialized);
  // Then the frozen layout, contribution evidence and selected date are restored.
  expect(saved.scene.settings.layout).toBe('seasonal');
  expect(saved.scene.days).toEqual(annual.scene.days);
  await expect(page.locator('#world-layout')).toHaveValue('seasonal');
  await expect(page.locator('#world-date')).toHaveValue('2024-02-29');
  await expect(page.locator('#stat-contributions')).toHaveText('5');
  await expect(page.locator('#day-details')).toContainText('0번의 기여');
});

test('rolling 13-month navigation remains chronological across seasonal geography', async ({
  page,
}) => {
  // Given a scene spanning January in two years.
  await boot(
    page,
    world(
      inputFor([
        ['2024-01-01', 5],
        ['2025-01-01', 9],
      ]),
    ),
  );
  // When seasonal grouping is selected.
  await choose(page, 'seasonal');
  // Then all months remain ordered by full year-month with unique accessible names.
  const months = page.locator('#month-nav [data-month]');
  await expect(months).toHaveCount(13);
  expect(
    await months.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-month'))),
  ).toEqual([
    ...Array.from({ length: 12 }, (_, index) => `2024-${String(index + 1).padStart(2, '0')}`),
    '2025-01',
  ]);
  await page.getByRole('button', { name: '2024년 1월 · 겨울 풍경', exact: true }).click();
  await expect(page.locator('#world-date')).toHaveValue('2024-01-31');
  await page.getByRole('button', { name: '2025년 1월 · 겨울 풍경', exact: true }).click();
  await expect(page.locator('#world-date')).toHaveValue('2025-01-31');
  await expect(page.locator('#season-legend')).toContainText('2024년');
  await expect(page.locator('#season-legend')).toContainText('2025년');
});

test('partial southern worlds keep their actual season labels during a scenery override', async ({
  page,
}) => {
  // Given only February and March in the southern hemisphere.
  const source = inputFor(
    [
      ['2024-02-29', 0],
      ['2024-03-01', 5],
    ],
    2024,
    { from: '2024-02-29', to: '2024-03-01' },
  );
  await boot(page, world({ ...source, settings: { ...source.settings, hemisphere: 'south' } }));
  await choose(page, 'seasonal');
  const labels = await page.locator('#season-legend').textContent();
  // When spring scenery is previewed over the same geography.
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  await page.locator('#world-season').selectOption('spring');
  await page.locator('#atmosphere-dialog [data-close]').click();
  // Then just the represented summer/autumn islands remain labelled.
  await expect(page.locator('#season-legend [data-season]')).toHaveCount(2);
  await expect(page.locator('#world-host [data-season-label]')).toHaveCount(2);
  expect(await page.locator('#season-legend').textContent()).toBe(labels);
  await expect(page.locator('#season-legend')).toContainText('여름');
  await expect(page.locator('#season-legend')).toContainText('가을');
  await expect(page.locator('#season-note')).toContainText('섬의 계절 구분');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
