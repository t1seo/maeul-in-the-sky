import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import { prepareTerrainScene, renderTerrainScene } from '../../../../src/themes/terrain/index.js';
import { calendarFixture, sceneOptions } from './fixtures.js';
import { ASSET_CATALOG } from '../../../../src/themes/terrain/assets/catalog.js';
import { renderAssetPlacements } from '../../../../src/themes/terrain/assets/rendering.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';
import { withMotionContext } from '../../../../src/core/animation.js';
import { AssetSymbols } from '../../../../src/themes/terrain/scene/asset-symbols.js';

function expandSymbols(svg: string): string {
  const definitions = new Map(
    Array.from(
      svg.matchAll(
        /<symbol id="([^"]+)" data-asset-symbol="true" overflow="visible">([\s\S]*?)<\/symbol>/g,
      ),
      ([, id, shape]) => [id, shape],
    ),
  );
  return svg.replace(
    /<use href="#([^"]+)" x="([^"]+)" y="([^"]+)"\/>/g,
    (original, id: string, x: string, y: string) => {
      const shape = definitions.get(id);
      return shape ? `<g transform="translate(${x},${y})">${shape}</g>` : original;
    },
  );
}

describe('shared static asset geometry', () => {
  it.each(['miniature', 'pixel'] as const)(
    'preserves positioned %s artwork for every catalog variant',
    (artStyle) => {
      const palette = getTerrainPalette100('light');
      const cell = {
        week: 0,
        day: 0,
        isoX: 0,
        isoY: 0,
        height: 0,
        level100: 50,
        colors: palette.getElevation(50),
      };
      const raster = (body: string) =>
        new Resvg(
          `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="-20 -30 40 40">${body}</svg>`,
          { font: { loadSystemFonts: false } },
        ).render().pixels;
      for (const entry of ASSET_CATALOG)
        for (const variant of [0, 1, 2]) {
          const placed = [
            {
              id: 'test',
              date: undefined,
              type: entry.id,
              catalogId: entry.id,
              cell,
              cx: 1.25,
              cy: -0.75,
              ox: 0,
              oy: 0,
              variant,
              animated: false,
            },
          ];
          const symbols = new AssetSymbols('parity');
          const shared = withMotionContext({ mode: 'off', namespace: '' }, () =>
            renderAssetPlacements(placed, palette, artStyle, symbols),
          );
          const inline = withMotionContext({ mode: 'off', namespace: '' }, () =>
            renderAssetPlacements(placed, palette, artStyle),
          );
          expect(
            Buffer.from(raster(symbols.definitions() + shared)).equals(Buffer.from(raster(inline))),
            `${entry.id}:${variant}`,
          ).toBe(true);
        }
    },
  );

  it('shares ordinary geometry across motion branches without losing dated placements', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-07-01', 28, 25), sceneOptions);
    const svg = renderTerrainScene(scene, 'dark', { motion: 'full' });
    expect(svg).toContain('data-asset-symbol="true"');
    const ids = Array.from(
      svg.matchAll(/<symbol id="([^"]+)" data-asset-symbol="true"/g),
      ([, id]) => id,
    );
    expect(new Set(ids).size).toBe(ids.length);
    expect(svg.match(/<use href=/g)?.length).toBeGreaterThan(ids.length);
    for (const placement of scene.placements) {
      expect(svg).toContain(`data-placement-id="${placement.id}"`);
      expect(svg).toContain(`data-anchor-date="${placement.anchorDate}"`);
    }
    expect(svg.length).toBeLessThan(expandSymbols(svg).length * 0.85);
  });

  it.each(['miniature', 'pixel'] as const)(
    'paints identical %s pixels with shared or inline geometry',
    (artStyle) => {
      const scene = prepareTerrainScene(calendarFixture('2025-04-01', 28, 25), {
        ...sceneOptions,
        artStyle,
      });
      const svg = renderTerrainScene(scene, 'light', { motion: 'full' });
      const expanded = expandSymbols(svg);
      expect(expanded).not.toBe(svg);
      const raster = (text: string) =>
        new Resvg(text, { font: { loadSystemFonts: false } }).render().pixels;
      expect(Buffer.from(raster(svg)).equals(Buffer.from(raster(expanded)))).toBe(true);
    },
  );

  it('scopes definitions to each rendered SVG and omits animation from static symbols', () => {
    const scene = prepareTerrainScene(calendarFixture('2025-07-01', 28, 25), sceneOptions);
    const first = renderTerrainScene(scene, 'dark', { namespace: 'one', motion: 'full' });
    const second = renderTerrainScene(scene, 'dark', { namespace: 'two', motion: 'full' });
    const definitions = (svg: string) =>
      Array.from(
        svg.matchAll(
          /<symbol id="([^"]+)" data-asset-symbol="true" overflow="visible">([\s\S]*?)<\/symbol>/g,
        ),
      );
    expect(definitions(first).length).toBeGreaterThan(0);
    const secondIds = new Set(definitions(second).map((match) => match[1]));
    for (const [, id, shape] of definitions(first)) {
      expect(secondIds.has(id)).toBe(false);
      expect(shape).not.toMatch(/<animate|@keyframes/);
    }
  });
});
