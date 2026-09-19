import { expect, test, type Page } from '@playwright/test';
import { downloadBytes } from './helpers.js';
import { touchOrbitAndPinch } from '../world/three/touch-gesture.js';

async function settleCanvas(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      ),
  );
}

async function openWorld(page: Page) {
  await page.goto('/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#month-nav button').first()).toBeVisible();
}

async function settings(page: Page, values: Readonly<Record<string, string>>) {
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  for (const [name, value] of Object.entries(values))
    await page.locator(`#world-${name}`).selectOption(value);
  await page.locator('#atmosphere-dialog [data-close]').click();
  await settleCanvas(page);
}

async function enterThree(page: Page) {
  const available = await page.evaluate(() => {
    const context = document.createElement('canvas').getContext('webgl2');
    context?.getExtension('WEBGL_lose_context')?.loseContext();
    return context !== null;
  });
  const started = Date.now();
  await page.locator('#mode-three').click();
  await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false', {
    timeout: 30_000,
  });
  if (!available) {
    await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'map');
    await expect(page.locator('#world-fallback')).toBeVisible();
    await expect(page.locator('#world-host svg')).toBeVisible();
    test.info().annotations.push({
      type: 'WebGL unavailable',
      description: 'Verified explicit map fallback; this project did not render 3D.',
    });
    return false;
  }
  await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'three');
  await expect(page.locator('canvas[data-renderer="three"]')).toBeVisible();
  await expect(page.locator('#world-host canvas')).toHaveCount(1);
  await settleCanvas(page);
  test
    .info()
    .annotations.push({ type: 'Three startup ms', description: String(Date.now() - started) });
  return true;
}

test('shipped world renders genuine 3D with orbit, seasonal skies and PNG/GLB exports', async ({
  page,
}, info) => {
  test.setTimeout(120_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openWorld(page);
  await settings(page, { motion: 'off' });
  if (!(await enterThree(page))) return;
  const canvas = page.locator('canvas[data-renderer="three"]');
  await expect.poll(() => canvas.getAttribute('data-triangles')).not.toBe('0');
  const initial = await canvas.screenshot();
  await info.attach('three-world-day', { body: initial, contentType: 'image/png' });
  const box = await canvas.boundingBox();
  if (!box) throw new TypeError('Expected 3D viewport bounds');
  if (info.project.use.browserName === 'chromium' && info.project.use.viewport?.width === 390) {
    await touchOrbitAndPinch(page, box);
  } else {
    await page.mouse.move(box.x + box.width * 0.55, box.y + box.height * 0.5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.72, box.y + box.height * 0.58, { steps: 8 });
    await page.mouse.up();
  }
  await settleCanvas(page);
  const orbited = await canvas.screenshot();
  expect(orbited.equals(initial)).toBe(false);
  await info.attach('three-world-orbit', { body: orbited, contentType: 'image/png' });
  await page.locator('#reset-view').click();
  await page.locator('#month-nav button').nth(2).click();
  await settings(page, { season: 'spring', lighting: 'day', weather: 'clear' });
  await info.attach('three-month-spring', {
    body: await canvas.screenshot(),
    contentType: 'image/png',
  });
  await page.locator('#month-nav button').nth(6).click();
  await settings(page, { season: 'autumn', lighting: 'sunset', weather: 'clear' });
  await info.attach('three-month-sunset', {
    body: await canvas.screenshot(),
    contentType: 'image/png',
  });
  await settings(page, { season: 'winter', lighting: 'night', weather: 'snow' });
  await info.attach('three-month-night', {
    body: await canvas.screenshot(),
    contentType: 'image/png',
  });
  await page.locator('#reset-view').click();
  await info.attach('three-world-night', {
    body: await canvas.screenshot(),
    contentType: 'image/png',
  });
  expect((await canvas.screenshot()).equals(initial)).toBe(false);

  await page.locator('[data-dialog="photo-dialog"]').click();
  const pngReady = page.waitForEvent('download');
  await page.locator('#export-png').click();
  const png = await downloadBytes(await pngReady);
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect(png.readUInt32BE(16)).toBe(1600);
  expect(png.readUInt32BE(20)).toBe(1160);
  expect(png.length).toBeGreaterThan(20_000);
  await info.attach('three-postcard', { body: png, contentType: 'image/png' });
  const glbReady = page.waitForEvent('download');
  await page.locator('#export-glb').click();
  const glb = await downloadBytes(await glbReady);
  expect(glb.subarray(0, 4).toString()).toBe('glTF');
  expect(glb.readUInt32LE(4)).toBe(2);
  expect(glb.readUInt32LE(8)).toBe(glb.length);
  const json: unknown = JSON.parse(glb.subarray(20, 20 + glb.readUInt32LE(12)).toString());
  expect(json).toMatchObject({
    asset: { version: '2.0' },
    meshes: expect.any(Array),
    nodes: expect.any(Array),
  });
  await info.attach('three-world-model', { body: glb, contentType: 'model/gltf-binary' });
  expect(errors).toEqual([]);
});

test('ten map/3D switches release old canvases and reduced motion stays still', async ({
  page,
}, info) => {
  test.setTimeout(240_000);
  await openWorld(page);
  await settings(page, { motion: 'full', quality: 'low' });
  if (!(await enterThree(page))) return;
  const switches: number[] = [];
  for (let index = 0; index < 10; index++) {
    const previous = await page.locator('#world-host canvas').elementHandle();
    if (!previous) throw new TypeError('Expected active canvas');
    await page.locator('#mode-map').click();
    await expect(page.locator('#world-host canvas')).toHaveCount(0);
    await expect(page.locator('#world-host svg')).toBeVisible();
    const released = await previous.evaluate((node) => ({
      geometries: node.dataset.geometries,
      textures: node.dataset.textures,
    }));
    expect(released).toEqual({ geometries: '0', textures: '0' });
    expect(
      await previous.evaluate(
        (node) => node instanceof HTMLCanvasElement && node.getContext('webgl2')?.isContextLost(),
      ),
    ).toBe(true);
    await previous.dispose();
    const started = Date.now();
    await page.locator('#mode-three').click();
    await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false', {
      timeout: 30_000,
    });
    await expect(page.locator('#world-host canvas')).toHaveCount(1);
    await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'three');
    switches.push(Date.now() - started);
  }
  const canvas = page.locator('canvas[data-renderer="three"]');
  await settleCanvas(page);
  const frames = await canvas.getAttribute('data-frames');
  if (info.project.use.reducedMotion === 'reduce') {
    await canvas.scrollIntoViewIfNeeded();
    const first = await canvas.screenshot();
    await page.waitForTimeout(150);
    expect(await canvas.getAttribute('data-frames')).toBe(frames);
    expect(await canvas.getAttribute('data-elapsed')).toBe('0');
    expect((await canvas.screenshot()).equals(first)).toBe(true);
  } else await expect.poll(() => canvas.getAttribute('data-frames')).not.toBe(frames);
  await info.attach('three-render-budget', {
    body: Buffer.from(
      JSON.stringify({
        switches,
        ...(await canvas.evaluate((node) => ({
          calls: node.dataset.calls,
          triangles: node.dataset.triangles,
          frames: node.dataset.frames,
        }))),
      }),
    ),
    contentType: 'application/json',
  });
});

test('unavailable WebGL preserves an explicit usable map fallback', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
        return kind === 'webgl2' || kind === 'webgl'
          ? null
          : Reflect.apply(original, this, [kind, ...args]);
      },
    });
  });
  await openWorld(page);
  await page.locator('#mode-three').click();
  await expect(page.locator('#world-host')).toHaveAttribute('aria-busy', 'false');
  await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'map');
  await expect(page.locator('#world-fallback')).toBeVisible();
  await expect(page.locator('#world-host svg')).toBeVisible();
  await expect(page.locator('#world-host canvas')).toHaveCount(0);
  await page.locator('#month-nav button').nth(1).click();
  await expect(page.locator('#replay-label')).toContainText('2월');
});

test('context loss restores the map without losing the selected replay date', async ({ page }) => {
  await openWorld(page);
  await settings(page, { motion: 'off' });
  if (!(await enterThree(page))) return;
  await page.locator('#month-nav button').nth(3).click();
  const date = await page.locator('#replay-label').textContent();
  await page.locator('canvas[data-renderer="three"]').evaluate((canvas) => {
    canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true }));
  });
  await expect(page.locator('#world-host')).toHaveAttribute('data-renderer', 'map');
  await expect(page.locator('#world-host svg')).toBeVisible();
  await expect(page.locator('#world-fallback')).toBeVisible();
  await expect(page.locator('#replay-label')).toHaveText(date ?? '');
});
