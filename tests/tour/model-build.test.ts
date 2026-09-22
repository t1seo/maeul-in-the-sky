import { describe, expect, it } from 'vitest';
import type { TerrainScene } from '../../src/core/scene-types.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { buildTourModel } from '../../src/tour/model/build.js';
import {
  liquidSurfaceCells,
  waterfallOutlets,
} from '../../src/themes/terrain/effects/water-topology.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

describe('canonical village tour model', () => {
  it('keeps every date and placement when the Calendar scene becomes a walkable model', () => {
    // Given: a canonical sample with dated assets, rewards and seasonal metadata.
    const scene = sceneFor(sampleSnapshot());
    const before = JSON.stringify(scene);

    // When: the adapter adds three-dimensional coordinates.
    const model = buildTourModel(scene);

    // Then: it preserves every source record and does not regenerate the town.
    expect(model.scene).toBe(scene);
    expect(JSON.stringify(scene)).toBe(before);
    expect(model.cells.map((cell) => cell.source)).toEqual(scene.cells);
    expect(model.placements.map((placement) => placement.source)).toEqual([
      ...scene.placements,
      ...scene.wonders,
    ]);
    expect(model.placements.filter((placement) => placement.kind === 'wonder')).toHaveLength(
      scene.wonders.length,
    );
    expect(model.cellSize).toBe(4);
    for (const cell of model.cells) {
      expect(cell.x).toBe(cell.source.week * 4);
      expect(cell.z).toBe(cell.source.day * 4);
      expect(cell.depth).toBe(cell.source.height / 4);
    }
    for (const placement of model.placements) {
      const { cx, cy } = placement.source;
      expect(placement.position).toEqual({
        x: (cx / 8 + cy / 3.5) * 2,
        y: 0,
        z: (cy / 3.5 - cx / 8) * 2,
      });
    }
  });

  it('retains partial edge weeks and converts decks without filling missing dates', () => {
    // Given: two observed days separated by missing records and a known deck path.
    const canonical = sceneFor(snapshotFor(['2025-12-31', '2026-01-04']));
    const scene: TerrainScene = {
      ...canonical,
      neighborhoodPaths: [
        {
          id: 'deck:dated',
          catalogId: 'neighborhood:deck',
          anchorDate: '2025-12-31',
          week: 0,
          day: 3,
          drawOrder: 3,
          footprint: { x: -24, y: 3.5, width: 32, height: 7 },
          points: [
            { x: -24, y: 10.5 },
            { x: 8, y: 3.5 },
          ],
        },
      ],
    };

    // When: the model is prepared with the original top plane.
    const model = buildTourModel(scene);

    // Then: bounds describe only observed tiles and paths use the same projection.
    expect(model.cells).toHaveLength(2);
    expect(model.bounds).toEqual({ minX: -2, maxX: 6, minZ: -2, maxZ: 14 });
    expect(model.paths).toEqual([
      {
        source: scene.neighborhoodPaths[0],
        points: [
          { x: 0, y: 0, z: 12 },
          { x: 4, y: 0, z: 0 },
        ],
      },
    ]);
  });

  it.each(['north', 'south'] as const)(
    'keeps water and winter ice consistent in the %s hemisphere',
    (hemisphere) => {
      // Given: identical natural-water intensity in January and July.
      const canonical = sceneFor(snapshotFor(['2025-01-15', '2025-07-15'], { hemisphere }));
      const scene: TerrainScene = {
        ...canonical,
        cells: canonical.cells.map((cell) => ({ ...cell, level100: 15 })),
        biomes: [],
      };

      // When: the same dated surfaces are projected into 3D.
      const model = buildTourModel(scene);

      // Then: the winter half is ice and the summer half stays liquid.
      expect(
        model.cells.map(({ source, surface, season }) => ({ date: source.date, surface, season })),
      ).toEqual([
        {
          date: '2025-01-15',
          surface: hemisphere === 'north' ? 'ice' : 'water',
          season: hemisphere === 'north' ? 'winter' : 'summer',
        },
        {
          date: '2025-07-15',
          surface: hemisphere === 'north' ? 'water' : 'ice',
          season: hemisphere === 'north' ? 'summer' : 'winter',
        },
      ]);
    },
  );

  it('uses canonical water classification and waterfall outlets for the complete sample', () => {
    // Given: the SVG water model and its deterministic river endings.
    const scene = sceneFor(sampleSnapshot());
    const palette = getTerrainPalette100('light');
    const isoCells = scene.cells.map((cell) => ({
      ...cell,
      colors: palette.getElevation(cell.level100),
    }));
    const biomes = new Map(
      scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]),
    );
    const liquid = liquidSurfaceCells(isoCells, biomes, scene.settings.hemisphere);
    const outlets = waterfallOutlets(isoCells, biomes, scene.settings.hemisphere);

    // When: the model builds its water and falling edges.
    const model = buildTourModel(scene);

    // Then: every liquid date and falling outlet matches the original scene.
    expect(
      model.cells.filter((cell) => cell.surface === 'water').map((cell) => cell.source.date),
    ).toEqual(liquid.map((cell) => cell.date));
    expect(model.falls).toEqual(
      outlets.map((outlet) => ({
        position: {
          x: (outlet.x / 8 + outlet.y / 3.5) * 2,
          y: 0,
          z: (outlet.y / 3.5 - outlet.x / 8) * 2,
        },
        edge: outlet.edge,
        date: outlet.cell.date,
        drop: outlet.drop / 4,
      })),
    );
  });

  it('provides one useful land stop for each represented season without inventing seasons', () => {
    // Given: a sparse spring and autumn scene without water.
    const canonical = sceneFor(snapshotFor(['2025-04-01', '2025-04-02', '2025-10-01']));
    const scene: TerrainScene = {
      ...canonical,
      biomes: [],
      cells: canonical.cells.map((cell) => ({ ...cell, level100: 55 })),
    };

    // When: the tour selects seasonal arrival points.
    const model = buildTourModel(scene);

    // Then: stops reference real observed land inside the village bounds.
    expect(model.stops.map((stop) => stop.id)).toEqual(['spring', 'autumn']);
    for (const stop of model.stops) {
      expect(scene.cells.some((cell) => cell.date === stop.date)).toBe(true);
      expect(stop.position.y).toBe(0);
      expect(stop.position.x).toBeGreaterThanOrEqual(model.bounds.minX);
      expect(stop.position.x).toBeLessThanOrEqual(model.bounds.maxX);
      expect(stop.position.z).toBeGreaterThanOrEqual(model.bounds.minZ);
      expect(stop.position.z).toBeLessThanOrEqual(model.bounds.maxZ);
    }
    expect(model.scene.wonders).toHaveLength(0);
    expect(model.placements.filter((placement) => placement.kind === 'wonder')).toHaveLength(0);
  });

  it('keeps an entirely water-covered season at its own dated scenic flight stop', () => {
    // Given: spring land and a winter river with no dry winter tile.
    const canonical = sceneFor(snapshotFor(['2025-04-01', '2025-12-15']));
    const scene: TerrainScene = {
      ...canonical,
      cells: canonical.cells.map((cell) => ({ ...cell, level100: 55 })),
      biomes: canonical.cells.map((cell) => ({
        week: cell.week,
        day: cell.day,
        biome: {
          isRiver: cell.date === '2025-12-15',
          isPond: false,
          nearWater: false,
          forestDensity: 0,
        },
      })),
    };

    // When: seasonal stops are selected.
    const model = buildTourModel(scene);
    const winter = model.stops.find((stop) => stop.id === 'winter');
    const water = model.cells.find((cell) => cell.source.date === '2025-12-15');

    // Then: winter remains a flight destination instead of being relocated to spring.
    expect(winter?.date).toBe('2025-12-15');
    expect(winter?.position).toEqual({ x: water?.x, y: 0, z: water?.z });
  });
});
