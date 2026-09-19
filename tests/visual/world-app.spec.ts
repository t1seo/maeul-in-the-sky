import { expect, test, type Browser, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { request } from 'node:http';
import { annualSnapshot } from '../core/settings/archive-fixtures.js';
import {
  dataHttpFixture,
  repositoryApiFixture,
  releaseApiFixture,
} from '../world/data/http-fixture.js';
import { createWorldDocument } from '../../src/world/data/document.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../src/world/model/fixture.js';

const tiny = createWorldDocument({
  scene: TINY_WORLD_SCENE,
  sourceSnapshot: TINY_WORLD_INPUT.snapshot,
});
const archive = {
  kind: 'maeul-archive',
  schemaVersion: 1,
  snapshots: [annualSnapshot(2023, [5, 0, 8]), annualSnapshot(2024, [5, 0, 8])],
  comparison: { years: [2023, 2024], normalization: { kind: 'fixed', maxCount: 50 } },
};

async function upload(page: Page, value: unknown): Promise<void> {
  await page.locator('#world-file').setInputFiles({
    name: 'world.json',
    mimeType: 'application/json',
    buffer: Buffer.from(typeof value === 'string' ? value : JSON.stringify(value)),
  });
}
async function boot(page: Page): Promise<void> {
  await page.goto('/docs/demo/world/');
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
  await expect(page.locator('#world-host svg')).toBeVisible();
}
async function openDialog(page: Page, name: string): Promise<void> {
  await page.locator(`[data-dialog="${name}"]`).click();
  await expect(page.locator(`#${name}`)).toBeVisible();
}
async function closeDialog(page: Page, name: string): Promise<void> {
  await page.locator(`#${name} [data-close]`).click();
  await expect(page.locator(`#${name}`)).not.toBeVisible();
}

test('archive years, replay, atmosphere and saved views survive a page reload', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await boot(page);
  await upload(page, archive);
  await expect(page.locator('#world-period')).toContainText('2023-01-01 — 2023-01-03');
  await openDialog(page, 'library-dialog');
  await page.locator('#library-year').selectOption('2024');
  await page.locator('#library-list').getByRole('button', { name: '불러온 세계 열기' }).click();
  await expect(page.locator('#world-date')).toHaveValue('2024-01-03');
  await page.locator('#world-date').fill('2024-01-01');
  await page.locator('#world-date').dispatchEvent('change');
  await expect(page.locator('#day-details')).toContainText('5번의 기여');
  await page.locator('#replay-play').click();
  await expect(page.locator('#replay-play')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#replay-play').click();
  await expect(page.locator('#replay-play')).toHaveAttribute('aria-pressed', 'false');
  await openDialog(page, 'atmosphere-dialog');
  await page.locator('#world-lighting').selectOption('sunset');
  await page.locator('#world-weather').selectOption('rain');
  await closeDialog(page, 'atmosphere-dialog');
  await page.locator('#save-world').click();
  await expect(page.locator('#world-status')).toContainText('보관했습니다');
  await page.reload();
  await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
  await openDialog(page, 'library-dialog');
  await page.locator('#library-year').selectOption('2024');
  await page
    .locator('#library-list')
    .getByRole('button', { name: '세계 열기', exact: true })
    .click();
  await expect(page.locator('#world-period')).toContainText('2024-01-01 — 2024-01-03');
  await expect(page.locator('#world-lighting')).toHaveValue('sunset');
  await expect(page.locator('#world-weather')).toHaveValue('rain');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('failed imports preserve the world and public visits return to the home view', async ({
  page,
}) => {
  await page.route('https://friend.github.io/world.json', (route) =>
    route.fulfill({ json: annualSnapshot(2024, [2, 4], 'friend') }),
  );
  await page.route('https://friend.github.io/missing.json', (route) =>
    route.fulfill({ status: 404, body: 'Not found' }),
  );
  await boot(page);
  await upload(page, tiny);
  await expect(page.locator('#world-source')).toContainText('@world-fixture');
  await page.locator('#world-date').fill('2024-02-28');
  await page.locator('#world-date').dispatchEvent('change');
  await upload(page, '{invalid');
  await expect(page.locator('#world-status')).toHaveAttribute('data-error', 'true');
  await expect(page.locator('#world-date')).toHaveValue('2024-02-28');
  await openDialog(page, 'visits-dialog');
  await page.locator('#visit-url').fill('https://friend.github.io/world.json');
  await page.locator('#visit-form').getByRole('button', { name: '세계 방문하기' }).click();
  await expect(page.locator('#visit-banner')).toBeVisible();
  await expect(page.locator('#world-source')).toContainText('@friend');
  await openDialog(page, 'visits-dialog');
  await page.locator('#bookmark-visit').click();
  await expect(page.locator('#bookmark-list')).toContainText('friend님의');
  await page.locator('#visit-url').fill('https://friend.github.io/missing.json');
  await page.locator('#visit-form').getByRole('button', { name: '세계 방문하기' }).click();
  await expect(page.locator('#world-status')).toContainText('찾지 못했습니다');
  await expect(page.locator('#visits-dialog [role="alert"]')).toContainText('찾지 못했습니다');
  await expect(page.locator('#visits-dialog [role="alert"]')).toBeVisible();
  await expect(page.locator('#world-source')).toContainText('@friend');
  await closeDialog(page, 'visits-dialog');
  await page.locator('#return-own').click();
  await expect(page.locator('#visit-banner')).not.toBeVisible();
  await expect(page.locator('#world-source')).toContainText('@world-fixture');
  await expect(page.locator('#world-date')).toHaveValue('2024-02-28');
});

test('public repository metadata and releases become a removable real district', async ({
  page,
}) => {
  const repo = repositoryApiFixture();
  const release = releaseApiFixture();
  await page.route('https://api.github.com/**', (route) => {
    const path = new URL(route.request().url()).pathname;
    return route.fulfill({
      json: path.endsWith('/releases') ? [release] : path.startsWith('/users/') ? [repo] : repo,
    });
  });
  await boot(page);
  await upload(page, tiny);
  await expect(page.locator('#world-source')).toContainText('@world-fixture');
  await openDialog(page, 'projects-dialog');
  await page.locator('#project-query').fill('octocat');
  await page.locator('#project-form').getByRole('button', { name: '공개 저장소 찾기' }).click();
  await page.locator('#project-results').getByRole('button', { name: '내 세계에 더하기' }).click();
  await expect(page.locator('#project-selected')).toContainText(release.tag_name);
  await expect(page.locator('#project-selected a')).toHaveAttribute('href', release.html_url);
  await page.locator('#project-selected').getByRole('button', { name: '동네로 가기' }).click();
  await expect(page.locator('#projects-dialog')).not.toBeVisible();
  await openDialog(page, 'projects-dialog');
  await page.locator('#project-selected').getByRole('button', { name: '동네에서 빼기' }).click();
  await expect(page.locator('#project-selected')).toContainText('아직 프로젝트 동네가 없습니다');
});

test('browser Back retains its world', async ({ playwright, baseURL }, info) => {
  test.skip(info.project.name !== 'chromium-desktop', 'Chromium cache restoration');
  if (!baseURL) throw new Error('QA server URL is required');
  const proxy = await dataHttpFixture((incoming, outgoing) => {
    const upstream = request(new URL(incoming.url ?? '/', baseURL), (response) => {
      outgoing.writeHead(response.statusCode ?? 502, {
        ...response.headers,
        'cache-control': 'public, max-age=60',
      });
      response.pipe(outgoing);
    });
    upstream.on('error', (error) => outgoing.writeHead(502).end(error.message));
    upstream.end();
  });
  let browser: Browser | undefined;
  try {
    browser = await playwright.chromium.launch({
      channel: 'chromium',
      args: ['--disable-gpu'],
      ignoreDefaultArgs: ['--disable-back-forward-cache'],
    });
    const page = await browser.newPage({ reducedMotion: 'reduce' });
    await page.addInitScript(() =>
      window.addEventListener('pageshow', (event) => {
        document.documentElement.dataset.fromCache = String(event.persisted);
      }),
    );
    await page.goto(`${proxy.url}/docs/demo/world/`);
    await expect(page.locator('#world-host')).toHaveAttribute('data-ready', 'true');
    await upload(page, tiny);
    await expect(page.locator('#world-source')).toContainText('@world-fixture');
    const token = await page.evaluate(
      () => (document.documentElement.dataset.cacheToken = crypto.randomUUID()),
    );
    for (const [date, count] of [
      ['2024-02-28', 5],
      ['2024-02-29', 0],
    ] as const) {
      await page.locator('a.brand').click();
      await page.waitForURL((url) => url.origin === proxy.url && url.pathname === '/docs/demo/');
      await page.goBack({ waitUntil: 'commit' });
      await expect(page.locator('html')).toHaveAttribute('data-from-cache', 'true');
      await expect(page.locator('html')).toHaveAttribute('data-cache-token', token);
      await expect(page.locator('#world-host svg')).toHaveCount(1);
      await page.locator('#world-date').fill(date);
      await page.locator('#world-date').dispatchEvent('change');
      await expect(page.locator('#day-details')).toContainText(`${count}번의 기여`);
    }
    await info.attach('restored-world', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  } finally {
    await browser?.close();
    await proxy.close();
  }
});

test('keyboard dialogs, reduced motion, WebGL fallback and portable postcards work at every viewport', async ({
  page,
}, info) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value: function (this: HTMLCanvasElement, kind: string, options?: unknown) {
        return kind.includes('webgl') ? null : original.call(this, kind, options);
      },
    });
  });
  await boot(page);
  await upload(page, tiny);
  await expect(page.locator('#world-source')).toContainText('@world-fixture');
  await page.locator('.skip-link').focus();
  await page.keyboard.press('Enter');
  await openDialog(page, 'atmosphere-dialog');
  if (await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
    await expect(page.locator('#world-motion')).toHaveValue('off');
  await page.keyboard.press('Escape');
  await expect(page.locator('#atmosphere-dialog')).not.toBeVisible();
  await expect(page.locator('[data-dialog="atmosphere-dialog"]')).toBeFocused();
  await page.locator('#mode-three').click();
  await expect(page.locator('#world-fallback')).toBeVisible();
  await expect(page.locator('#mode-map')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#world-host svg')).toBeVisible();
  await openDialog(page, 'photo-dialog');
  const downloaded = page.waitForEvent('download');
  await page.locator('#export-svg').click();
  const download = await downloaded;
  const path = await download.path();
  if (!path) throw new Error('SVG download did not produce a file');
  expect(await readFile(path, 'utf8')).toContain('2024년 2월 29일');
  expect(download.suggestedFilename()).toMatch(/\.svg$/);
  await closeDialog(page, 'photo-dialog');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.evaluate(() => window.scrollTo(0, 0));
  await info.attach('world-explorer', {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
});
