import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';
import { renderTerrain } from '../../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

const evidence = '.orca/seasonal-fix/evidence/collection';
const cases = [
  { name: 'banner-dark', layout: 'banner', mode: 'dark', displayWidth: 840 },
  { name: 'banner-light', layout: 'banner', mode: 'light', displayWidth: 840 },
  { name: 'card-dark', layout: 'card', mode: 'dark', displayWidth: 420 },
  { name: 'card-light', layout: 'card', mode: 'light', displayWidth: 420 },
  { name: 'banner-dark-mobile', layout: 'banner', mode: 'dark', displayWidth: 390 },
  { name: 'card-light-mobile', layout: 'card', mode: 'light', displayWidth: 390 },
] as const;

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true, args: ['--disable-gpu'] });
  await mkdir(evidence, { recursive: true });
});

afterAll(async () => {
  await browser?.close();
}, 45_000);

describe('Village collection real browser and raster QA', () => {
  it.each(cases)(
    'keeps $name cues legible and separated',
    async (specimen) => {
      // Given: the public renderer produces a complete static leap-year scene.
      const pair = renderTerrain(calendarFixture('2000-01-01', 366, 80), {
        ...sceneOptions,
        layout: specimen.layout,
        width: specimen.layout === 'card' ? 420 : 840,
        height: specimen.layout === 'card' ? 360 : 240,
      });
      const svgSource = pair[specimen.mode];
      const intrinsicWidth = specimen.layout === 'card' ? 420 : 840;
      const intrinsicHeight = specimen.layout === 'card' ? 360 : 240;
      const displayHeight = Math.ceil((intrinsicHeight * specimen.displayWidth) / intrinsicWidth);
      const page = await browser.newPage({
        viewport: { width: specimen.displayWidth, height: displayHeight },
      });

      try {
        // When: Chromium lays out and screenshots the SVG at its target display width.
        await page.setContent(
          `<body style="margin:0;width:${specimen.displayWidth}px">` +
            `<div style="width:${specimen.displayWidth}px">${svgSource}</div>` +
            '<style>svg{display:block;width:100%;height:auto}</style></body>',
        );
        const svg = page.locator('body > div > svg');
        expect(await svg.isVisible()).toBe(true);
        const layout = await svg.evaluate((root) => {
          const rootBounds = root.getBoundingClientRect();
          const selectors = {
            collection: '.village-collection',
            timeline: '.calendar-timeline',
            terrain: '.terrain-fit',
            stats: '.stats-bar',
          } as const;
          const boxes = Object.fromEntries(
            Object.entries(selectors).map(([name, selector]) => {
              const node = root.querySelector(selector);
              return [name, node?.getBoundingClientRect() ?? null];
            }),
          );
          const visibleText = [...root.querySelectorAll('text')].map((node) => ({
            text: node.textContent,
            bounds: node.getBoundingClientRect(),
            fontSize: Number(node.getAttribute('font-size') ?? 0),
            stats: node.closest('.stats-bar') !== null,
          }));
          const timelineLabels = [...root.querySelectorAll('.calendar-timeline text')].map((node) =>
            node.getBoundingClientRect(),
          );
          const timelineOverlap = timelineLabels.some((left, index) =>
            timelineLabels
              .slice(index + 1)
              .some(
                (right) =>
                  left.left < right.right - 1 &&
                  left.right > right.left + 1 &&
                  left.top < right.bottom - 1 &&
                  left.bottom > right.top + 1,
              ),
          );
          return {
            root: rootBounds,
            boxes,
            visibleText,
            oldSwatches: root.querySelectorAll('.height-legend-swatch').length,
            badges: root.querySelectorAll('.collection-badge').length,
            seasons: root.querySelectorAll('.collection-season').length,
            collectionTexts: [...root.querySelectorAll('.village-collection text')].map((node) =>
              node.getBoundingClientRect(),
            ),
            cues: root.querySelectorAll('.calendar-cue').length,
            timelineOverlap,
          };
        });

        // Then: every presentation element stays in bounds and avoids reserved content.
        expect(layout.oldSwatches).toBe(0);
        expect(layout.badges).toBeGreaterThan(0);
        expect(layout.badges).toBeLessThanOrEqual(3);
        expect(layout.seasons).toBe(4);
        expect(layout.cues).toBeGreaterThanOrEqual(4);
        expect(layout.timelineOverlap).toBe(false);
        for (const box of Object.values(layout.boxes)) {
          expect(box).not.toBeNull();
          if (!box) continue;
          expect(box.left).toBeGreaterThanOrEqual(layout.root.left - 1);
          expect(box.right).toBeLessThanOrEqual(layout.root.right + 1);
          expect(box.top).toBeGreaterThanOrEqual(layout.root.top - 1);
          expect(box.bottom).toBeLessThanOrEqual(layout.root.bottom + 1);
        }
        const overlapping = await svg.evaluate((root) => {
          const box = (selector: string) => root.querySelector(selector)?.getBoundingClientRect();
          const intersects = (left?: DOMRect, right?: DOMRect) =>
            Boolean(
              left &&
              right &&
              left.left < right.right - 1 &&
              left.right > right.left + 1 &&
              left.top < right.bottom - 1 &&
              left.bottom > right.top + 1,
            );
          return [
            intersects(box('.village-collection'), box('.terrain-fit')),
            intersects(box('.village-collection'), box('.stats-bar')),
            intersects(box('.calendar-timeline'), box('.terrain-fit')),
            intersects(box('.calendar-timeline'), box('.stats-bar')),
          ];
        });
        expect(overlapping).toEqual([false, false, false, false]);
        const collectionBounds = layout.boxes.collection;
        expect(collectionBounds).not.toBeNull();
        if (collectionBounds) {
          for (const text of layout.collectionTexts) {
            expect(text.left).toBeGreaterThanOrEqual(collectionBounds.left - 1);
            expect(text.right).toBeLessThanOrEqual(collectionBounds.right + 1);
            expect(text.top).toBeGreaterThanOrEqual(collectionBounds.top - 1);
            expect(text.bottom).toBeLessThanOrEqual(collectionBounds.bottom + 1);
          }
        }
        for (const text of layout.visibleText) {
          expect(text.bounds.left).toBeGreaterThanOrEqual(layout.root.left - 1);
          expect(text.bounds.right).toBeLessThanOrEqual(layout.root.right + 1);
        }
        if (specimen.layout === 'card') {
          expect(
            layout.visibleText.filter((text) => text.stats).every((text) => text.fontSize >= 16),
          ).toBe(true);
        }
        const screenshot = await svg.screenshot({ path: `${evidence}/${specimen.name}.png` });
        expect(screenshot.byteLength).toBeGreaterThan(5_000);

        const raster = new Resvg(svgSource, { font: { loadSystemFonts: false } }).render();
        const png = raster.asPng();
        await writeFile(`${evidence}/${specimen.name}-resvg.png`, png);
        expect(raster.width).toBe(intrinsicWidth);
        expect(raster.height).toBe(intrinsicHeight);
        const colors = new Set<number>();
        const pixels = raster.pixels;
        for (let index = 0; index < pixels.length && colors.size < 64; index += 4) {
          colors.add(
            pixels[index] * 16_777_216 +
              pixels[index + 1] * 65_536 +
              pixels[index + 2] * 256 +
              pixels[index + 3],
          );
        }
        expect(colors.size).toBe(64);
      } finally {
        await page.close();
      }
    },
    45_000,
  );

  it('separates adjacent month labels that share a calendar week', async () => {
    // Given: a two-day partial Contribution Calendar crossing January into February.
    const svgSource = renderTerrain(calendarFixture('2025-01-31', 2, 1), sceneOptions).light;
    const page = await browser.newPage({ viewport: { width: 840, height: 240 } });

    try {
      // When: Chromium lays out both date-derived calendar cues.
      await page.setContent(`<body style="margin:0">${svgSource}</body>`);
      const svg = page.locator('body > svg');
      const labels = await svg
        .locator('.calendar-timeline text')
        .evaluateAll((nodes) =>
          nodes.map((node) => ({ text: node.textContent, bounds: node.getBoundingClientRect() })),
        );

      // Then: both real months remain visible at distinct non-overlapping positions.
      expect(labels.map((label) => label.text)).toEqual(['Jan · Winter', 'Feb · Winter']);
      expect(labels[0]?.bounds.right).toBeLessThan(labels[1]?.bounds.left ?? 0);
      await svg.screenshot({ path: `${evidence}/partial-same-week-light.png` });
    } finally {
      await page.close();
    }
  });
});
