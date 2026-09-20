import { describe, expect, it } from 'vitest';
import type { ContributionDay } from '../../src/core/types.js';
import { buildTerrainModel } from '../../src/terrain-lab/model.js';
import type { TerrainOptions, TerrainPoint } from '../../src/terrain-lab/types.js';

const days: readonly ContributionDay[] = Array.from({ length: 364 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 0, 5 + index)).toISOString().slice(0, 10),
  count: index % 11 === 0 ? 0 : (index * 7) % 42,
  level: 0,
}));
const options = { layout: 'island', seed: 4173, relief: 1, roughness: 0.6 } as const;
const layouts = ['island', 'archipelago', 'valley'] as const;
const pointKey = (point: TerrainPoint): string => `${point.x},${point.z},${point.elevation}`;

describe('natural Terrain model', () => {
  it('preserves every observed date and count including zero when the calendar becomes geography', () => {
    // Given the original contribution days, including observed zero days.
    const expected = days.map(({ date, count }) => ({ date, count }));
    // When an organic Terrain is prepared.
    const model = buildTerrainModel(days, options);
    // Then every original observation remains available exactly once.
    expect(model.plots.map(({ date, count }) => ({ date, count }))).toEqual(expected);
  });

  it('keeps geography and day anchors unchanged when contribution counts change', () => {
    // Given the same dated calendar with different activity.
    const original = buildTerrainModel(days, options);
    const updated = days.map((day) => ({ ...day, count: day.count + 100 }));
    // When the changed activity is prepared.
    const model = buildTerrainModel(updated, options);
    // Then activity changes never move the land or its date anchors.
    expect(model.triangles).toEqual(original.triangles);
    expect(model.plots.map((plot) => plot.position)).toEqual(
      original.plots.map((plot) => plot.position),
    );
  });

  it('repeats exactly when the same seed and options are used', () => {
    // Given a prepared Terrain.
    const original = buildTerrainModel(days, options);
    // When the same inputs are repeated.
    const repeated = buildTerrainModel(days, options);
    // Then all geography and placements are reproducible.
    expect(repeated).toEqual(original);
  });

  it('changes coastline when the seed changes', () => {
    // Given the coastline of one seeded Terrain.
    const original = buildTerrainModel(days, options);
    // When another seed is used.
    const changed = buildTerrainModel(days, { ...options, seed: 9781 });
    // Then the geographic outline is a different realization.
    expect(changed.coast).not.toEqual(original.coast);
  });

  it.each(layouts)('anchors every day on distinct land sites in %s layout', (layout) => {
    // Given each layout and a complete sample calendar.
    const selected: TerrainOptions = { ...options, layout };
    // When the Terrain is generated.
    const model = buildTerrainModel(days, selected);
    // Then no day is dropped, submerged, or stacked onto another day.
    expect(model.plots).toHaveLength(days.length);
    expect(new Set(model.plots.map((plot) => pointKey(plot.position))).size).toBe(days.length);
    for (const plot of model.plots) expect(plot.position.elevation).toBeGreaterThan(0.1);
    const closest = model.plots.flatMap((plot, index) =>
      model.plots
        .slice(index + 1)
        .map((other) =>
          Math.hypot(plot.position.x - other.position.x, plot.position.z - other.position.z),
        ),
    );
    expect(Math.min(...closest)).toBeGreaterThan(0.5);
  });

  it.each(layouts)(
    'builds finite, nondegenerate continuous surface with a clipped coast in %s',
    (layout) => {
      // Given one of the organic landforms.
      const selected: TerrainOptions = { ...options, layout };
      // When its shared triangle surface is prepared.
      const model = buildTerrainModel(days, selected);
      // Then geometry is renderable and the coast meets sea level exactly.
      expect(model.triangles.length).toBeGreaterThan(1500);
      expect(model.triangles.length).toBeLessThan(6500);
      expect(model.coast.length).toBeGreaterThan(50);
      for (const triangle of model.triangles) {
        const [a, b, c] = triangle.points;
        expect(Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z))).toBeGreaterThan(
          0.0000001,
        );
        for (const point of triangle.points) {
          expect([point.x, point.z, point.elevation].every(Number.isFinite)).toBe(true);
          expect(point.elevation).toBeGreaterThanOrEqual(0);
          expect(point.elevation).toBeLessThanOrEqual(12);
        }
      }
      expect(model.coast.every(({ a, b }) => a.elevation === 0 && b.elevation === 0)).toBe(true);
    },
  );

  it.each(layouts)('carries rivers down the actual surface to the sea in %s', (layout) => {
    // Given one layout with a physical heightfield.
    const selected: TerrainOptions = { ...options, layout };
    // When drainage is calculated.
    const model = buildTerrainModel(days, selected);
    const surfacePoints = new Set(
      model.triangles.flatMap((triangle) => triangle.points.map(pointKey)),
    );
    // Then every river point lies on the rendered mesh and height never increases downstream.
    expect(model.rivers.length).toBeGreaterThan(0);
    for (const river of model.rivers) {
      expect(river.points.length).toBeGreaterThan(5);
      expect(river.points.at(-1)?.elevation).toBe(0);
      for (const [index, point] of river.points.entries()) {
        expect(surfacePoints.has(pointKey(point))).toBe(true);
        const next = river.points[index + 1];
        if (next) expect(next.elevation).toBeLessThanOrEqual(point.elevation);
      }
    }
  });

  it('offers lowland settlements, forests, and separated peaks when preparing a landscape', () => {
    // Given a temperate island.
    const selected: TerrainOptions = options;
    // When geographic scenery sites are selected.
    const model = buildTerrainModel(days, selected);
    // Then the scene has distinct buildable and wild habitats.
    expect(model.settlements).toHaveLength(3);
    expect(model.settlements.every((site) => site.slope < 0.9 && site.elevation < 3)).toBe(true);
    expect(model.sites.some((site) => site.biome === 'forest')).toBe(true);
    expect(model.peaks.length).toBeGreaterThan(1);
  });

  it('keeps geography when an empty calendar is selected', () => {
    // Given an empty but valid calendar selection.
    const empty: readonly ContributionDay[] = [];
    // When only the geography is generated.
    const model = buildTerrainModel(empty, options);
    // Then no contribution observations are invented.
    expect(model.plots).toEqual([]);
    expect(model.triangles.length).toBeGreaterThan(1500);
  });

  it.each(layouts)('retains three settlements when %s is flattened to minimum relief', (layout) => {
    // Given the lowest permitted relief and roughest coastline.
    const selected: TerrainOptions = { ...options, layout, relief: 0.3, roughness: 1 };
    // When buildable sites are selected for the flattened landform.
    const model = buildTerrainModel(days, selected);
    // Then the village network and complete calendar still fit on land.
    expect(model.settlements).toHaveLength(3);
    expect(model.plots).toHaveLength(days.length);
    expect(model.plots.every((plot) => plot.position.elevation > 0.1)).toBe(true);
  });
});
