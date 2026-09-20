import { describe, expect, it } from 'vitest';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { buildTerrainModel } from '../../src/terrain-lab/model.js';
import { renderLandscape } from '../../src/terrain-lab/render.js';
import { createProjection, depth, number } from '../../src/terrain-lab/projection.js';
import { sceneryItems } from '../../src/terrain-lab/scenery.js';
import type { TerrainPoint } from '../../src/terrain-lab/types.js';

const days = sampleSnapshot().weeks.flatMap((week) => week.days);
const model = () =>
  buildTerrainModel(days, { layout: 'island', seed: 41, relief: 1, roughness: 0.65 });

describe('geographic demo rendering', () => {
  it('keeps every original day inspectable, including observed zero days', () => {
    const landscape = model();
    const rendered = renderLandscape(landscape, { lighting: 'day', density: 0.7, records: true });
    expect(
      [...rendered.svg.matchAll(/data-date="([^"]+)"/g)].map((match) => match[1]).sort(),
    ).toEqual(days.map((day) => day.date).sort());
    expect(rendered.svg).toContain('0회');
    expect(rendered.svg).not.toMatch(/NaN|Infinity|undefined/);
  });

  it('keeps dates and geography unchanged when lighting or scenery density changes', () => {
    const landscape = model();
    const before = JSON.stringify(landscape);
    const day = renderLandscape(landscape, { lighting: 'day', density: 0.2, records: true });
    const night = renderLandscape(landscape, { lighting: 'night', density: 1, records: true });
    const points = (svg: string) =>
      [...svg.matchAll(/data-date="[^"]+"[^>]*transform="[^"]+"/g)].map((match) => match[0]);
    expect(points(day.svg)).toEqual(points(night.svg));
    expect(JSON.stringify(landscape)).toBe(before);
    expect(day.svg).not.toEqual(night.svg);
  });

  it('identifies showcase Wonders separately from activity rewards', () => {
    const rendered = renderLandscape(model(), { lighting: 'day', density: 0.7, records: false });
    expect(rendered.showcaseCount).toBe(3);
    expect(rendered.svg.match(/data-showcase=/g)).toHaveLength(3);
    expect(rendered.svg).toContain('전시용 원더');
  });

  it('keeps all three showcase Wonders when the island relief is reduced to 30%', () => {
    const landscape = buildTerrainModel(days, {
      layout: 'island',
      seed: 41,
      relief: 0.3,
      roughness: 0.65,
    });
    expect(
      renderLandscape(landscape, { lighting: 'day', density: 0.7, records: false }).showcaseCount,
    ).toBe(3);
  });

  it('draws the colosseum after its supporting ground while retaining foreground terrain', () => {
    const landscape = model();
    const projection = createProjection(landscape);
    const exhibit = sceneryItems(landscape, projection, 'day', 0.7).items.find((item) =>
      item.markup.includes('data-showcase="colosseum"'),
    );
    if (!exhibit) throw new Error('Missing colosseum fixture');
    const site = landscape.sites.find((candidate) => {
      const point = projection.point(candidate);
      return exhibit.markup.includes(`translate(${number(point.x)} ${number(point.y)})`);
    });
    if (!site) throw new Error('Missing colosseum ground anchor');
    const adjacent = landscape.triangles.filter((face) =>
      face.points.some((point) => point.x === site.x && point.z === site.z),
    );
    const faceDepth = (points: readonly TerrainPoint[]) =>
      points.reduce((sum, point) => sum + depth(point), 0) / points.length;
    expect(adjacent.length).toBeGreaterThan(0);
    expect(adjacent.every((face) => faceDepth(face.points) < exhibit.depth)).toBe(true);
    expect(landscape.triangles.some((face) => faceDepth(face.points) > exhibit.depth)).toBe(true);
  });
});
