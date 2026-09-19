import { expect, test } from '@playwright/test';
import { expectTerrainVisible, viewportFocalPoint } from './explorer-geometry.js';
import { renderTerrain, snapshotToContributionData } from '../../src/browser.js';
import { clickDownload, importSnapshot, openDemo } from './helpers.js';

test('zooms, pans, and returns keyboard focus on Escape', async ({ page }) => {
  await openDemo(page, '?motion=off&mode=light');
  await page.getByRole('button', { name: 'Zoom village', exact: true }).click();
  const viewport = page.locator('#zoom-viewport');
  await expect(viewport).toBeFocused();
  await expect(viewport).toHaveCSS('background-color', 'rgb(245, 248, 235)');
  await expectTerrainVisible(viewport);
  const initial = await page
    .locator('#zoom-content')
    .evaluate((node) => node.getBoundingClientRect().width);
  const initialFocalPoint = await viewportFocalPoint(viewport);
  await viewport.press('+');
  await expect
    .poll(() =>
      page.locator('#zoom-content').evaluate((node) => node.getBoundingClientRect().width),
    )
    .toBeGreaterThan(initial);
  expect(await viewportFocalPoint(viewport)).toBeCloseTo(initialFocalPoint, 2);
  await viewport.press('-');
  expect(await viewportFocalPoint(viewport)).toBeCloseTo(initialFocalPoint, 2);
  await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
  expect(await viewportFocalPoint(viewport)).toBeCloseTo(initialFocalPoint, 2);
  await page.getByRole('button', { name: 'Zoom out', exact: true }).click();
  expect(await viewportFocalPoint(viewport)).toBeCloseTo(initialFocalPoint, 2);
  await page.getByRole('button', { name: 'Reset view', exact: true }).click();
  await expectTerrainVisible(viewport);
  await viewport.press('0');
  await expectTerrainVisible(viewport);
  const keyPanBefore = await viewport.evaluate((node) => node.scrollLeft);
  await viewport.press('ArrowLeft');
  expect(
    Math.abs((await viewport.evaluate((node) => node.scrollLeft)) - (keyPanBefore - 80)),
  ).toBeLessThanOrEqual(1);
  await viewport.press('ArrowRight');
  expect(
    Math.abs((await viewport.evaluate((node) => node.scrollLeft)) - keyPanBefore),
  ).toBeLessThanOrEqual(1);
  await expectTerrainVisible(viewport);
  await viewport.press('Escape');
  await expect(page.locator('#zoom-dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Zoom village', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Zoom village', exact: true }).click();
  await expectTerrainVisible(viewport);
  await viewport.press('Escape');
  await expect(page.getByRole('button', { name: 'Zoom village', exact: true })).toBeFocused();
});

test('centers empty, partial, and full Terrain variants on mobile', async ({ page }) => {
  const scenarios = [
    { fixture: 'empty-2025', layout: 'card', mode: 'dark' },
    { fixture: 'partial-2025', layout: 'banner', mode: 'light' },
    { fixture: 'full-2024', layout: 'card', mode: 'light' },
  ] as const;
  for (const scenario of scenarios) {
    await openDemo(page, '?motion=off');
    await importSnapshot(page, scenario.fixture);
    await page.locator('#settings-form details summary').click();
    await page.getByLabel('Layout', { exact: true }).selectOption(scenario.layout);
    await page
      .getByRole('button', { name: scenario.mode === 'dark' ? 'Night' : 'Day', exact: true })
      .click();
    await page.getByRole('button', { name: 'Zoom village', exact: true }).click();
    await expectTerrainVisible(page.locator('#zoom-viewport'));
    await page.evaluate(() => localStorage.clear());
  }
});

test('pinches around the gesture center and keeps one-finger touch panning', async ({
  page,
  browserName,
}) => {
  test.skip(browserName !== 'chromium', 'CDP touch injection is Chromium-specific');
  // Given: the mobile zoom dialog is open at a horizontally scrolled position.
  await openDemo(page, '?motion=off&mode=light');
  await page.getByRole('button', { name: 'Zoom village', exact: true }).click();
  const viewport = page.locator('#zoom-viewport');
  const content = page.locator('#zoom-content');
  await viewport.evaluate((node) => node.scrollTo(180, 0));
  const box = await viewport.boundingBox();
  if (!box) throw new Error('Zoom viewport has no rendered bounds');
  const center = { x: box.x + box.width / 2, y: box.y + Math.min(box.height / 2, 160) };
  const before = await viewport.evaluate((node) => {
    const contentNode = node.firstElementChild;
    if (!(contentNode instanceof HTMLElement)) throw new Error('Zoom content is missing');
    return {
      width: contentNode.getBoundingClientRect().width,
      scrollLeft: node.scrollLeft,
      localCenter: node.clientWidth / 2,
    };
  });
  const session = await page.context().newCDPSession(page);
  await session.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 2 });

  // When: two real Chromium touch contacts spread apart around a fixed center.
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { id: 1, x: center.x - 40, y: center.y },
      { id: 2, x: center.x + 40, y: center.y },
    ],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [
      { id: 1, x: center.x - 90, y: center.y },
      { id: 2, x: center.x + 90, y: center.y },
    ],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  // Then: the village grows while the content coordinate under the gesture center stays put.
  await expect
    .poll(() => content.evaluate((node) => node.getBoundingClientRect().width))
    .toBeGreaterThan(before.width);
  const after = await viewport.evaluate((node) => {
    const contentNode = node.firstElementChild;
    if (!(contentNode instanceof HTMLElement)) throw new Error('Zoom content is missing');
    return {
      width: contentNode.getBoundingClientRect().width,
      scrollLeft: node.scrollLeft,
      localCenter: node.clientWidth / 2,
    };
  });
  expect((after.scrollLeft + after.localCenter) / after.width).toBeCloseTo(
    (before.scrollLeft + before.localCenter) / before.width,
    2,
  );

  // When: one real touch contact drags left across the enlarged village.
  const panBefore = await viewport.evaluate((node) => node.scrollLeft);
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ id: 3, x: center.x + 30, y: center.y }],
  });
  await session.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ id: 3, x: center.x - 50, y: center.y }],
  });
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

  // Then: the overflow viewport follows the finger without changing keyboard focus behavior.
  await expect.poll(() => viewport.evaluate((node) => node.scrollLeft)).toBeGreaterThan(panBefore);
  await viewport.press('Escape');
  await expect(page.getByRole('button', { name: 'Zoom village', exact: true })).toBeFocused();
});

test('shows actual Wonder dates and unlock reasons in its dialog', async ({ page }) => {
  await openDemo(page);
  const snapshot = await importSnapshot(page, 'wonders-2025');
  const expected = renderTerrain(snapshotToContributionData(snapshot), {
    ...snapshot.settings,
    width: 840,
    height: 240,
  }).metadata;
  const card = page.locator('.wonder-card[data-discovered="true"]').first();
  await expect(card).toBeVisible();
  const catalogId = await card.getAttribute('data-catalog-id');
  const wonder = expected.wonders.find((item) => item.catalogId === catalogId);
  expect(wonder).toBeDefined();
  if (!wonder) throw new Error(`No metadata for discovered Wonder ${catalogId}`);
  await card.click();
  await expect(page.locator('#wonder-dialog')).toBeVisible();
  await expect(page.locator('#wonder-details')).toContainText(wonder.anchorDate);
  await expect(page.locator('#wonder-details')).toContainText(wonder.explanation);
  const labels = {
    level100: 'Contribution intensity',
    richness: 'Landscape richness',
    total: 'Total contributions',
    longestStreak: 'Longest streak',
  } as const;
  for (const threshold of wonder.thresholds) {
    await expect(page.locator('#wonder-details')).toContainText(
      `${labels[threshold.metric]}: ${threshold.current} / ${threshold.required}`,
    );
  }
  await page.keyboard.press('Escape');
  await expect(card).toBeFocused();
});

test('downloads a decodable opaque PNG matching the selected card dimensions', async ({ page }) => {
  await openDemo(page, '?motion=off&layout=card&mode=light');
  const bytes = await clickDownload(page, 'Download static PNG');
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(840);
  expect(bytes.readUInt32BE(20)).toBe(720);
  const pixel = await page.evaluate(async (data) => {
    const image = new Image();
    image.src = `data:image/png;base64,${data}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas context unavailable');
    context.drawImage(image, 0, 0);
    return [...context.getImageData(0, 0, 1, 1).data];
  }, bytes.toString('base64'));
  expect(pixel).toEqual([255, 255, 255, 255]);
});

test('keeps mobile content within the viewport with readable contrasting stats', async ({
  page,
}) => {
  await openDemo(page, '?motion=off&mode=light');
  const metrics = await page.evaluate(() => {
    const stat = document.querySelector('#stat-total');
    const panel = document.querySelector('#preview-panel');
    if (!stat || !panel) throw new Error('Missing stats panel');
    const style = getComputedStyle(stat);
    return {
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      fontSize: Number.parseFloat(style.fontSize),
      color: style.color,
      background: getComputedStyle(panel).backgroundColor,
    };
  });
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.width + 1);
  expect(metrics.fontSize).toBeGreaterThanOrEqual(16);
  const luminance = (color: string) => {
    const channels = color
      .match(/[\d.]+/g)
      ?.slice(0, 3)
      .map(Number);
    if (!channels || channels.length !== 3) throw new Error(`Unsupported color: ${color}`);
    return channels.reduce((sum, value, index) => {
      const channel = value / 255;
      return (
        sum +
        (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) *
          [0.2126, 0.7152, 0.0722][index]
      );
    }, 0);
  };
  const values = [luminance(metrics.color), luminance(metrics.background)].sort((a, b) => b - a);
  expect((values[0] + 0.05) / (values[1] + 0.05)).toBeGreaterThanOrEqual(4.5);
});
