import { describe, expect, it } from 'vitest';
import { planLandscapeSettlements } from '../../src/themes/terrain/landscape/settlements.js';
import { flatModel, populatedScene } from './settlement-fixtures.js';
import { riverDistance } from '../../src/themes/terrain/landscape/settlement-geometry.js';

describe('landscape settlements', () => {
  it('moves terrestrial facts out of a river without moving the absolute date plot', () => {
    const original = populatedScene();
    const source = original.placements[0];
    const scene = {
      ...original,
      placements: [{ ...source, catalogId: 'rabbit' }],
      wonders: [],
      rewards: [],
    };
    const base = flatModel(scene);
    const model = {
      ...base,
      plots: base.plots.map((plot) =>
        plot.date === source.anchorDate
          ? { ...plot, position: { ...plot.position, x: 0, z: 0 } }
          : plot,
      ),
    };
    const before = JSON.stringify(model.plots);
    const plan = planLandscapeSettlements(model, scene);
    const placed = plan.sprites.find((sprite) => sprite.id === source.id);
    expect(placed).toBeDefined();
    if (placed) expect(riverDistance(model, placed.position)).toBeGreaterThan(0.2);
    expect(JSON.stringify(model.plots)).toBe(before);
  });

  it('preserves every genuine dated asset, Wonder, and reward when composing a town', () => {
    const scene = populatedScene();
    const plan = planLandscapeSettlements(flatModel(scene), scene);
    const expected = [
      ...scene.placements.map((item) => ({ ...item, kind: 'asset' })),
      ...scene.wonders.map((item) => ({ ...item, kind: 'wonder' })),
      ...(scene.rewards ?? []).map((item) => ({ ...item, kind: 'reward' })),
    ];
    expect(plan.sprites.filter((sprite) => sprite.kind !== 'scenery')).toHaveLength(
      expected.length,
    );
    for (const item of expected) {
      expect(plan.sprites.find((sprite) => sprite.id === item.id)).toMatchObject({
        id: item.id,
        catalogId: item.catalogId,
        kind: item.kind,
        anchorDate: item.anchorDate,
        variant: item.variant,
      });
    }
  });

  it('groups houses around plazas and builds peripheral fields without changing the drained ground', () => {
    const scene = populatedScene();
    const model = flatModel(scene);
    const baseline = JSON.stringify(model);
    const plan = planLandscapeSettlements(model, scene);
    expect(plan.towns).toHaveLength(2);
    expect(plan.towns.every((town) => town.plaza.length >= 4)).toBe(true);
    expect(plan.fields.length).toBeGreaterThanOrEqual(4);
    expect(plan.roads.length).toBeGreaterThanOrEqual(3);
    for (const sprite of plan.sprites.filter((sprite) => sprite.catalogId === 'house')) {
      expect(
        Math.min(
          ...plan.towns.map((town) =>
            Math.hypot(town.center.x - sprite.position.x, town.center.z - sprite.position.z),
          ),
        ),
      ).toBeLessThan(10);
      expect(sprite.scale * 10).toBeGreaterThanOrEqual(28);
    }
    expect(JSON.stringify(model)).toBe(baseline);
    expect(plan.fields.every((field) => field.rows.length >= 4)).toBe(true);
  });

  it('records an explicit bridge where the connecting road crosses a river', () => {
    const scene = populatedScene();
    const plan = planLandscapeSettlements(flatModel(scene), scene);
    expect(plan.roads.some((road) => road.bridges.length > 0)).toBe(true);
    for (const road of plan.roads) {
      expect(road.points.every((point) => point.elevation === 2)).toBe(true);
    }
  });

  it('retains primary positions at both decoration density endpoints', () => {
    const sparse = populatedScene(1);
    const dense = populatedScene(10);
    const model = flatModel(sparse);
    const first = planLandscapeSettlements(model, sparse);
    const second = planLandscapeSettlements(model, dense);
    expect(first.sprites.filter((sprite) => sprite.kind !== 'scenery')).toEqual(
      second.sprites.filter((sprite) => sprite.kind !== 'scenery'),
    );
    expect(second.sprites.filter((sprite) => sprite.kind === 'scenery').length).toBeGreaterThan(
      first.sprites.filter((sprite) => sprite.kind === 'scenery').length,
    );
  });

  it('creates no settlement, field, reward, or Wonder for a zero activity scene', () => {
    const source = populatedScene();
    const scene = {
      ...source,
      cells: source.cells.map((cell) => ({ ...cell, count: 0 })),
      placements: [],
      wonders: [],
      rewards: [],
    };
    const plan = planLandscapeSettlements(flatModel(scene), scene);
    expect(plan.towns).toEqual([]);
    expect(plan.fields).toEqual([]);
    expect(plan.roads).toEqual([]);
    expect(plan.sprites.every((sprite) => sprite.kind === 'scenery')).toBe(true);
  });
});
