import { expect, test } from '@playwright/test';
import { clickDownload, openDemo } from './helpers.js';
import { createSnapshot } from '../../src/core/settings/parse.js';
import { calendarFixture } from '../themes/terrain/scene/fixtures.js';

test('shows varied waterside scenery in the sample and preserves it in pixel exports', async ({
  page,
}, testInfo) => {
  // Given: the same seeded sample whose water tiles previously repeated 26 sailboats.
  await openDemo(page, '?style=classic&motion=off');
  const svg = page.locator('#live-terrain > svg');
  const placements = svg.locator('[data-placement-id][data-catalog-id]');
  const identities = await placements.evaluateAll((nodes) =>
    nodes.map((node) => [
      node.getAttribute('data-placement-id'),
      node.getAttribute('data-catalog-id'),
    ]),
  );
  expect(identities.filter(([, id]) => id === 'sailboat').length).toBeLessThanOrEqual(8);
  await expect(svg).toHaveAttribute('data-scene', /^layout-v3:/);
  const waterscapes = new Set(['lotusPond', 'reedMarsh', 'willowPond']);
  expect(
    new Set(identities.flatMap(([, id]) => (id && waterscapes.has(id) ? [id] : []))).size,
  ).toBeGreaterThanOrEqual(2);

  // When: the user changes artwork and downloads the actual scene.
  await page.getByRole('combobox', { name: 'Art style', exact: true }).selectOption('pixel');
  await expect(svg).toHaveAttribute('data-art-style', 'pixel');
  const exported = (await clickDownload(page, 'Download SVG')).toString();

  // Then: variety is present in the image and export without changing activity or identities.
  await expect(page.locator('#stat-total')).toHaveText('1,582');
  expect(
    await placements.evaluateAll((nodes) =>
      nodes.map((node) => [
        node.getAttribute('data-placement-id'),
        node.getAttribute('data-catalog-id'),
      ]),
    ),
  ).toEqual(identities);
  expect(exported).toContain('data-art-style="pixel"');
  expect(exported).toMatch(/data-catalog-id="(?:lotusPond|reedMarsh|willowPond)"/);
  await testInfo.attach('varied-nature-pixel', {
    body: await page.locator('#preview-panel').screenshot(),
    contentType: 'image/png',
  });
});

test('explains earned consistency and retains seasonal rewards with motion off', async ({
  page,
}) => {
  const snapshot = createSnapshot(calendarFixture('2025-06-01', 28, 3), { motion: 'off' });
  await openDemo(page);
  await page.getByTestId('snapshot-input').setInputFiles({
    name: 'consistent-month.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(snapshot)),
  });
  await expect(page.locator('#stat-total')).toHaveText('84');
  await page.locator('#day-explorer > summary').click();
  await page.locator('#date-select').selectOption('2025-06-28');
  const details = page.locator('#date-details');
  await expect(details).toHaveAttribute('data-consistency-tier', '3');
  await expect(details).toHaveAttribute('data-consistency-active-days', '28');
  await expect(details).toHaveAttribute('data-consistency-observed-days', '28');
  await expect(details).toContainText('trailing 28 days');
  const effects = page.locator('#live-terrain [data-consistency-id]');
  await expect(effects.first()).toBeAttached();
  expect(await effects.count()).toBeLessThanOrEqual(10);
  await expect(page.locator('#live-terrain [data-consistency-tier="3"]').first()).toBeAttached();
  const exported = (await clickDownload(page, 'Download SVG')).toString();
  expect(exported).toContain('data-consistency-tier="3"');
  expect(exported).not.toMatch(/<animate|@keyframes/);
});
