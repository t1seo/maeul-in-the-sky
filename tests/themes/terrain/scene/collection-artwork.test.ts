import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import { SaxesParser } from 'saxes';
import { currentMotionContext, withMotionContext } from '../../../../src/core/animation.js';
import { EPIC_CATALOG, getEpicCatalogEntry } from '../../../../src/themes/terrain/epics/catalog.js';
import { getTerrainPalette100 } from '../../../../src/themes/terrain/palette.js';
import { prepareTerrainScene } from '../../../../src/themes/terrain/scene/prepare.js';
import { renderVillageCollection } from '../../../../src/themes/terrain/scene/collection.js';
import { renderCollectionArtwork } from '../../../../src/themes/terrain/scene/collection-icons.js';
import { renderCollectionBadge } from '../../../../src/themes/terrain/scene/collection-badges.js';
import {
  currentSurfaceContext,
  setSurfaceMotionLimits,
  withSurfaceContext,
} from '../../../../src/themes/terrain/scene/surface-context.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

const base = prepareTerrainScene(calendarFixture('2025-01-01', 365, 80), sceneOptions);
const artBox = { x: 20, y: 18, width: 24, height: 24 };

function raster(content: string, loadSystemFonts = false): Resvg {
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="360">${content}</svg>`,
    {
      font: { loadSystemFonts },
    },
  );
}

describe('static collection artwork', () => {
  it.each(['miniature', 'pixel'] as const)(
    'fits every %s catalog artwork without motion or external references',
    (artStyle) => {
      for (const mode of ['dark', 'light'] as const) {
        for (const entry of EPIC_CATALOG) {
          const icon = renderCollectionArtwork(entry, getTerrainPalette100(mode), artBox, artStyle);
          expect(icon, entry.id).not.toMatch(
            /<animate|<set\b|epic-glow-pulse|epic-portal-swirl|animation:|<image|href=|url\(/,
          );
          const bounds = raster(icon).getBBox();
          expect(bounds, entry.id).toBeDefined();
          expect(bounds?.x, entry.id).toBeGreaterThanOrEqual(artBox.x);
          expect(bounds?.y, entry.id).toBeGreaterThanOrEqual(artBox.y);
          expect((bounds?.x ?? 0) + (bounds?.width ?? 0), entry.id).toBeLessThanOrEqual(
            artBox.x + artBox.width,
          );
          expect((bounds?.y ?? 0) + (bounds?.height ?? 0), entry.id).toBeLessThanOrEqual(
            artBox.y + artBox.height,
          );
          expect(bounds?.width, entry.id).toBeGreaterThan(1);
          expect(bounds?.height, entry.id).toBeGreaterThan(1);
          if (artStyle === 'pixel') expect(icon).toContain('data-art-style="pixel"');
        }
      }
    },
  );

  it('restores its caller motion context and preserves the surface animation budget', () => {
    const motion = { mode: 'full', namespace: 'caller' } as const;
    withSurfaceContext(base.settings, () =>
      withMotionContext(motion, () => {
        setSurfaceMotionLimits(4, 2);
        const surface = currentSurfaceContext();
        const icon = renderCollectionArtwork(
          getEpicCatalogEntry('windmillGrand'),
          getTerrainPalette100('light'),
          artBox,
          'miniature',
        );
        expect(icon).not.toContain('<animate');
        expect(currentMotionContext()).toBe(motion);
        expect(currentSurfaceContext()).toBe(surface);
        return icon;
      }),
    );
  });

  it('escapes full badge names in visible labels, titles, and accessibility attributes', () => {
    const name = '<inert> & "A\'s"';
    const badge = renderCollectionBadge(
      { ...getEpicCatalogEntry('mountFuji'), displayName: name },
      0,
      'banner',
      getTerrainPalette100('light'),
      'miniature',
    );
    const parser = new SaxesParser({ xmlns: false });
    const names: string[] = [];
    const aria: string[] = [];
    parser.on('opentag', (tag) => {
      names.push(tag.name);
      if (tag.attributes['aria-label']) aria.push(tag.attributes['aria-label']);
    });
    parser.write(`<svg>${badge}</svg>`).close();
    expect(names).not.toContain('inert');
    expect(aria).toContain(`${name} (Rare), discovered in this landscape`);
    expect(badge).toContain('&lt;inert&gt;');
    expect(badge).toContain('&amp;');
    expect(badge).toContain('&quot;');
  });
});

const panelCases = (['banner', 'card'] as const).flatMap((layout) =>
  (['dark', 'light'] as const).flatMap((mode) => [
    { layout, mode, name: 'empty', ids: [] },
    { layout, mode, name: 'long names', ids: ['stBasils', 'bioluminescentPool', 'operaHouse'] },
    { layout, mode, name: 'dense', ids: EPIC_CATALOG.map((entry) => entry.id) },
  ]),
);

describe('collection reserved bounds', () => {
  it.each(panelCases)(
    'keeps $name $layout $mode panels inside the reserved footprint',
    ({ layout, mode, ids }) => {
      const example = base.wonders[0];
      expect(example).toBeDefined();
      const scene = {
        ...base,
        settings: { ...base.settings, layout },
        wonders: ids.map((catalogId) => ({ ...example, catalogId })),
      };
      const panel = renderVillageCollection(scene, getTerrainPalette100(mode));
      const rendered = raster(panel, true);
      const bounds = rendered.getBBox();
      expect(bounds).toBeDefined();
      expect(bounds?.x).toBeGreaterThanOrEqual(23.6);
      expect(bounds?.y).toBeGreaterThanOrEqual(layout === 'card' ? 317.6 : 49.6);
      expect((bounds?.x ?? 0) + (bounds?.width ?? 0)).toBeLessThanOrEqual(
        layout === 'card' ? 396.4 : 270.4,
      );
      expect((bounds?.y ?? 0) + (bounds?.height ?? 0)).toBeLessThanOrEqual(
        layout === 'card' ? 354.4 : 154.4,
      );
      expect(rendered.render().asPng().byteLength).toBeGreaterThan(500);
    },
  );
});
