import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { renderMotionBranches } from '../../../src/themes/terrain/motion/index.js';
import { motionId, smilAnimate, type MotionContext } from '../../../src/core/animation.js';
import { renderClouds } from '../../../src/themes/terrain/effects.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';

const evidence = '.orca/maeul-improvements/evidence/motion/browser';
const palette = getTerrainPalette100('dark');
const contexts = ['full', 'subtle', 'off'] as const;
let browser: Browser;

function specimen(mode: MotionContext['mode']): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240" viewBox="0 0 840 240">` +
    `<rect width="840" height="240" fill="#0d1117"/>` +
    renderMotionBranches(
      { mode, namespace: 'browser' },
      () =>
        `<defs><linearGradient id="${motionId('water')}"><stop stop-color="#4889b0"/></linearGradient></defs>` +
        `<path d="M220 150 L420 70 L650 150 L430 220Z" fill="url(#${motionId('water')})"/>` +
        `<circle cx="420" cy="90" r="12" fill="#ffca80" opacity="0.7">` +
        smilAnimate({
          attributeName: 'cy',
          values: ['90', '70', '90'],
          dur: '2s',
          repeatCount: 'indefinite',
        }) +
        `</circle>${renderClouds(42, palette)}`,
    ) +
    `</svg>`
  );
}

beforeAll(async () => {
  browser = await chromium.launch({
    headless: process.env['MAEUL_MOTION_HEADED'] !== '1',
    args: ['--disable-gpu'],
  });
  await mkdir(evidence, { recursive: true });
});
afterAll(async () => {
  await browser?.close();
}, 45_000);

describe('C08-static-visible real browser and rasterizer', () => {
  it.each(contexts)('keeps a complete static fallback for %s in resvg', async (mode) => {
    // Given: the same geometry is rendered with different animation policies.
    const expected = new Resvg(specimen('off'), { font: { loadSystemFonts: false } })
      .render()
      .asPng();
    // When: a renderer without motion/media support rasterizes the SVG.
    const png = new Resvg(specimen(mode), { font: { loadSystemFonts: false } }).render().asPng();
    await writeFile(`${evidence}/${mode}-resvg.png`, png);
    // Then: all geometry and base poses exactly match the explicit static scene.
    expect(png.equals(expected)).toBe(true);
  });

  it.each(contexts)('stays visible and still at 0/1 seconds for reduced %s', async (mode) => {
    // Given: the OS requests reduced motion.
    const page = await browser.newPage({
      viewport: { width: 840, height: 240 },
      reducedMotion: 'reduce',
    });
    try {
      await page.setContent(`<body style="margin:0">${specimen(mode)}</body>`);
      const svg = page.locator('svg');
      // When: the SVG timeline advances one second.
      await svg.evaluate((element) => {
        if (!(element instanceof SVGSVGElement)) throw new Error('Expected SVG root');
        element.pauseAnimations();
        element.setCurrentTime(0);
      });
      const initial = await svg.screenshot({ path: `${evidence}/${mode}-reduce-0.png` });
      await svg.evaluate((element) => {
        if (!(element instanceof SVGSVGElement)) throw new Error('Expected SVG root');
        element.setCurrentTime(1);
      });
      const later = await svg.screenshot({ path: `${evidence}/${mode}-reduce-1000.png` });
      // Then: pixels are identical while the static base has measurable area.
      expect(later.equals(initial)).toBe(true);
      const base = await svg.locator('path').first().boundingBox();
      expect(base?.width).toBeGreaterThan(300);
      const ids = await svg
        .locator('[id]')
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(new Set(ids).size).toBe(ids.length);
    } finally {
      await page.close();
    }
  });

  it.each(contexts)(
    'honors %s at 0/1 seconds without a reduced-motion preference',
    async (mode) => {
      // Given: the browser allows motion.
      const page = await browser.newPage({
        viewport: { width: 840, height: 240 },
        reducedMotion: 'no-preference',
      });
      try {
        await page.setContent(`<body style="margin:0">${specimen(mode)}</body>`);
        const svg = page.locator('svg');
        // When: the exact SMIL timeline changes from zero to one second.
        await svg.evaluate((element) => {
          if (!(element instanceof SVGSVGElement)) throw new Error('Expected SVG root');
          element.pauseAnimations();
          element.setCurrentTime(0);
        });
        const initial = await svg.screenshot({ path: `${evidence}/${mode}-normal-0.png` });
        await svg.evaluate((element) => {
          if (!(element instanceof SVGSVGElement)) throw new Error('Expected SVG root');
          element.setCurrentTime(1);
        });
        const later = await svg.screenshot({ path: `${evidence}/${mode}-normal-1000.png` });
        // Then: off is still, while both supported moving modes change pixels.
        expect(later.equals(initial)).toBe(mode === 'off');
      } finally {
        await page.close();
      }
    },
  );
});
