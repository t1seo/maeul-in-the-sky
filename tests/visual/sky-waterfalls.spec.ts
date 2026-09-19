import { expect, test } from '@playwright/test';
import { importSnapshot, openDemo } from './helpers.js';

test('shows flowing river and waterfall strokes, with a still reduced-motion alternative', async ({
  page,
}, testInfo) => {
  await openDemo(page);
  await importSnapshot(page, 'full-2024');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const active = page.locator('#live-terrain [data-motion-branch="active"]');
  const current = active.locator('[data-water-current][class]').first();
  const falling = active.locator('[data-waterfall-current][class]').first();
  await expect(current).toBeVisible();
  await expect(falling).toBeVisible();
  for (const line of [current, falling]) {
    const before = await line.evaluate((node) => getComputedStyle(node).strokeDashoffset);
    await expect
      .poll(() => line.evaluate((node) => getComputedStyle(node).strokeDashoffset))
      .not.toBe(before);
  }
  const fall = falling.locator('..');
  const frames: Buffer[] = [];
  for (const milliseconds of [200, 800]) {
    await falling.evaluate((node, time) => {
      for (const animation of node.getAnimations()) {
        animation.pause();
        animation.currentTime = time;
      }
    }, milliseconds);
    const frame = await fall.screenshot();
    frames.push(frame);
    await testInfo.attach(`waterfall-${milliseconds}`, { body: frame, contentType: 'image/png' });
  }
  expect(frames[0].equals(frames[1])).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const still = page.locator('#live-terrain [data-motion-branch="static"]');
  await expect(active).not.toBeVisible();
  await expect(still.locator('[data-waterfall]').first()).toBeVisible();
  expect(await still.evaluate((root) => root.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await still.locator('[data-waterfall-current][class]').count()).toBe(0);
});

test('fits the complete waterfall and mist inside day and night banners and cards', async ({
  page,
}) => {
  await openDemo(page, '?motion=off');
  await importSnapshot(page, 'full-2024');
  await page.locator('#settings-form details summary').click();
  await page.getByLabel('Motion', { exact: true }).selectOption('off');
  for (const layout of ['banner', 'card']) {
    await page.getByLabel('Layout', { exact: true }).selectOption(layout);
    for (const mode of ['dark', 'light']) {
      await page.locator(`button[data-mode="${mode}"]`).click();
      const geometry = await page.locator('#live-terrain > svg').evaluate((root) => {
        const view = root.getBoundingClientRect();
        const mist = [...root.querySelectorAll('[data-waterfall-mist]')].map((node) => {
          const bounds = node.getBoundingClientRect();
          return {
            x: bounds.x - view.x,
            right: bounds.right - view.x,
            bottom: bounds.bottom - view.y,
          };
        });
        return { width: view.width, height: view.height, mist };
      });
      expect(geometry.mist.length).toBeGreaterThan(0);
      for (const mist of geometry.mist) {
        expect(mist.x).toBeGreaterThanOrEqual(0);
        expect(mist.right).toBeLessThanOrEqual(geometry.width);
        expect(mist.bottom).toBeLessThan(geometry.height);
      }
    }
  }
});
