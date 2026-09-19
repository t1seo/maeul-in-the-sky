import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { withMotionContext } from '../../../src/core/animation.js';
import { svgTallGrass } from '../../../src/themes/terrain/assets/renderers/grassland-rabbit.js';
import { svgCattail } from '../../../src/themes/terrain/assets/renderers/shore-wetland-rock.js';
import { renderTerrainCSS } from '../../../src/themes/terrain/effects.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import { prepareTerrainScene, renderTerrainScene } from '../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

describe('plants rooted on their placed terrain', () => {
  it.each([
    { motion: 'full', reduced: false },
    { motion: 'full', reduced: true },
    { motion: 'subtle', reduced: false },
    { motion: 'off', reduced: false },
  ] as const)(
    'anchors actual placements in $motion (reduced: $reduced)',
    async ({ motion, reduced }) => {
      const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 1), sceneOptions);
      const plants = scene.placements.filter(
        (plant) => plant.animated && ['tallGrass', 'cattail'].includes(plant.catalogId),
      );
      expect(new Set(plants.map((plant) => plant.catalogId)).size).toBe(2);
      const page = await browser.newPage({ reducedMotion: reduced ? 'reduce' : 'no-preference' });
      try {
        await page.setContent(renderTerrainScene(scene, 'dark', { motion }));
        for (const time of [0, 750, 1500, 2250]) {
          const offsets = await page.evaluate(
            ({ plants, time, motion, reduced }) => {
              for (const animation of document.getAnimations()) {
                animation.pause();
                animation.currentTime = time;
              }
              const scope =
                motion === 'off'
                  ? document
                  : document.querySelector(
                      `[data-motion-branch="${reduced ? 'static' : 'active'}"]`,
                    );
              const terrain = scope?.querySelector('.terrain-fit');
              if (!(terrain instanceof SVGGraphicsElement)) throw new Error('Missing terrain');
              const ground = terrain.getScreenCTM();
              if (!ground) throw new Error('Missing ground matrix');
              return plants.map((plant) => {
                const art = scope?.querySelector(
                  `[data-asset-id="${plant.id}"]`,
                )?.firstElementChild;
                const leaves = art?.firstElementChild;
                if (!(leaves instanceof SVGGraphicsElement))
                  throw new Error('Missing plant artwork');
                const matrix = leaves.getScreenCTM();
                if (!matrix) throw new Error('Missing plant matrix');
                const actual = new DOMPoint(0, 0).matrixTransform(matrix);
                const expected = new DOMPoint(plant.cx, plant.cy).matrixTransform(ground);
                return Math.hypot(actual.x - expected.x, actual.y - expected.y);
              });
            },
            { plants, time, motion, reduced },
          );
          for (const offset of offsets) expect(offset).toBeLessThan(0.001);
        }
      } finally {
        await page.close();
      }
    },
  );

  it.each([
    { name: 'tall grass', render: svgTallGrass },
    { name: 'cattail', render: svgCattail },
  ])('keeps the $name root fixed while its leaves sway', async ({ render }) => {
    // Given: two actual plant renderers placed away from the SVG origin.
    const palette = getTerrainPalette100('dark');
    const markup = withMotionContext(
      { mode: 'full', namespace: '' },
      () =>
        `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="300">` +
        `<style>${renderTerrainCSS([])}</style><g transform="translate(40 20) scale(1.3)">` +
        [130, 260]
          .map((x) => `<g data-anchor="${x}">${render(x, 120, palette.assets, 0)}</g>`)
          .join('') +
        '</g></svg>',
    );
    const page = await browser.newPage({ reducedMotion: 'no-preference' });
    try {
      await page.setContent(markup);
      // When: the real CSS timeline crosses both extremes of the sway cycle.
      const frames = [];
      for (const time of [0, 750, 1500, 2250]) {
        frames.push(
          await page.evaluate((milliseconds) => {
            for (const animation of document.getAnimations()) {
              animation.pause();
              animation.currentTime = milliseconds;
            }
            return [...document.querySelectorAll('[data-anchor]')].map((wrapper) => {
              const moving = wrapper.querySelector('.sway-gentle');
              if (!(moving instanceof SVGGraphicsElement)) throw new Error('Missing swaying plant');
              const matrix = moving.getScreenCTM();
              if (!matrix) throw new Error('Missing plant transform');
              const root = new DOMPoint(0, 0).matrixTransform(matrix);
              return {
                x: root.x,
                y: root.y,
                expectedX: 40 + Number(wrapper.getAttribute('data-anchor')) * 1.3 + 8,
                expectedY: 20 + 120 * 1.3 + 8,
                transform: getComputedStyle(moving).transform,
              };
            });
          }, time),
        );
      }
      // Then: placement stays exact, while a rotation still changes the leaves.
      for (const frame of frames) {
        for (const plant of frame) {
          expect(plant.x).toBeCloseTo(plant.expectedX, 3);
          expect(plant.y).toBeCloseTo(plant.expectedY, 3);
        }
      }
      expect(frames[0]?.[0]?.transform).not.toBe(frames[2]?.[0]?.transform);
    } finally {
      await page.close();
    }
  });
});
