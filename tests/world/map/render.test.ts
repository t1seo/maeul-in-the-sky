import { describe, expect, it } from 'vitest';
import { SaxesParser } from 'saxes';
import { Resvg } from '@resvg/resvg-js';
import { renderMapFrame } from '../../../src/world/map/render.js';
import { mapFrame, mapScene, mapView } from './fixtures.js';

function elements(svg: string): readonly Record<string, string>[] {
  const tags: Record<string, string>[] = [];
  const parser = new SaxesParser();
  parser.on('opentag', (tag) => tags.push({ name: tag.name, ...tag.attributes }));
  parser.write(svg).close();
  return tags;
}

describe('SVG world map', () => {
  it('retains exact source-day identity and distinct zero-day semantics', () => {
    // Given a leap-day scene with one active and one observed zero day.
    // When the shared frame is rendered.
    const tags = elements(renderMapFrame(mapScene, mapFrame, mapView));
    // Then the selectable dates and labels retain the source records.
    expect(
      tags
        .filter((tag) => tag['data-day-id'])
        .map((tag) => [tag['data-day-id'], tag['data-date'], tag['aria-label']]),
    ).toEqual([
      ['day:2024-02-28', '2024-02-28', '2024-02-28 · 5 contributions'],
      ['day:2024-02-29', '2024-02-29', '2024-02-29 · 0 contributions'],
    ]);
  });

  it('renders only shared-frame rewards when replay hides future activity', () => {
    // Given a replay frame before any earned asset.
    const frame = { ...mapFrame, entities: [], discoveries: [], days: [] };
    // When the frozen scene is drawn at that frame.
    const tags = elements(renderMapFrame(mapScene, frame, mapView));
    // Then future entities and selectable dates never leak from the scene.
    expect(tags.filter((tag) => tag['data-entity-id'] || tag['data-day-id'])).toEqual([]);
    expect(tags.filter((tag) => tag['data-tile-id'])).toHaveLength(2);
  });

  it.each(['classic', 'korean'] as const)(
    'escapes user titles in English captions with %s architecture and produces static nonblank output',
    (culture) => {
      // Given an untrusted display name and a stopped frame.
      const scene = {
        ...mapScene,
        username: '<script>&"공중 마을',
        settings: { ...mapScene.settings, culture },
      };
      // When a postcard is rendered and parsed by an independent SVG engine.
      const svg = renderMapFrame(scene, mapFrame, mapView, { width: 640, height: 420 });
      const tags = elements(svg);
      const raster = new Resvg(svg).render();
      // Then the document is safe and contains visible painted pixels.
      expect(
        tags.some((tag) =>
          /^(script|image|foreignObject|animate|animateTransform)$/.test(tag.name),
        ),
      ).toBe(false);
      expect(svg).toContain('&lt;script&gt;&amp;&quot;공중 마을');
      expect(svg).toContain('&lt;script&gt;&amp;&quot;공중 마을&apos;s sky world</text>');
      expect([raster.width, raster.height]).toEqual([640, 420]);
      expect(new Set(raster.pixels).size).toBeGreaterThan(100);
    },
  );

  it('uses actual catalog art with self-contained namespaced references', () => {
    // Given a pine grove and an independently embedded map namespace.
    // When the map art is composed.
    const tags = elements(
      renderMapFrame(mapScene, mapFrame, mapView, { namespace: 'another-map' }),
    );
    // Then original catalog identity and valid internal gradient references survive.
    expect(tags.some((tag) => tag['data-catalog-id'] === 'pine')).toBe(true);
    const ids = new Set(tags.map((tag) => tag.id).filter(Boolean));
    for (const tag of tags) {
      for (const value of Object.values(tag)) {
        for (const reference of value.matchAll(/url\(#([^)]*)\)/g))
          expect(ids.has(reference[1])).toBe(true);
      }
    }
  });
});
