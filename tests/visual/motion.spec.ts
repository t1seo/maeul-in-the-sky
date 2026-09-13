import { expect, test } from '@playwright/test';
import { importSnapshot, openDemo } from './helpers.js';

test('advances real CSS and SMIL time, then freezes the visible reduced-motion fallback', async ({
  page,
}) => {
  await openDemo(page);
  await importSnapshot(page, 'wonders-2025');
  await page.locator('#settings-form details summary').click();
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.getByLabel('Motion', { exact: true }).selectOption('full');
  const active = page.locator('#live-terrain [data-motion-branch="active"]');
  const fallback = page.locator('#live-terrain [data-motion-branch="static"]');
  await expect(active).toBeVisible();
  await expect(fallback).not.toBeVisible();
  const times = await page.locator('#live-terrain > svg').evaluate(async (root) => {
    if (!(root instanceof SVGSVGElement)) throw new Error('Expected SVG root');
    const animations = root.getAnimations({ subtree: true });
    const animation = animations.find((item) => item.playState === 'running');
    if (!animation) throw new Error('Expected running CSS animation');
    const beforeCss = Number(animation.currentTime);
    const beforeSmil = root.getCurrentTime();
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const frame = () =>
        performance.now() - start >= 350 ? resolve() : requestAnimationFrame(frame);
      requestAnimationFrame(frame);
    });
    return {
      beforeCss,
      afterCss: Number(animation.currentTime),
      beforeSmil,
      afterSmil: root.getCurrentTime(),
      smilCount: root.querySelectorAll('animate,animateTransform,animateMotion').length,
    };
  });
  expect(times.afterCss).toBeGreaterThan(times.beforeCss);
  expect(times.smilCount).toBeGreaterThan(0);
  expect(times.afterSmil).toBeGreaterThan(times.beforeSmil);
  await page.getByLabel('Motion', { exact: true }).selectOption('subtle');
  await expect(page.locator('#live-terrain [data-motion]')).toHaveAttribute(
    'data-motion',
    'subtle',
  );
  expect(
    await active.evaluate((root) =>
      root.getAnimations({ subtree: true }).some((animation) => animation.playState === 'running'),
    ),
  ).toBe(true);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(active).not.toBeVisible();
  await expect(fallback).toBeVisible();
  expect(await fallback.locator('animate,animateTransform,animateMotion').count()).toBe(0);
  const stationary = await fallback.evaluate(async (root) => {
    const measure = () =>
      [...root.querySelectorAll('path,circle,ellipse,polygon')].slice(0, 80).map((node) => {
        const bounds = node.getBoundingClientRect();
        return [bounds.x, bounds.y, bounds.width, bounds.height, getComputedStyle(node).opacity];
      });
    const before = measure();
    const start = performance.now();
    await new Promise<void>((resolve) => {
      const frame = () =>
        performance.now() - start >= 350 ? resolve() : requestAnimationFrame(frame);
      requestAnimationFrame(frame);
    });
    return { before, after: measure(), animations: root.getAnimations({ subtree: true }).length };
  });
  expect(stationary.after).toEqual(stationary.before);
  expect(stationary.animations).toBe(0);
});

test('omits moving elements from motion-off exports in a real SVG document', async ({ page }) => {
  await openDemo(page, '?motion=off');
  expect(
    await page
      .locator('#live-terrain animate, #live-terrain animateTransform, #live-terrain animateMotion')
      .count(),
  ).toBe(0);
  expect(
    await page
      .locator('#live-terrain')
      .evaluate((root) => root.getAnimations({ subtree: true }).length),
  ).toBe(0);
});
