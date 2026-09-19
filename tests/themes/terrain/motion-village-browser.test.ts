import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { terrainTheme } from '../../../src/themes/terrain/index.js';
import { createMockContributionData } from '../../fixtures/contribution-data.js';

const evidence = '.orca/maeul-improvements/evidence/motion/village';
const modes = ['full', 'subtle', 'off'] as const;
const colors = ['dark', 'light'] as const;
const preferences = ['reduce', 'no-preference'] as const;
const cases = modes.flatMap((motion) =>
  colors.flatMap((color) => preferences.map((preference) => ({ motion, color, preference }))),
);
const data = createMockContributionData();
let browser: Browser;

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

describe('C08 complete village browser', () => {
  it.each(cases)(
    'renders $motion/$color/$preference correctly at zero and one second',
    async ({ motion, color, preference }) => {
      // Given: the actual public theme renderer and browser motion preference.
      const svgText = terrainTheme.render(data, {
        title: 'Motion village',
        width: 840,
        height: 240,
        motion,
      })[color];
      const page = await browser.newPage({
        viewport: { width: 840, height: 240 },
        reducedMotion: preference,
      });
      const name = `${motion}-${color}-${preference}`;
      try {
        await page.setContent(
          `<body style="margin:0;background:${color === 'dark' ? '#0d1117' : '#ffffff'}">${svgText}</body>`,
        );
        const svg = page.locator('body > svg');
        // When: both CSS and SMIL timelines advance exactly one second.
        const screenshots: Buffer[] = [];
        for (const time of [0, 1]) {
          await svg.evaluate((element, seconds) => {
            if (!(element instanceof SVGSVGElement)) throw new Error('Expected SVG root');
            element.pauseAnimations();
            element.setCurrentTime(seconds);
            for (const animation of document.getAnimations()) {
              animation.pause();
              animation.currentTime = seconds * 1000;
            }
          }, time);
          screenshots.push(
            await svg.screenshot({ path: `${evidence}/${name}-${time * 1000}.png` }),
          );
        }
        // Then: static modes are stable and complete; active modes visibly move.
        const [initial, later] = screenshots;
        expect(later.equals(initial)).toBe(motion === 'off' || preference === 'reduce');
        const blocks = svg.locator('.terrain-blocks:visible');
        expect(await blocks.count()).toBe(1);
        expect((await blocks.boundingBox())?.width).toBeGreaterThan(300);
        expect(await blocks.locator('[data-date]').count()).toBe(
          data.weeks.flatMap((week) => week.days).length,
        );
        const ids = await svg
          .locator('[id]')
          .evaluateAll((elements) => elements.map((element) => element.id));
        expect(new Set(ids).size).toBe(ids.length);
        const counts = await svg.evaluate((element) => {
          const visible = (node: Element): boolean => node.getClientRects().length > 0;
          const animated = Array.from(element.querySelectorAll('*')).filter(
            (node) => visible(node) && getComputedStyle(node).animationName !== 'none',
          );
          const smil = Array.from(
            element.querySelectorAll('animate, animateTransform, animateMotion'),
          ).filter((node) => node.parentElement && visible(node.parentElement));
          return {
            css: animated.length,
            smil: smil.length,
            names: animated.map((node) => getComputedStyle(node).animationName),
            waterOnly: animated.every((node) =>
              node.matches('path[data-water-current="true"], path[data-waterfall-current="true"]'),
            ),
          };
        });
        if (motion === 'off')
          expect(
            svgText.match(
              /<animate(?:Motion|Transform)?\b|@keyframes|animation(?:-[a-z]+)?\s*:/g,
            ) ?? [],
          ).toEqual([]);
        if (preference === 'reduce' || motion === 'off')
          expect(counts).toMatchObject({ css: 0, smil: 0 });
        if (motion === 'subtle' && preference === 'no-preference') {
          expect(counts.smil).toBeLessThanOrEqual(2);
          expect(counts.css).toBeLessThanOrEqual(4);
          expect(
            counts.names.every(
              (name) => name.endsWith('--surface-flow') || name.endsWith('--waterfall-flow'),
            ),
          ).toBe(true);
          expect(counts.waterOnly).toBe(true);
        }
        await writeFile(
          `${evidence}/${name}.json`,
          JSON.stringify(
            {
              name,
              timeline: [0, 1000],
              equal: later.equals(initial),
              ...counts,
              uniqueIds: ids.length,
            },
            null,
            2,
          ),
        );
      } finally {
        await page.close();
      }
    },
    15_000,
  );
});
