import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';
import { z } from 'zod';
import { assertPng } from './runtime.js';

export async function smokeWorld(page: Page): Promise<void> {
  const scripts = new Set<string>();
  page.on('request', (request) => {
    if (request.resourceType() === 'script') scripts.add(request.url());
  });
  const rendererVersion = await page.locator('#renderer-version').inputValue();
  await expect(page.locator('#world-archive')).not.toHaveAttribute('open');
  await page.locator('#world-archive summary').click();
  await page.locator('#explore-world').click();
  await expect(page).toHaveURL(
    (url) =>
      url.pathname.endsWith('/world/') && url.searchParams.get('renderer') === rendererVersion,
  );
  await expect(page.locator('.archive-notice')).toBeVisible();
  await expect(page.locator('#world-host svg').first()).toBeVisible();
  await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false');
  assert.ok(![...scripts].some((url) => /\/three-[^/]+\.js$/.test(url)));
  const total = await page.locator('#stat-contributions').innerText();
  for (const layout of ['island', 'seasonal']) {
    await page.locator('#world-layout').selectOption(layout);
    await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#world-layout')).toHaveValue(layout);
    assert.equal(await page.locator('#stat-contributions').innerText(), total);
  }
  await page.locator('#mode-three').click();
  await expect(page.locator('#mode-three')).toHaveAttribute('aria-pressed', 'true', {
    timeout: 30_000,
  });
  await expect(page.locator('#world-host canvas')).toBeVisible();
  assert.ok([...scripts].some((url) => /\/three-[^/]+\.js$/.test(url)));
  assert.equal(await page.locator('#stat-contributions').innerText(), total);

  await page.locator('[data-dialog="photo-dialog"]').click();
  const worldDownload = page.waitForEvent('download');
  await page.locator('#export-world').click();
  const worldPath = await (await worldDownload).path();
  assert.ok(worldPath);
  const world = z
    .object({
      kind: z.literal('maeul-world'),
      schemaVersion: z.literal(1),
      scene: z.object({
        settings: z.object({ layout: z.literal('seasonal') }),
        islands: z.array(z.object({ id: z.string() })).length(4),
        days: z.array(z.object({ date: z.string() })).min(1),
        modelRecipes: z.array(z.object({ parts: z.array(z.unknown()).min(1) })).min(1),
      }),
    })
    .parse(JSON.parse(readFileSync(worldPath, 'utf8')));
  assert.equal(new Set(world.scene.days.map((day) => day.date)).size, world.scene.days.length);

  const pngDownload = page.waitForEvent('download');
  await page.locator('#export-png').click();
  const pngPath = await (await pngDownload).path();
  assert.ok(pngPath);
  assertPng(pngPath, 1600, 1160);
  await page.locator('#photo-dialog [data-close]').click();
  await page.locator('#mode-map').click();
  await expect(page.locator('#world-host canvas')).toHaveCount(0);
  await expect(page.locator('#world-host svg').first()).toBeVisible();
  assert.equal(await page.locator('#stat-contributions').innerText(), total);
  console.log('PASS packed world: three layouts, lazy real 3D, seasonal JSON/PNG export, map');
}
