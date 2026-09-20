import { describe, expect, it } from 'vitest';
import { Resvg } from '@resvg/resvg-js';
import { SaxesParser } from 'saxes';
import { renderLandscapeScene } from '../../src/themes/terrain/landscape/render.js';
import { createLandscapeProjection } from '../../src/themes/terrain/landscape/projection.js';
import { renderFixture } from './render-fixture.js';
import { surfaceItems } from '../../src/themes/terrain/landscape/surface.js';
import { waterItems } from '../../src/themes/terrain/landscape/water.js';
import { landscapePalette } from '../../src/themes/terrain/landscape/palette.js';
import { groundItems } from '../../src/themes/terrain/landscape/ground.js';

describe('standalone geographic terrain rendering', () => {
  it('keeps roads continuous through mesh joints instead of drawing a bank cap across the path', () => {
    const plan = {
      towns: [],
      fields: [],
      sprites: [],
      roads: [
        {
          id: 'lane',
          points: [
            { x: 0, z: 0, elevation: 1 },
            { x: 0.9, z: 0, elevation: 1 },
            { x: 1.8, z: 0, elevation: 1 },
          ],
          width: 0.6,
          bridges: [],
        },
      ],
    };
    const projection = {
      scale: 1,
      point: (point: { readonly x: number; readonly z: number }) => ({
        x: 20 + point.x * 20,
        y: 30 + point.z * 20,
      }),
    };
    const markup = groundItems(plan, projection, landscapePalette('light'))
      .map((item) => item.markup)
      .join('');
    const image = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60">${markup}</svg>`,
    ).render();
    expect(image.pixels[(30 * image.width + 34) * 4]).toBeGreaterThan(200);
  });
  it('keeps river water continuous at segment joins without rounded bank bands across the water', () => {
    const model = {
      ...renderFixture().geography.model,
      rivers: [
        {
          points: [
            { x: 0, z: 0, elevation: 1 },
            { x: 0.9, z: 0, elevation: 1 },
            { x: 1.8, z: 0, elevation: 1 },
          ],
          width: 0.6,
        },
      ],
    };
    const projection = {
      scale: 1,
      point: (point: { readonly x: number; readonly z: number }) => ({
        x: 20 + point.x * 20,
        y: 30 + point.z * 20,
      }),
    };
    const markup = waterItems(model, projection, landscapePalette('light'))
      .filter((item) => item.markup.includes('landscape-river'))
      .map((item) => item.markup)
      .join('');
    const image = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="60">${markup}</svg>`,
    ).render();
    const offset = (30 * image.width + 34) * 4;
    expect(image.pixels[offset + 2]).toBeGreaterThan(image.pixels[offset]);
  });
  it('keeps a river visible across the neighbouring land triangle when its stroke has width', () => {
    const a = { x: 0, z: 0, elevation: 1 },
      b = { x: 0.9, z: 0, elevation: 1 },
      c = { x: 0.9, z: 0.9, elevation: 1 };
    const model = {
      ...renderFixture().geography.model,
      triangles: [
        { points: [a, b, c] as const, biome: 'meadow' as const, moisture: 0.5, component: 0 },
      ],
      rivers: [{ points: [a, b], width: 0.6 }],
    };
    const projection = createLandscapeProjection(model),
      palette = landscapePalette('light');
    const surface = surfaceItems(model, projection, palette).find((item) => item.layer === 0);
    const river = waterItems(model, projection, palette).find((item) =>
      item.markup.includes('landscape-river'),
    );
    expect(river?.depth).toBeGreaterThan(surface?.depth ?? Infinity);
  });
  it('projects terrain height above its ground position in a finite canonical viewport', () => {
    const scene = renderFixture();
    const projection = createLandscapeProjection(scene.geography.model);
    const low = projection.point({ x: 0, z: 0, elevation: 0 });
    const high = projection.point({ x: 0, z: 0, elevation: 5 });
    expect(high.y).toBeLessThan(low.y);
    expect(high.x).toEqual(low.x);
    for (const face of scene.geography.model.triangles)
      for (const point of face.points) {
        const p = projection.point(point);
        expect(p.x).toBeGreaterThan(0);
        expect(p.x).toBeLessThan(1200);
        expect(p.y).toBeGreaterThan(100);
        expect(p.y).toBeLessThan(760);
      }
  });

  it('renders a portable complete landscape with inspectable zero dates and truthful labels', () => {
    const scene = renderFixture();
    const svg = renderLandscapeScene(scene, 'light');
    expect(svg).toContain('data-terrain-mode="landscape"');
    expect(svg).toContain('viewBox="0 0 1200 840"');
    expect(svg).toContain('class="terrain-blocks"');
    expect(svg).toContain('2025-01-05 · 0 contributions');
    expect(svg).toContain('data-catalog-id="house"');
    expect(svg).toContain('data-wonder-id="wonder-0"');
    expect(svg).toContain('data-field-id="field-0"');
    expect(svg).toContain('data-road-id="road-0"');
    expect(svg).toContain('data-bridge="true"');
    expect(svg).toContain('Height describes geography');
    expect(svg).not.toMatch(/NaN|Infinity|undefined|<script|(?:href|src)="https?:|<animate/);
  });

  it('uses distinct namespaces for two embedded copies, including referenced definitions', () => {
    const scene = renderFixture();
    const first = renderLandscapeScene(scene, 'dark', { namespace: 'first' });
    const second = renderLandscapeScene(scene, 'dark', { namespace: 'second' });
    const ids = (svg: string) => [...svg.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(ids(first).length).toBeGreaterThan(3);
    expect(new Set(ids(first)).size).toBe(ids(first).length);
    expect(ids(first).some((id) => ids(second).includes(id))).toBe(false);
    for (const match of first.matchAll(/url\(#([^)]+)\)/g)) expect(ids(first)).toContain(match[1]);
  });

  it('preserves geometry while using compiled pixel sprites and a square card presentation', () => {
    const scene = renderFixture();
    const before = JSON.stringify(scene);
    const svg = renderLandscapeScene(scene, 'light', {
      artStyle: 'pixel',
      layout: 'card',
      title: '<My town>',
    });
    expect(svg).toContain('viewBox="0 0 840 840"');
    expect(svg).toContain('data-pixel-grid=');
    expect(svg).toContain('&lt;My town&gt;');
    expect(JSON.stringify(scene)).toBe(before);
  });

  it('provides static reduced motion fallback and bounded active motion when requested', () => {
    const scene = renderFixture();
    const svg = renderLandscapeScene(scene, 'dark', { motion: 'full' });
    expect(svg).toContain('prefers-reduced-motion: no-preference');
    expect(svg).toContain('data-motion-branch="static"');
    expect(svg).toContain('data-motion-branch="active"');
    expect(svg).toContain('<animate');
    expect([...svg.matchAll(/<animate/g)].length).toBeLessThanOrEqual(50);
  });

  it('limits animated windmills to four even when a large village contains many mills', () => {
    const original = renderFixture();
    const mill = original.geography.settlement.sprites.find(
      (sprite) => sprite.catalogId === 'windmill',
    );
    if (!mill) throw new TypeError('Missing windmill fixture');
    const scene = {
      ...original,
      geography: {
        ...original.geography,
        settlement: {
          ...original.geography.settlement,
          sprites: Array.from({ length: 16 }, (_, index) => ({ ...mill, id: `mill-${index}` })),
        },
      },
    };
    const svg = renderLandscapeScene(scene, 'light', { motion: 'full' });
    expect([...svg.matchAll(/<animateTransform[^>]*type="rotate"/g)].length).toBeLessThanOrEqual(4);
  });

  it('parses as XML and rasterizes through the actual SVG renderer', () => {
    const svg = renderLandscapeScene(renderFixture(), 'light');
    const parser = new SaxesParser();
    expect(() => parser.write(svg).close()).not.toThrow();
    const png = new Resvg(svg, { fitTo: { mode: 'width', value: 600 } }).render();
    expect(png.width).toBe(600);
    expect(png.height).toBe(420);
    expect(png.asPng().length).toBeGreaterThan(2000);
  });
});
