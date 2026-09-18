import { chromium } from '@playwright/test';
import { expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { EPIC_BOUNDS } from '../../src/themes/terrain/epics/bounds.js';
import { renderAncientPortal } from '../../src/themes/terrain/epics/renderers/legendary.js';
import { renderEpicCSS } from '../../src/themes/terrain/epics/rendering.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

it.each([
  [0, 0],
  [17, -9],
] as const)('keeps the portal rotation inside its stone frame at anchor (%s,%s)', async (x, y) => {
  // Given: actual shared motion CSS, a large surrounding viewport, and a placed portal.
  const c = getTerrainPalette100('dark').assets;
  const fragment = withMotionContext({ mode: 'full', namespace: '' }, () =>
    renderAncientPortal(x, y, c),
  );
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(
      `<style>${renderEpicCSS()}</style><svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="-32 -32 64 64"><g id="portal">${fragment}</g></svg>`,
    );
    // When: the browser seeks the real CSS animation through one whole revolution.
    const frames = await page.evaluate(() =>
      [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000].map((time) => {
        for (const animation of document.getAnimations()) {
          animation.pause();
          animation.currentTime = time;
        }
        const portal = document.getElementById('portal');
        if (!(portal instanceof SVGGraphicsElement)) throw new TypeError('Portal missing');
        const box = portal.getBBox();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      }),
    );
    // Then: rotation is local to the aperture regardless of the world-space anchor.
    const bounds = EPIC_BOUNDS.ancientPortal;
    for (const frame of frames) {
      expect(frame.x).toBeGreaterThanOrEqual(x + bounds.x);
      expect(frame.y).toBeGreaterThanOrEqual(y + bounds.y);
      expect(frame.x + frame.width).toBeLessThanOrEqual(x + bounds.x + bounds.width);
      expect(frame.y + frame.height).toBeLessThanOrEqual(y + bounds.y + bounds.height);
    }
  } finally {
    await browser.close();
  }
});
