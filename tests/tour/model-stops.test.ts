import { describe, expect, it } from 'vitest';
import type { TerrainScene } from '../../src/core/scene-types.js';
import { buildTourModel } from '../../src/tour/model/build.js';
import { sceneFor, snapshotFor } from './model/helpers.js';

type DatedAsset = { readonly date: string; readonly catalogId: string };

function stopScene(
  assets: readonly DatedAsset[],
  extraDates: readonly string[] = [],
): TerrainScene {
  const dates = [...new Set([...assets.map((asset) => asset.date), ...extraDates])].sort();
  const canonical = sceneFor(snapshotFor(dates));
  return {
    ...canonical,
    biomes: [],
    cells: canonical.cells.map((cell) => ({ ...cell, level100: 55 })),
    wonders: [],
    placements: assets.map((asset) => {
      const cell = canonical.cells.find((entry) => entry.date === asset.date);
      if (!cell) throw new Error(`Missing fixture cell: ${asset.date}`);
      return {
        id: `fixture:${asset.catalogId}:${asset.date}`,
        catalogId: asset.catalogId,
        anchorDate: asset.date,
        week: cell.week,
        day: cell.day,
        cx: cell.isoX,
        cy: cell.isoY,
        drawOrder: cell.week * 7 + cell.day,
        footprint: { x: cell.isoX - 8, y: cell.isoY - 8, width: 16, height: 16 },
        variant: 2,
        animated: false,
      };
    }),
  };
}

describe('seasonal architecture stops', () => {
  it.each(['hanokEstate', 'hanok', 'choga', 'pavilion', 'house', 'church', 'manor'])(
    'prefers an existing %s over an earlier gate or village prop',
    (catalogId) => {
      // Given: a gate and a tent precede a substantial building in the same season.
      const scene = stopScene([
        { date: '2025-04-01', catalogId: 'hanokGate' },
        { date: '2025-04-02', catalogId: 'tent' },
        { date: '2025-04-20', catalogId },
      ]);
      const before = JSON.stringify(scene);

      // When: the tour chooses a scenic arrival point.
      const model = buildTourModel(scene);

      // Then: the real building is the focus without changing source geometry or identities.
      expect(model.stops.find((stop) => stop.id === 'spring')?.date).toBe('2025-04-20');
      expect(JSON.stringify(scene)).toBe(before);
      expect(model.placements.map((placement) => placement.source)).toEqual(scene.placements);
    },
  );

  it('uses nearby land in the same season when its best building stands on water', () => {
    // Given: a spring waterside house and a summer pavilion across the season boundary.
    const canonical = stopScene(
      [
        { date: '2025-05-25', catalogId: 'hanokGate' },
        { date: '2025-05-27', catalogId: 'hanok' },
        { date: '2025-06-01', catalogId: 'pavilion' },
      ],
      ['2025-05-26'],
    );
    const scene: TerrainScene = {
      ...canonical,
      cells: canonical.cells.map((cell) => ({
        ...cell,
        level100: cell.date === '2025-05-27' ? 15 : 55,
      })),
    };

    // When: each season selects a destination around its architecture.
    const model = buildTourModel(scene);

    // Then: spring stays on the neighboring spring land and summer retains its own pavilion.
    expect(model.stops.map((stop) => ({ season: stop.id, date: stop.date }))).toEqual([
      { season: 'spring', date: '2025-05-26' },
      { season: 'summer', date: '2025-06-01' },
    ]);
    expect(model.cells.find((cell) => cell.source.date === '2025-05-27')?.surface).toBe('water');
  });

  it('keeps a represented season when substantial buildings exist only in another season', () => {
    // Given: a spring gate and a summer house with no spring residence.
    const scene = stopScene([
      { date: '2025-04-11', catalogId: 'hanokGate' },
      { date: '2025-06-29', catalogId: 'hanokEstate' },
    ]);

    // When: the arrival points prioritize architecture.
    const model = buildTourModel(scene);

    // Then: the spring visit still focuses on an actual spring cell.
    expect(model.stops.map((stop) => ({ season: stop.id, date: stop.date }))).toEqual([
      { season: 'spring', date: '2025-04-11' },
      { season: 'summer', date: '2025-06-29' },
    ]);
  });
});
