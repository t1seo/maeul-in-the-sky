import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  prepareTerrainScene,
  renderTerrainScene,
  terrainTheme,
} from '../../../src/themes/terrain/index.js';
import { renderArchiveComparison } from '../../../src/archive/comparison.js';
import { createArchive } from '../../../src/core/archive/comparison.js';
import { fixtureSnapshot } from '../../../scripts/qa/fixtures.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

const evidence = '.orca/world-expansion/evidence/legacy-surfaces/browser';
const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 5), sceneOptions);
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
});

async function frame(page: Page, time: number) {
  return page.evaluate((milliseconds) => {
    for (const animation of document.getAnimations()) {
      animation.pause();
      animation.currentTime = milliseconds;
    }
    for (const element of document.querySelectorAll('svg')) {
      element.pauseAnimations();
      element.setCurrentTime(milliseconds / 1000);
    }
    const active = '[data-motion-branch="active"]';
    return {
      weather: [...document.querySelectorAll(`${active} [data-seasonal]`)].map((element) => ({
        kind: element.getAttribute('data-seasonal'),
        transform: getComputedStyle(element).transform,
      })),
      currents: [
        ...document.querySelectorAll(
          `${active} [data-water-current][class], ${active} [data-waterfall-current][class]`,
        ),
      ].map((element) => getComputedStyle(element).strokeDashoffset),
      surfaces: [...document.querySelectorAll('.water-overlays path')].map(
        (element) => getComputedStyle(element).opacity,
      ),
    };
  }, time);
}

describe('original standalone SVG seasonal and surface motion', () => {
  it.each([
    { layout: 'banner', mode: 'dark' },
    { layout: 'banner', mode: 'light' },
    { layout: 'card', mode: 'dark' },
    { layout: 'card', mode: 'light' },
  ] as const)(
    'moves small weather and current paths in $mode $layout',
    async ({ layout, mode }) => {
      // Given: a standalone full-motion SVG in an actual browser.
      const svg = renderTerrainScene(scene, mode, {
        layout,
        motion: 'full',
        namespace: 'standalone-surfaces',
      });
      const page = await browser.newPage({
        viewport: { width: layout === 'card' ? 420 : 840, height: layout === 'card' ? 360 : 240 },
        reducedMotion: 'no-preference',
      });
      try {
        await page.goto(`data:image/svg+xml,${encodeURIComponent(svg)}`);
        await page.locator('[data-motion-branch="active"]').waitFor({ state: 'visible' });
        // When: real CSS and SVG timelines advance by four seconds.
        const before = await frame(page, 2500);
        const first = await page.screenshot({ path: `${evidence}/${layout}-${mode}-2500.png` });
        const after = await frame(page, 6500);
        const second = await page.screenshot({ path: `${evidence}/${layout}-${mode}-6500.png` });
        // Then: all five seasonal kinds and bounded current lines move; broad surfaces stay still.
        expect([...new Set(before.weather.map((value) => value.kind))].sort()).toEqual([
          'butterflies',
          'leaves',
          'petals',
          'rain',
          'snow',
        ]);
        expect(before.weather.length).toBeLessThanOrEqual(10);
        for (let index = 0; index < before.weather.length; index++)
          expect(after.weather[index]?.transform).not.toBe(before.weather[index]?.transform);
        expect(before.currents.length).toBeGreaterThan(0);
        expect(before.currents.length).toBeLessThanOrEqual(15);
        expect(after.currents).not.toEqual(before.currents);
        expect(after.surfaces).toEqual(before.surfaces);
        expect(second.equals(first)).toBe(false);
        await writeFile(
          `${evidence}/${layout}-${mode}.json`,
          JSON.stringify({ before, after }, null, 2),
        );
      } finally {
        await page.close();
      }
    },
    30_000,
  );

  it.each(['full', 'subtle', 'off'] as const)(
    'keeps %s static under reduced motion',
    async (motion) => {
      // Given: reduced motion is requested before a standalone SVG loads.
      const page = await browser.newPage({
        viewport: { width: 840, height: 240 },
        reducedMotion: 'reduce',
      });
      try {
        await page.goto(
          `data:image/svg+xml,${encodeURIComponent(renderTerrainScene(scene, 'dark', { motion }))}`,
        );
        // When: both animation clocks advance.
        await frame(page, 2500);
        const first = await page.screenshot({ path: `${evidence}/${motion}-reduced-2500.png` });
        await frame(page, 6500);
        const second = await page.screenshot({ path: `${evidence}/${motion}-reduced-6500.png` });
        // Then: the complete fallback stays pixel-identical and contains no animation sources.
        expect(second.equals(first)).toBe(true);
        const staticBranch =
          motion === 'off'
            ? page.locator('svg').first()
            : page.locator('[data-motion-branch="static"]');
        expect(await staticBranch.innerHTML()).not.toMatch(/@keyframes|animation\s*:|<animate/);
        expect(await staticBranch.locator('[data-seasonal="butterflies"]').count()).toBe(2);
      } finally {
        await page.close();
      }
    },
    30_000,
  );

  it('keeps subtle weather still while moving at most four current highlights', async () => {
    // Given: subtle mode allows only the existing clouds and small water motion policy.
    const page = await browser.newPage({ reducedMotion: 'no-preference' });
    try {
      await page.goto(
        `data:image/svg+xml,${encodeURIComponent(renderTerrainScene(scene, 'light', { motion: 'subtle' }))}`,
      );
      // When: the actual browser animation clock advances.
      const before = await frame(page, 2500);
      const after = await frame(page, 6500);
      // Then: seasonal geometry is fixed and just four water paths flow.
      expect(after.weather).toEqual(before.weather);
      expect(before.currents).toHaveLength(4);
      expect(after.currents).not.toEqual(before.currents);
    } finally {
      await page.close();
    }
  });

  it('isolates repeated inline instances with explicit namespaces', async () => {
    // Given: two live instances share one document and differ only by namespace.
    const page = await browser.newPage({ reducedMotion: 'no-preference' });
    try {
      await page.setContent(
        ['profile-a', 'profile-b']
          .map((namespace) => renderTerrainScene(scene, 'dark', { motion: 'full', namespace }))
          .join(''),
      );
      // When: each weather target resolves its real computed keyframe name.
      const names = await page
        .locator('svg[data-layout]')
        .evaluateAll((roots) =>
          roots.map((root) =>
            [...root.querySelectorAll('[data-motion-branch="active"] [data-seasonal]')].map(
              (element) => getComputedStyle(element).animationName,
            ),
          ),
        );
      // Then: no definition or animation leaks between the instances.
      expect(names[0]?.every((name) => name.includes('profile-a'))).toBe(true);
      expect(names[1]?.every((name) => name.includes('profile-b'))).toBe(true);
      const ids = await page
        .locator('[id]')
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(new Set(ids).size).toBe(ids.length);
    } finally {
      await page.close();
    }
  }, 30_000);

  it('keeps seasonal motion attached after real archive namespacing', async () => {
    // Given: two real annual snapshots pass through the production archive compositor.
    const snapshots = [2024, 2025].map((year) =>
      fixtureSnapshot({ ...calendarFixture(`${year}-01-01`, 365, 5), year }),
    );
    const svg = renderArchiveComparison(createArchive(snapshots), terrainTheme, 'shared-p90').dark;
    const archivePath = resolve(evidence, 'archive-dark.svg');
    await writeFile(archivePath, svg);
    const page = await browser.newPage({
      viewport: { width: 420, height: 844 },
      reducedMotion: 'no-preference',
    });
    try {
      await page.route('http://legacy-surfaces.test/archive.svg', (route) =>
        route.fulfill({ contentType: 'image/svg+xml', body: svg }),
      );
      await page.goto('http://legacy-surfaces.test/archive.svg');
      // When: the archive advances both its dated seasonal layers.
      const before = await frame(page, 2500);
      const after = await frame(page, 6500);
      // Then: both rows remain animated and all local references have unique owners.
      expect(before.weather).toHaveLength(20);
      for (let index = 0; index < before.weather.length; index++)
        expect(after.weather[index]?.transform).not.toBe(before.weather[index]?.transform);
      const rows = await page
        .locator('svg[data-layout="card"]')
        .evaluateAll((roots) =>
          roots.map((root) =>
            [...root.querySelectorAll('[data-motion-branch="active"] [data-seasonal]')].map(
              (element) => getComputedStyle(element).animationName,
            ),
          ),
        );
      expect(rows).toHaveLength(2);
      for (const names of rows) {
        expect(names).toHaveLength(10);
        expect(new Set(names).size).toBe(5);
        expect(names).not.toContain('none');
      }
      const secondNames = new Set(rows[1]);
      expect(rows[0]?.some((name) => secondNames.has(name))).toBe(false);
      const ids = await page
        .locator('[id]')
        .evaluateAll((elements) => elements.map((element) => element.id));
      expect(new Set(ids).size).toBe(ids.length);
      await writeFile(
        `${evidence}/archive-motion.json`,
        JSON.stringify({ before, after, rows }, null, 2),
      );
      await page.screenshot({ path: `${evidence}/archive-dark-6500.png` });
    } finally {
      await page.close();
    }
  }, 30_000);
});
