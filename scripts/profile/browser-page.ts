import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import type { SnapshotV1 } from '../../src/core/snapshot-types.js';
import { assertPngBytes, parseThreeMetrics } from './proof.js';

export async function settleCapture(page: Page): Promise<void> {
  await page.waitForFunction(
    () => document.getElementById('world-host')?.getAttribute('aria-busy') === 'false',
  );
  await page.evaluate(
    () =>
      new Promise<void>((done) => {
        requestAnimationFrame(() => requestAnimationFrame(() => done()));
      }),
  );
  const error = await page.locator('#world-status').getAttribute('data-error');
  if (error === 'true')
    throw new Error(`World app: ${await page.locator('#world-status').textContent()}`);
}

export async function lighting(page: Page, value: 'day' | 'night'): Promise<void> {
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  await page.locator('#world-lighting').selectOption(value);
  await page.locator('#atmosphere-dialog [data-close]').click();
  await settleCapture(page);
}

export async function prepareCapturePage(
  page: Page,
  origin: string,
  snapshot: SnapshotV1,
): Promise<void> {
  const last = snapshot.weeks
    .flatMap((week) => week.days.map((day) => day.date))
    .sort()
    .at(-1);
  const fixedTime =
    snapshot.source.fetchedAt ??
    `${last ?? `${String(snapshot.year).padStart(4, '0')}-12-31`}T12:00:00.000Z`;
  await page.clock.setFixedTime(new Date(fixedTime));
  await page.goto(`${origin}/world/`, { waitUntil: 'load' });
  await page.waitForSelector('#world-host[data-ready="true"]');
  await page.locator('#world-file').setInputFiles({
    name: 'profile-snapshot.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(snapshot)),
  });
  await page.waitForFunction(() => {
    const input = document.getElementById('world-file');
    return input instanceof HTMLInputElement && input.value === '';
  });
  await settleCapture(page);
  await page.addStyleTag({
    content:
      '#world-host{width:1600px!important;height:1000px!important;min-height:1000px!important;max-height:none!important;flex:none!important}',
  });
  await page.locator('#world-layout').selectOption('seasonal-circle');
  await settleCapture(page);
  await page.locator('[data-dialog="atmosphere-dialog"]').click();
  for (const [control, value] of [
    ['season', 'calendar'],
    ['weather', 'clear'],
    ['quality', 'high'],
    ['motion', 'off'],
    ['lighting', 'day'],
  ])
    await page.locator(`#world-${control}`).selectOption(value);
  await page.locator('#atmosphere-dialog [data-close]').click();
  await settleCapture(page);
  const font = await readFile(new URL('../../assets/fonts/NotoSansKR.ttf', import.meta.url));
  await page.evaluate(async (encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const face = await new FontFace('MaeulProfile', bytes, { weight: '100 900' }).load();
    document.fonts.add(face);
    await document.fonts.ready;
  }, font.toString('base64'));
  await page.locator('#mode-three').click();
  await settleCapture(page);
  if ((await page.locator('#world-host').getAttribute('data-renderer')) !== 'three')
    throw new Error('Three/WebGL is unavailable; refusing to publish a map fallback.');
  await page.locator('#reset-view').click();
  await settleCapture(page);
}

export async function readThreeMetrics(page: Page) {
  return parseThreeMetrics(
    await page.locator('#world-host').evaluate((host) => {
      const canvas = host.querySelector('canvas');
      const gl = canvas?.getContext('webgl2');
      return {
        renderer: host.getAttribute('data-renderer'),
        webgl2: Boolean(gl),
        contextLost: gl?.isContextLost() ?? true,
        calls: Number(canvas?.dataset.calls),
        triangles: Number(canvas?.dataset.triangles),
        geometries: Number(canvas?.dataset.geometries),
        textures: Number(canvas?.dataset.textures),
        frames: Number(canvas?.dataset.frames),
        elapsed: Number(canvas?.dataset.elapsed),
        width: host.clientWidth,
        height: host.clientHeight,
        version: gl?.getParameter(gl.VERSION),
      };
    }),
  );
}

export async function downloadCapture(
  page: Page,
  control: 'png' | 'world',
  path: string,
): Promise<void> {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator(`#export-${control}`).click(),
  ]);
  await download.saveAs(path);
  const failure = await download.failure();
  if (failure) throw new Error(`World download failed: ${failure}`);
}

export async function inspectPng(page: Page, path: string) {
  const bytes = await readFile(path);
  assertPngBytes(bytes);
  const pixels = await page.evaluate(async (encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    try {
      if (bitmap.width !== 1600 || bitmap.height !== 1160)
        throw new Error('Invalid decoded image size.');
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 100;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Cannot inspect profile image pixels.');
      context.drawImage(bitmap, 0, 0, 1600, 1000, 0, 0, 160, 100);
      const { data } = context.getImageData(0, 0, 160, 100);
      const colors = new Set<number>();
      let opaque = 0;
      for (let index = 0; index < data.length; index += 4) {
        colors.add((data[index] >> 4) * 256 + (data[index + 1] >> 4) * 16 + (data[index + 2] >> 4));
        if (data[index + 3] === 255) opaque++;
      }
      return { colors: colors.size, opaque, sampled: data.length / 4 };
    } finally {
      bitmap.close();
    }
  }, bytes.toString('base64'));
  if (pixels.colors < 32 || pixels.opaque !== pixels.sampled)
    throw new Error('The captured scene is blank, transparent or lacks rendered detail.');
  return pixels;
}
