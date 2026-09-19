import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { prepareTerrainScene, renderTerrainScene } from '../../../../src/themes/terrain/index.js';
import { renderConsistencyEffects } from '../../../../src/themes/terrain/effects/consistency.js';
import { consistencyEffectPlacements } from '../../../../src/themes/terrain/scene/consistency.js';
import { withMotionContext } from '../../../../src/core/animation.js';
import { sceneViewport } from '../../../../src/themes/terrain/scene/bounds.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

const evidence = '.orca/nature-composition/effects';
const seasons = ['2025-04-01', '2025-07-01', '2025-10-01', '2025-01-01'] as const;
let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
  await mkdir(evidence, { recursive: true });
});
afterAll(async () => {
  await browser?.close();
});

describe('consistency effects in Chromium and static SVG renderers', () => {
  it.each([
    ['2025-01-01', 'winterFrost'],
    ['2025-04-01', 'springPetals'],
    ['2025-07-01', 'summerFireflies'],
    ['2025-10-01', 'autumnLeaves'],
  ])('shows the calendar season throughout the 28-day %s scene', async (start, kind) => {
    // Given: a complete 28-day source calendar that crosses a palette transition.
    const scene = prepareTerrainScene(calendarFixture(start, 28, 1), sceneOptions);
    const page = await browser.newPage({ viewport: { width: 840, height: 240 } });
    try {
      // When: Chromium displays the current source renderer's complete scene.
      await page.setContent(`<body style="margin:0">${renderTerrainScene(scene, 'dark')}</body>`);
      const kinds = await page
        .locator('[data-consistency-id]:visible')
        .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-consistency-kind')));
      // Then: every rendered group uses its actual calendar season, including late-month dates.
      expect(kinds).toEqual(Array(10).fill(kind));
      await page.locator('body > svg').screenshot({ path: `${evidence}/${start}-28-days.png` });
    } finally {
      await page.close();
    }
  });

  it('bounds all four seasonal glyphs at every tier in both color modes', async () => {
    // Given: each tier is earned from real supplied dates, then isolated for measurable artwork.
    const specimens = seasons.flatMap((start) =>
      [5, 12, 20].flatMap((days) => {
        const scene = prepareTerrainScene(calendarFixture(start, days, 1), sceneOptions);
        const cells = scene.cells.filter((cell) => cell.date === scene.toDate);
        const effects = consistencyEffectPlacements(cells, scene.seed.root, 'north');
        const effect = effects[0];
        expect(effect).toBeDefined();
        if (!effect) return [];
        expect(effect.particles).toHaveLength(1 + effect.tier * 2);
        return (['dark', 'light'] as const).map((mode) => {
          const footprint = effect.footprint;
          const body = withMotionContext({ mode: 'off', namespace: '' }, () =>
            renderConsistencyEffects(effects, mode),
          );
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="112" viewBox="${footprint.x - 2} ${footprint.y - 2} ${footprint.width + 4} ${footprint.height + 4}">${body}</svg>`;
          expect(body.match(/<path\b/g)).toHaveLength(effect.particles.length * 2);
          const png = new Resvg(svg, { font: { loadSystemFonts: false } }).render();
          expect(png.pixels.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
          return { effect, mode, svg };
        });
      }),
    );
    const page = await browser.newPage({ viewport: { width: 1000, height: 720 } });
    try {
      // When: Chromium renders and measures the actual SVG path geometry.
      await page.setContent(
        '<body style="margin:0;display:grid;grid-template-columns:repeat(6,160px);gap:4px;font:12px sans-serif">' +
          specimens
            .map(
              ({ effect, mode, svg }) =>
                `<div style="background:${mode === 'dark' ? '#17232c' : '#f0f5f1'};color:${mode === 'dark' ? '#eee' : '#333'}">${svg}<p>${effect.kind} · ${effect.tier} · ${mode}</p></div>`,
            )
            .join('') +
          '</body>',
      );
      const boxes = await page.locator('[data-consistency-id]').evaluateAll((elements) =>
        elements.map((element) => {
          if (!(element instanceof SVGGraphicsElement)) return null;
          const box = element.getBBox();
          return { x: box.x, y: box.y, width: box.width, height: box.height };
        }),
      );
      // Then: the geometry fits each measured footprint, including its reserved motion extent.
      expect(boxes).toHaveLength(24);
      for (const [index, box] of boxes.entries()) {
        expect(box).not.toBeNull();
        if (!box) continue;
        const { effect } = specimens[index];
        const footprint = effect.footprint;
        expect(box.x + effect.cx).toBeGreaterThanOrEqual(footprint.x);
        expect(box.y + effect.cy).toBeGreaterThanOrEqual(footprint.y);
        expect(box.x + box.width + effect.cx).toBeLessThanOrEqual(footprint.x + footprint.width);
        expect(box.y + box.height + effect.cy).toBeLessThanOrEqual(footprint.y + footprint.height);
      }
      await page.screenshot({ path: `${evidence}/season-tier-sheet.png`, fullPage: true });
    } finally {
      await page.close();
    }
  });

  it.each(['banner', 'card'] as const)(
    'fits effect extents into the real %s scene',
    async (layout) => {
      // Given: effects on a small scene can extend above its terrain blocks and ordinary assets.
      const scene = prepareTerrainScene(calendarFixture('2025-12-01', 5, 1), {
        ...sceneOptions,
        layout,
      });
      const svg = renderTerrainScene(scene, 'dark');
      const viewport = sceneViewport(layout);
      const page = await browser.newPage({ viewport: { width: 840, height: 400 } });
      try {
        // When: the public renderer scales the scene using its prepared bounds.
        await page.setContent(`<body style="margin:0">${svg}</body>`);
        const boxes = await page.locator('[data-consistency-id]').evaluateAll((nodes) =>
          nodes.map((node) => {
            const box = node.getBoundingClientRect();
            return { x: box.x, y: box.y, right: box.right, bottom: box.bottom };
          }),
        );
        // Then: real visible groups fit the reserved terrain area and their bounds participate in fit.
        expect(boxes).toHaveLength(1);
        for (const box of boxes) {
          expect(box.x).toBeGreaterThanOrEqual(viewport.x - 0.1);
          expect(box.y).toBeGreaterThanOrEqual(viewport.y - 0.1);
          expect(box.right).toBeLessThanOrEqual(viewport.x + viewport.width + 0.1);
          expect(box.bottom).toBeLessThanOrEqual(viewport.y + viewport.height + 0.1);
        }
        for (const effect of scene.consistencyEffects ?? []) {
          expect(scene.bounds.x).toBeLessThanOrEqual(effect.footprint.x);
          expect(scene.bounds.y).toBeLessThanOrEqual(effect.footprint.y);
          expect(scene.bounds.x + scene.bounds.width).toBeGreaterThanOrEqual(
            effect.footprint.x + effect.footprint.width,
          );
          expect(scene.bounds.y + scene.bounds.height).toBeGreaterThanOrEqual(
            effect.footprint.y + effect.footprint.height,
          );
        }
        await page.locator('body > svg').screenshot({ path: `${evidence}/${layout}-frost.png` });
      } finally {
        await page.close();
      }
    },
  );

  it.each(['off', 'subtle', 'full'] as const)(
    'preserves every reward shape for reduced %s',
    async (motion) => {
      // Given: the OS requests reduced motion for a real rendered calendar.
      const scene = prepareTerrainScene(calendarFixture('2025-03-10', 25, 1), sceneOptions);
      const svg = renderTerrainScene(scene, 'dark', { motion });
      const page = await browser.newPage({
        viewport: { width: 840, height: 240 },
        reducedMotion: 'reduce',
      });
      try {
        await page.setContent(`<body style="margin:0">${svg}</body>`);
        const shapes = page.locator('[data-consistency-id]:visible');
        // When: animation clocks advance on the hidden active branch.
        const first = await page.locator('body > svg').screenshot();
        await page.evaluate(() => {
          for (const animation of document.getAnimations()) {
            animation.pause();
            animation.currentTime = 6000;
          }
        });
        const second = await page
          .locator('body > svg')
          .screenshot({ path: `${evidence}/${motion}-reduced.png` });
        // Then: all ten rewards remain visible and pixels match the static base.
        expect(await shapes.count()).toBe(10);
        expect(second.equals(first)).toBe(true);
        const off = new Resvg(renderTerrainScene(scene, 'dark', { motion: 'off' }), {
          font: { loadSystemFonts: false },
        })
          .render()
          .asPng();
        const fallback = new Resvg(svg, { font: { loadSystemFonts: false } }).render().asPng();
        expect(fallback.equals(off)).toBe(true);
        await writeFile(`${evidence}/${motion}-fallback.png`, fallback);
      } finally {
        await page.close();
      }
    },
  );

  it.each(['off', 'subtle', 'full'] as const)(
    'animates at most ten groups only when %s is full',
    async (motion) => {
      // Given: the browser permits motion in a complete rendered scene.
      const scene = prepareTerrainScene(calendarFixture('2025-06-15', 25, 1), sceneOptions);
      const page = await browser.newPage({
        viewport: { width: 840, height: 240 },
        reducedMotion: 'no-preference',
      });
      try {
        // When: inspecting CSS animations attached to visible consistency groups.
        await page.setContent(
          `<body style="margin:0">${renderTerrainScene(scene, 'light', { motion })}</body>`,
        );
        const shapes = page.locator('[data-consistency-id]:visible');
        const animationCounts = await shapes.evaluateAll((nodes) =>
          nodes.map((node) => node.getAnimations({ subtree: true }).length),
        );
        // Then: off/subtle retain their shapes and full moves exactly ten groups gently.
        expect(animationCounts).toEqual(Array(10).fill(motion === 'full' ? 1 : 0));
        if (motion === 'full') {
          const target = page.locator('[data-consistency-motion]').first();
          const transforms = await target.evaluate((node) => {
            const animation = node.getAnimations()[0];
            animation.pause();
            animation.currentTime = 0;
            const start = getComputedStyle(node).transform;
            animation.currentTime = 6000;
            return [start, getComputedStyle(node).transform];
          });
          expect(transforms[0]).not.toBe(transforms[1]);
        }
      } finally {
        await page.close();
      }
    },
  );
});
