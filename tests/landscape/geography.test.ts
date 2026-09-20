import { describe, expect, it } from 'vitest';
import { buildLandscapeModel } from '../../src/themes/terrain/landscape/model.js';
import { sampleLandscape } from '../../src/themes/terrain/landscape/sampling.js';
import type { LandscapeModel, LandscapeOptions } from '../../src/themes/terrain/landscape/types.js';

const options = { layout: 'island', seed: 41, relief: 1, roughness: 0.65 } as const;
const layouts = ['island', 'archipelago', 'valley'] as const;
const days = Array.from({ length: 366 }, (_, index) => ({
  date: new Date(Date.UTC(2024, 0, index + 1)).toISOString().slice(0, 10),
  count: index % 9,
}));

describe('landscape geography', () => {
  it('preserves all observations including zero when dates become landscape plots', () => {
    // Given a full leap year with observed zeros.
    const expected = days;
    // When geography is prepared.
    const model = buildLandscapeModel(days, options);
    // Then the original facts survive exactly once.
    expect(model.plots.map(({ date, count }) => ({ date, count }))).toEqual(expected);
  });

  it('keeps absolute-date positions when a rolling range and counts change', () => {
    // Given a prepared year and a reordered shifted subrange.
    const original = buildLandscapeModel(days, options);
    const shifted = days
      .slice(47)
      .reverse()
      .map((day) => ({ ...day, count: day.count + 97 }));
    // When only the observed range and activity change.
    const changed = buildLandscapeModel(shifted, options);
    // Then overlapping date anchors and geography do not move.
    const anchors = new Map(original.plots.map((plot) => [plot.date, plot.position]));
    expect(changed.triangles).toEqual(original.triangles);
    for (const plot of changed.plots) expect(plot.position).toEqual(anchors.get(plot.date));
  });

  it.each(layouts)('puts every date on the final rendered surface in %s', (layout) => {
    // Given a full observed year in this landform.
    const selected: LandscapeOptions = { ...options, layout };
    // When continuous date anchors are generated.
    const model = buildLandscapeModel(days, selected);
    // Then every anchor has an actual land triangle beneath it.
    expect(model.plots).toHaveLength(days.length);
    for (const plot of model.plots) {
      const site = sampleLandscape(model, plot.position.x, plot.position.z);
      expect(site?.elevation).toBeCloseTo(plot.position.elevation, 8);
      expect(site?.component).toBe(plot.position.component);
      expect(plot.position.elevation).toBeGreaterThan(0);
    }
  });

  it('supports 20,000 unique continuous date anchors without finite slot recycling', () => {
    // Given the existing contribution-input size limit.
    const many = Array.from({ length: 20_000 }, (_, index) => ({
      date: new Date(Date.UTC(1970, 0, index + 1)).toISOString().slice(0, 10),
      count: index % 17,
    }));
    // When the entire range is projected into one landscape.
    const model = buildLandscapeModel(many, options);
    // Then all records and positions remain distinct and finite.
    expect(model.plots).toHaveLength(many.length);
    expect(new Set(model.plots.map(({ position: p }) => `${p.x},${p.z}`)).size).toBe(many.length);
    expect(
      model.plots.every(
        ({ position: p }) => [p.x, p.z, p.elevation].every(Number.isFinite) && p.elevation > 0,
      ),
    ).toBe(true);
  });

  it.each(layouts)('uses connected components and clipped continuous land in %s', (layout) => {
    // Given the requested landform.
    const selected: LandscapeOptions = { ...options, layout };
    // When the final shared mesh is constructed.
    const model = buildLandscapeModel([], selected);
    // Then faces are finite and the sea boundary is exact.
    const components = new Set(model.triangles.map((face) => face.component));
    expect(components.size).toBe(layout === 'archipelago' ? 4 : 1);
    expect(model.triangles.length).toBeGreaterThan(2000);
    for (const face of model.triangles) {
      const [a, b, c] = face.points;
      expect(Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z))).toBeGreaterThan(1e-7);
      expect(
        face.points.every(
          (point) =>
            [point.x, point.z, point.elevation].every(Number.isFinite) && point.elevation >= 0,
        ),
      ).toBe(true);
    }
    expect(model.coast.every(({ a, b }) => a.elevation === 0 && b.elevation === 0)).toBe(true);
  });

  it.each(layouts)('drains rivers downhill on the final surface to sea in %s', (layout) => {
    // Given the finalized heightfield, before any placement.
    const selected: LandscapeOptions = { ...options, layout };
    // When drainage and the render surface are derived.
    const model = buildLandscapeModel([], selected);
    // Then every river follows renderable land and terminates at sea.
    expect(model.rivers.length).toBeGreaterThanOrEqual(2);
    expect(
      model.rivers.some((river) => river.points.length > (layout === 'archipelago' ? 12 : 20)),
    ).toBe(true);
    for (const river of model.rivers) {
      expect(river.points.at(-1)?.elevation).toBe(0);
      for (const [index, point] of river.points.entries()) {
        expect(sampleLandscape(model, point.x, point.z)?.elevation).toBeCloseTo(point.elevation, 7);
        const next = river.points[index + 1];
        if (next) expect(next.elevation).toBeLessThanOrEqual(point.elevation);
      }
    }
  });

  it('offers broad buildable plains and contrasting geographic biomes', () => {
    // Given a normal-relief island.
    const selected: LandscapeOptions = options;
    // When habitable and wild sites are classified.
    const model = buildLandscapeModel([], selected);
    // Then towns and clearly distinct habitats coexist.
    expect(model.settlements).toHaveLength(3);
    expect(model.settlements.every((site) => site.slope < 0.35 && site.elevation < 2.8)).toBe(true);
    expect(new Set(model.sites.map((site) => site.biome))).toEqual(
      new Set(['sand', 'meadow', 'forest', 'rock', 'snow', 'wetland', 'dry']),
    );
    expect(model.peaks.some((peak) => peak.elevation > 7.5 && peak.x + peak.z < 0)).toBe(true);
  });

  it.each([4173, 1234567])(
    'retains three usable town sites on low-relief archipelago seed %s',
    (seed) => {
      // Given the minimum supported relief in two reproducible archipelagos.
      const selected: LandscapeOptions = { ...options, layout: 'archipelago', seed, relief: 0.3 };
      // When the final drainage and placement model is built.
      const model = buildLandscapeModel([], selected);
      // Then low relief does not eliminate a complete settlement.
      expect(model.settlements).toHaveLength(3);
    },
  );

  it('scales the complete heightfield consistently when relief changes', () => {
    const original = buildLandscapeModel([], options);
    const lower = buildLandscapeModel([], { ...options, relief: 0.3 });
    const originalSites = new Map(original.sites.map((site) => [`${site.x}:${site.z}`, site]));
    for (const site of lower.sites) {
      const previous = originalSites.get(`${site.x}:${site.z}`);
      expect(site.elevation / 0.3).toBeCloseTo(previous?.elevation ?? -1, 7);
      expect(site.slope / 0.3).toBeCloseTo(previous?.slope ?? -1, 7);
    }
  });

  it('uses a compact hamlet clearing when an archipelago has only two broad town sites', () => {
    const selected: LandscapeOptions = {
      ...options,
      layout: 'archipelago',
      seed: 535203442,
      roughness: 0.55,
    };
    const model = buildLandscapeModel([], selected);
    expect(model.settlements).toHaveLength(3);
    expect(model.settlements.every((site) => site.slope < 0.3)).toBe(true);
  });

  it('interpolates final triangles rather than regenerating an unmodified heightfield', () => {
    // Given a serialized mesh whose explicit heights describe a sloped plane.
    const model: LandscapeModel = {
      options,
      coast: [],
      rivers: [],
      plots: [],
      sites: [],
      settlements: [],
      peaks: [],
      triangles: [
        {
          points: [
            { x: 0, z: 0, elevation: 2 },
            { x: 4, z: 0, elevation: 6 },
            { x: 0, z: 4, elevation: 4 },
          ],
          biome: 'meadow',
          moisture: 0.6,
          component: 7,
        },
      ],
    };
    // When a point inside the actual plane is sampled.
    const point = sampleLandscape(model, 1, 1);
    // Then sampling follows those explicit vertices and preserves the component.
    expect(point).toMatchObject({ x: 1, z: 1, elevation: 3.5, component: 7 });
    expect(sampleLandscape(model, 5, 5)).toBeUndefined();
  });
});
