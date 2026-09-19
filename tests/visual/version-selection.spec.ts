import { readFile, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { renderTerrain as classicRenderTerrain } from '../../assets/versions/classic/browser.js';
import { parseSettings, parseSnapshot } from '../../src/core/settings/parse.js';
import { parseArchive } from '../../src/core/archive/parse.js';
import { renderSnapshot } from '../../src/demo/preview.js';
import { annualCardSvg } from '../../src/demo/archive-view.js';
import { CLASSIC_COMMIT } from '../../src/demo/renderer-version.js';
import type { DemoRenderer } from '../../src/demo/renderers.js';
import { clickDownload, fixturePath, importSnapshot, openDemo } from './helpers.js';

const classic: DemoRenderer = { version: 'classic', renderTerrain: classicRenderTerrain };
const bundleRoute = '**/versions/classic/browser.js*';

test('keeps edits made while a cold classic history entry is loading', async ({ page }) => {
  await openDemo(page, '?renderer=classic&title=History&mode=light&motion=off');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await page.getByLabel('Artwork version', { exact: true }).selectOption('current');
  await page.reload();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(bundleRoute, async (route) => {
    await gate;
    await route.continue();
  });
  const requested = page.waitForRequest((request) =>
    request.url().includes('/versions/classic/browser.js'),
  );
  await page.goBack();
  await requested;
  await page.getByLabel('Title', { exact: true }).fill('Edited while loading');
  await page.getByLabel('Title', { exact: true }).blur();
  await page.locator('button[data-mode="dark"]').click();
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Edited while loading');

  release();

  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Edited while loading');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-mode', 'dark');
  await expect(page.locator('#workflow-preview')).toContainText('title: "Edited while loading"');
  expect(new URL(page.url()).searchParams.get('title')).toBe('Edited while loading');
});

test('renders exact classic artwork and preserves the history through both versions and exports', async ({
  page,
}, info) => {
  const errors: string[] = [];
  const archiveRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (request.url().includes('/versions/classic/')) archiveRequests.push(request.url());
  });
  await openDemo(page);
  await importSnapshot(page, 'full-2025');
  const before = parseSnapshot((await clickDownload(page, 'Download snapshot')).toString());
  const currentSvg = await clickDownload(page, 'Download SVG');
  expect(archiveRequests).toEqual([]);
  await page.locator('#preview-panel').screenshot({ path: info.outputPath('current.png') });
  const selector = page.getByRole('combobox', { name: 'Artwork version', exact: true });

  await selector.focus();
  await expect(selector).toBeFocused();
  await selector.selectOption('classic');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await page.locator('#renderer-selection').scrollIntoViewIfNeeded();
  await page.screenshot({ path: info.outputPath('selector.png') });

  const classicSvg = await clickDownload(page, 'Download SVG');
  expect(classicSvg.toString()).toBe(
    renderSnapshot(before, before.settings, 'village', classic).dark,
  );
  expect(classicSvg.equals(currentSvg)).toBe(false);
  expect(parseSnapshot((await clickDownload(page, 'Download snapshot')).toString())).toEqual(
    before,
  );
  await page.locator('#preview-panel').screenshot({ path: info.outputPath('classic.png') });
  const png = await clickDownload(page, 'Download static PNG');
  expect(png.subarray(0, 8)).toEqual(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1680, 480]);
  await writeFile(info.outputPath('classic-static.png'), png);
  await writeFile(info.outputPath('classic.svg'), classicSvg);
  await writeFile(info.outputPath('current.svg'), currentSvg);
  await selector.selectOption('current');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  expect(await clickDownload(page, 'Download SVG')).toEqual(currentSvg);
  expect(parseSnapshot((await clickDownload(page, 'Download snapshot')).toString())).toEqual(
    before,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect(errors).toEqual([]);
});

test('pins classic workflow and preserves version across history, share links and reload', async ({
  page,
  context,
  browserName,
}) => {
  await openDemo(page, '?style=korean&artStyle=pixel&motion=off');
  const selector = page.getByLabel('Artwork version', { exact: true });

  await selector.selectOption('classic');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');

  const workflow = (await clickDownload(page, 'Download workflow')).toString();
  expect(workflow).toContain(`uses: t1seo/maeul-in-the-sky@${CLASSIC_COMMIT}`);
  expect(workflow).toContain('village_style: "korean"');
  expect(workflow).toContain('art_style: "pixel"');
  await expect(page.locator('#workflow-version')).toContainText(CLASSIC_COMMIT);
  if (browserName === 'chromium') {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Copy workflow', exact: true }).click();
    await expect.poll(() => page.evaluate(() => navigator.clipboard.readText())).toBe(workflow);
    await page.getByRole('button', { name: 'Copy settings link', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => navigator.clipboard.readText()))
      .toContain('renderer=classic');
  }
  const settings = parseSettings((await clickDownload(page, 'Download settings JSON')).toString());
  expect(settings).not.toHaveProperty('renderer');
  await selector.selectOption('current');
  await page.goBack();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await page.goForward();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  await selector.selectOption('classic');
  await page.reload();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await expect(selector).toHaveValue('classic');
  await expect(page.getByLabel('Village style', { exact: true })).toHaveValue('korean');
  await expect(page.getByLabel('Art style', { exact: true })).toHaveValue('pixel');
  expect(new URL(page.url()).searchParams.get('renderer')).toBe('classic');
});

test('keeps the latest choice when classic loads after a rapid return to current', async ({
  page,
}) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(bundleRoute, async (route) => {
    await gate;
    await route.continue();
  });
  await openDemo(page);
  const before = await page.locator('#live-terrain').innerHTML();
  const selector = page.getByLabel('Artwork version', { exact: true });
  const requested = page.waitForRequest((request) =>
    request.url().includes('/versions/classic/browser.js'),
  );
  await selector.selectOption('classic');
  await requested;
  await expect(page.locator('#renderer-status')).toContainText('Loading classic');
  await expect(page.locator('#live-terrain')).toHaveJSProperty('innerHTML', before);

  await selector.selectOption('current');
  const finished = page.waitForEvent('requestfinished', (request) =>
    request.url().includes('/versions/classic/browser.js'),
  );
  release();
  await finished;

  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  await expect(selector).toHaveValue('current');
  await expect(page.locator('#renderer-status')).toContainText('Current applied');
  await selector.selectOption('classic');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
});

test('retains the scene and exports after a failed classic load, then retries successfully', async ({
  page,
}) => {
  await page.route(bundleRoute, (route) => route.abort('failed'), { times: 1 });
  await openDemo(page);
  const before = await clickDownload(page, 'Download SVG');
  const snapshot = await clickDownload(page, 'Download snapshot');

  await page.getByLabel('Artwork version', { exact: true }).selectOption('classic');

  await expect(page.locator('#renderer-status')).toContainText('previous scene is kept');
  await expect(page.getByLabel('Artwork version', { exact: true })).toHaveValue('current');
  expect(await clickDownload(page, 'Download SVG')).toEqual(before);
  expect(await clickDownload(page, 'Download snapshot')).toEqual(snapshot);
  expect(new URL(page.url()).searchParams.get('renderer')).toBe('current');
  await page.getByLabel('Artwork version', { exact: true }).selectOption('classic');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
});

test('restores a one-shot world snapshot with separately selected classic artwork', async ({
  page,
}) => {
  await openDemo(page);
  const snapshot = parseSnapshot(await readFile(fixturePath('gaps-2025'), 'utf8'));
  await page.evaluate(
    (value) => sessionStorage.setItem('maeul-demo-transfer', JSON.stringify(value)),
    snapshot,
  );

  await page.goto('/docs/demo/?renderer=classic');

  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  expect(parseSnapshot((await clickDownload(page, 'Download snapshot')).toString())).toEqual(
    snapshot,
  );
  expect(await page.evaluate(() => sessionStorage.getItem('maeul-demo-transfer'))).toBeNull();
  await page.locator('#explore-world').evaluate((link) => {
    link.addEventListener('click', (event) => event.preventDefault());
  });
  await page.locator('#world-archive summary').click();
  await page.getByRole('link', { name: 'Open archived world explorer' }).click();
  expect(
    parseSnapshot(await page.evaluate(() => sessionStorage.getItem('maeul-world-transfer') ?? '')),
  ).toEqual(snapshot);
  await expect(page.locator('#explore-world')).toHaveAttribute('href', './world/?renderer=classic');
});

test('preserves malformed transfer data and rejects an unknown URL renderer', async ({ page }) => {
  await openDemo(page);
  await page.evaluate(() => sessionStorage.setItem('maeul-demo-transfer', '{invalid'));

  await page.goto('/docs/demo/?renderer=untrusted');

  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  await expect(page.locator('#settings-error')).toContainText('Invalid settings link');
  await expect(page.locator('#app-status')).toContainText('saved transfer are kept');
  expect(await page.evaluate(() => sessionStorage.getItem('maeul-demo-transfer'))).toBe('{invalid');
});

test('uses the selected old renderer for archive rows and comparison downloads', async ({
  page,
}) => {
  const archive = parseArchive(await readFile(fixturePath('two-year-archive'), 'utf8'));
  await openDemo(page, '?renderer=classic&motion=off');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');

  await page.getByTestId('snapshot-input').setInputFiles(fixturePath('two-year-archive'));

  await expect(page.locator('.annual-card')).toHaveCount(2);
  const first = archive.snapshots[0];
  if (!first) throw new TypeError('Archive fixture requires a snapshot');
  expect((await clickDownload(page, `Download ${first.year} card`)).toString()).toBe(
    annualCardSvg(first, 'dark', undefined, classic),
  );
  expect((await clickDownload(page, `Download ${first.year} SVG`)).toString()).toBe(
    annualCardSvg(first, 'dark', archive.comparison.normalization.maxCount, classic),
  );
  const png = await clickDownload(page, `Download ${first.year} PNG`);
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([840, 720]);
  await expect(page.locator('.annual-card').first()).toHaveAttribute('data-renderer', 'classic');
  await page.getByLabel('Artwork version', { exact: true }).selectOption('current');
  await expect(page.locator('.annual-card').first()).toHaveAttribute('data-renderer', 'current');
});
