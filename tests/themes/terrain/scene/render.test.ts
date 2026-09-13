import { describe, expect, it } from 'vitest';
import {
  prepareTerrainScene,
  renderTerrain,
  renderTerrainScene,
} from '../../../../src/themes/terrain/index.js';
import { fitScene, sceneViewport } from '../../../../src/themes/terrain/scene/bounds.js';
import { calendarFixture, sceneOptions } from './fixtures.js';

function blocks(svg: string): string[] {
  return [
    ...svg.matchAll(/<g data-date="([^"]+)" data-count="(\d+)" data-level="(\d+)">[\s\S]*?<\/g>/g),
  ].map((match) => [...match[0].matchAll(/points="([^"]+)"/g)].map((point) => point[1]).join('|'));
}

describe('scene shading and framing', () => {
  it('draws identical cell geometry and placement identities in the dark/light pair', () => {
    const pair = renderTerrain(calendarFixture(), sceneOptions);
    expect(blocks(pair.dark)).toHaveLength(120);
    expect(blocks(pair.dark)).toEqual(blocks(pair.light));
    const ids = (svg: string) =>
      [...svg.matchAll(/data-placement-id="([^"]+)"/g)].map((match) => match[1]);
    expect(ids(pair.dark)).toEqual(ids(pair.light));
    expect(ids(pair.dark).sort()).toEqual(
      [...pair.metadata.placements, ...pair.metadata.wonders, ...pair.metadata.neighborhoodPaths]
        .map((item) => item.id)
        .sort(),
    );
  });

  it('replays a serialized scene without recomputing its placements', () => {
    const scene = prepareTerrainScene(calendarFixture(), sceneOptions);
    const recovered = JSON.parse(JSON.stringify(scene));
    expect(renderTerrainScene(recovered, 'light')).toBe(renderTerrainScene(scene, 'light'));
  });

  it('fits the whole 54-week calendar in a card with readable separate statistics', () => {
    const data = calendarFixture('2000-01-01', 366, 4);
    const scene = prepareTerrainScene(data, { ...sceneOptions, layout: 'card' });
    const svg = renderTerrainScene(scene, 'light');
    const viewport = sceneViewport('card');
    const fitted = fitScene(scene.bounds, viewport);
    expect(Math.max(...scene.cells.map((cell) => cell.week))).toBe(53);
    expect(svg).toContain('viewBox="0 0 420 360"');
    expect(svg).toContain('width="420" height="360"');
    expect(blocks(svg)).toHaveLength(366);
    expect(scene.bounds.width * fitted.scale).toBeLessThanOrEqual(viewport.width);
    expect(scene.bounds.height * fitted.scale).toBeLessThanOrEqual(viewport.height);
    expect(svg).toContain('font-size="26"');
    expect(svg).toContain('font-size="16"');
    expect(svg).toContain('2000-01-01 to 2000-12-31');
  });

  it('keeps complete partial-period data in the banner viewport', () => {
    const result = renderTerrain(calendarFixture('2025-01-01', 31), sceneOptions);
    expect(result.dark).toContain('viewBox="0 0 840 240"');
    expect(blocks(result.dark)).toHaveLength(31);
    expect(result.metadata.fromDate).toBe('2025-01-01');
    expect(result.metadata.toDate).toBe('2025-01-31');
  });

  it('isolates all actual IDs when both color modes share a caller namespace', () => {
    const pair = renderTerrain(calendarFixture(), { ...sceneOptions, namespace: 'mount <one>' });
    const ids = [...(pair.dark + pair.light).matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(pair.dark).not.toContain('id="mount <one>');
  });

  it('escapes malicious titles and never creates markup from the data', () => {
    const pair = renderTerrain(calendarFixture(), {
      ...sceneOptions,
      title: '<script>alert("x")</script> & me',
    });
    expect(pair.dark).not.toContain('<script>');
    expect(pair.dark).toContain('&lt;script&gt;');
    expect(pair.metadata.cells).toHaveLength(120);
  });
});

it('bounds coordinate precision at primitive creation when elevations are fractional', () => {
  const pair = renderTerrain(calendarFixture('2025-01-01', 10, 2), {
    ...sceneOptions,
    normalization: { kind: 'fixed', maxCount: 30 },
  });
  const terrainCoordinates = blocks(pair.dark);
  expect(terrainCoordinates.some((points) => /\d+\.\d{4,}/.test(points))).toBe(false);
});

it('rejects geometry-setting overrides when shading a prepared scene', () => {
  const scene = prepareTerrainScene(calendarFixture(), sceneOptions);
  const incompatible = { width: 420, normalization: { kind: 'fixed' as const, maxCount: 1 } };
  expect(() => renderTerrainScene(scene, 'light', incompatible)).toThrow(/prepar/i);
});

it('escapes quote-bearing seeds and usernames at the SVG attribute boundary', () => {
  const data = { ...calendarFixture('2025-01-01', 2), username: 'name" onload="alert(1)' };
  const result = renderTerrain(data, {
    ...sceneOptions,
    layoutSeed: '"><script>alert(1)</script>',
  });
  expect(result.light).not.toMatch(/\sonload="|<script>/);
  expect(result.light).toContain('&quot; onload=&quot;');
  expect(result.light).toContain('&lt;script&gt;');
});
