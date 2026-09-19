import { expect, test } from '@playwright/test';
import { createWorldDocument, parseWorldDocument } from '../../src/world/data/document.js';
import { buildWorld, defaultWorldView } from '../../src/world/model/index.js';
import { inputFor, sequence } from '../world/model/helpers.js';
import { downloadBytes } from './helpers.js';

test('a circular sky island opens directly in 3D and exports the same rolling history', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const source = inputFor(sequence('2025-09-19', 366, 7), 2026);
  const scene = buildWorld({
    ...source,
    settings: { ...source.settings, layout: 'seasonal-circle' },
  });
  const world = createWorldDocument({
    scene,
    sourceSnapshot: source.snapshot,
    view: { ...defaultWorldView(scene), motion: 'off', weather: 'clear' },
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    (value) => sessionStorage.setItem('maeul-world-transfer', JSON.stringify(value)),
    world,
  );

  await page.goto('/docs/demo/world/?view=three');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true', {
    timeout: 45_000,
  });

  await expect(page.locator('#world-layout')).toHaveValue('seasonal-circle');
  await expect(page.locator('#month-nav [data-month]')).toHaveCount(13);
  await expect(page.locator('#season-legend [data-season]')).toHaveCount(4);
  const canvas = page.locator('canvas[data-renderer="three"]');
  if (await canvas.count()) {
    await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'three');
    expect(Number(await canvas.getAttribute('data-triangles'))).toBeGreaterThan(0);
    await info.attach('four-season-circle-three', {
      body: await canvas.screenshot(),
      contentType: 'image/png',
    });
  } else {
    await expect(page.locator('#world-fallback')).toBeVisible();
    await expect(page.locator('#world-host svg')).toHaveAttribute('data-layout', 'seasonal-circle');
    info.annotations.push({
      type: 'WebGL unavailable',
      description: 'Verified the circular map fallback; this browser did not render Three.',
    });
  }
  await page.locator('[data-dialog="photo-dialog"]').click();
  const pending = page.waitForEvent('download');
  await page.locator('#export-world').click();
  const saved = parseWorldDocument((await downloadBytes(await pending)).toString('utf8'));
  expect(saved.scene).toEqual(scene);
  expect(saved.sourceSnapshot).toEqual(source.snapshot);
  expect(saved.scene.terrain.waterways.filter((way) => way.kind === 'waterfall')).toHaveLength(4);
  await page.locator('#photo-dialog [data-close]').click();
  await page.locator('#mode-map').click();
  await expect(page.locator('#world-host svg')).toHaveAttribute('data-layout', 'seasonal-circle');
  await expect(page.locator('#world-host [data-season-label]')).toHaveCount(4);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});
