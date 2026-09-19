import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { chromium, type Browser, type Page } from '@playwright/test';
import { startPreviewServer } from '../../src/preview/server.js';
import { parseWorldDocument } from '../../src/world/data/document.js';
import { PROFILE_FILES, type ProfileOptions } from './options.js';
import { type ProfileInput, sha256 } from './input.js';
import { browserEnvironment, restrictCaptureNetwork } from './security.js';
import {
  downloadCapture,
  inspectPng,
  lighting,
  prepareCapturePage,
  readThreeMetrics,
  settleCapture,
} from './browser-page.js';
import { assertCanonicalWorld, assertThemeWorld } from './proof.js';

async function captureTheme(page: Page, directory: string, theme: 'light' | 'dark') {
  const metrics = await readThreeMetrics(page);
  await page.locator('[data-dialog="photo-dialog"]').click();
  const pngPath = join(directory, PROFILE_FILES[theme]);
  const worldPath = join(directory, theme === 'light' ? PROFILE_FILES.world : 'night-world.json');
  await downloadCapture(page, 'png', pngPath);
  await downloadCapture(page, 'world', worldPath);
  await page.locator('#photo-dialog [data-close]').click();
  await settleCapture(page);
  const pixels = await inspectPng(page, pngPath);
  const finalMetrics = await readThreeMetrics(page);
  const document = parseWorldDocument(await readFile(worldPath, 'utf8'));
  return {
    document,
    proof: {
      metrics,
      finalMetrics,
      pixels,
      pngSha256: sha256(await readFile(pngPath)),
      worldSha256: sha256(await readFile(worldPath)),
    },
  };
}

export async function captureWithBrowser(
  input: ProfileInput,
  options: ProfileOptions,
  directory: string,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  const server = await startPreviewServer({
    host: '127.0.0.1',
    port: 0,
    token: '',
    assetRoot: options.assetRoot,
  });
  let browser: Browser | undefined;
  const interrupted = (): void => {
    void Promise.allSettled([browser?.close(), server.close()]);
  };
  signal.addEventListener('abort', interrupted, { once: true });
  try {
    signal.throwIfAborted();
    browser = await chromium.launch({
      headless: true,
      env: browserEnvironment(process.env),
      args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    signal.throwIfAborted();
    const context = await browser.newContext({
      viewport: { width: 1800, height: 1400 },
      deviceScaleFactor: 1,
      locale: 'en-US',
      timezoneId: 'UTC',
      reducedMotion: 'reduce',
      colorScheme: 'light',
      serviceWorkers: 'block',
      acceptDownloads: true,
    });
    const network = await restrictCaptureNetwork(context, server.url);
    const page = await context.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.setDefaultTimeout(90_000);
    await prepareCapturePage(page, server.url, input.snapshot);
    const day = await captureTheme(page, directory, 'light');
    assertCanonicalWorld(day.document, input.snapshot, input.scene);
    await lighting(page, 'night');
    const night = await captureTheme(page, directory, 'dark');
    assertThemeWorld(day.document, night.document);
    if (day.proof.pngSha256 === night.proof.pngSha256)
      throw new Error('The two lighting captures unexpectedly contain identical pixels.');
    signal.throwIfAborted();
    network.assertOffline();
    if (errors.length) throw new Error(`World browser errors: ${errors.join('; ')}`);
    return {
      browser: browser.version(),
      renderer: 'Three.js / WebGL2',
      requestedBackend: 'SwiftShader',
      inputSha256: input.sha256,
      sourceDigest: day.document.scene.sourceDigest,
      canonicalView: day.document.view,
      light: day.proof,
      dark: night.proof,
    };
  } finally {
    signal.removeEventListener('abort', interrupted);
    await Promise.all([browser?.close(), server.close()]);
  }
}
