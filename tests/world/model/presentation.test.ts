import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  seasonForMonth,
} from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('world presentation and progressive richness', () => {
  it('mixes readable saplings and flowers for low activity without inventing day rewards', () => {
    const scene = buildWorld(inputFor(sequence('2024-07-01', 31, 1)));
    const families = new Set(
      scene.entities
        .filter((entity) => entity.kind === 'asset')
        .map((entity) => entity.modelKey.split(':')[0]),
    );
    expect(families.size).toBeGreaterThanOrEqual(4);
    expect(families.has('conifer')).toBe(true);
    expect(families.has('meadow')).toBe(true);
    expect(scene.entities.filter((entity) => entity.id.includes(':edge:')).length).toBeGreaterThan(
      0,
    );
    expect(
      scene.entities
        .filter((entity) => entity.id.includes(':edge:'))
        .every((entity) => entity.date === undefined),
    ).toBe(true);
  });

  it('opens at the latest observed date including zero while keeping reserved future slots', () => {
    const scene = buildWorld(
      inputFor([
        ['2024-03-01', 1],
        ['2024-03-02', 0],
      ]),
    );
    expect(defaultWorldView(scene).cursorDate).toBe('2024-03-02');
    expect(scene.range.to).toBe('2024-12-31');
  });
  it('keeps calendar month seasons simultaneous while override applies to all months', () => {
    const scene = buildWorld(inputFor([]));
    const view = defaultWorldView(scene);
    expect(
      ['2024-01', '2024-04', '2024-07', '2024-10'].map((key) => seasonForMonth(scene, view, key)),
    ).toEqual(['winter', 'spring', 'summer', 'autumn']);
    expect(seasonForMonth(scene, { ...view, seasonOverride: 'summer' }, '2024-01')).toBe('summer');
    expect(() => seasonForMonth(scene, view, '2024-13')).toThrow();
  });

  it('makes higher daily tiers larger and adds bounded contextual details without moving the day', () => {
    const scenes = [1, 5, 10, 25, 50].map((count) => buildWorld(inputFor([['2024-04-10', count]])));
    const assets = scenes.map((scene) =>
      scene.entities.find((entity) => entity.id === 'asset:2024-04-10'),
    );
    expect(assets.every(Boolean)).toBe(true);
    expect(assets.map((asset) => asset?.position.x)).toEqual(Array(5).fill(assets[0]?.position.x));
    for (let index = 1; index < assets.length; index += 1)
      expect(assets[index]?.scale.y).toBeGreaterThan(assets[index - 1]?.scale.y ?? 0);
    expect(
      scenes.map(
        (scene) => scene.entities.filter((entity) => entity.parentId === 'asset:2024-04-10').length,
      ),
    ).toEqual([0, 0, 0, 1, 2]);
  });

  it('connects a unified island with a continuous land surface', () => {
    const input = inputFor([]);
    const scene = buildWorld({ ...input, settings: { ...input.settings, layout: 'island' } });
    const land = scene.terrain.tiles.filter((tile) => tile.surface !== 'water');
    const keys = new Set(land.map((tile) => `${tile.position.x},${tile.position.z}`));
    const visited = new Set<string>();
    const queue = [land[0].position];
    for (let index = 0; index < queue.length; index += 1) {
      const point = queue[index];
      const key = `${point.x},${point.z}`;
      if (visited.has(key)) continue;
      visited.add(key);
      for (const [x, z] of [
        [point.x + 1, point.z],
        [point.x - 1, point.z],
        [point.x, point.z + 1],
        [point.x, point.z - 1],
      ])
        if (keys.has(`${x},${z}`) && !visited.has(`${x},${z}`)) queue.push({ x, y: 0, z });
    }
    expect(visited.size).toBe(land.length);
  });

  it('keeps monthly scenery silhouettes varied and all dated slots fixed for a seed', () => {
    const scene = buildWorld(inputFor(sequence('2024-01-01', 60)));
    const riverShapes = scene.terrain.waterways
      .filter((water) => water.kind === 'river')
      .map((water) =>
        water.points.map((point) => Number((point.x - water.points[0].x).toFixed(3))).join(','),
      );
    expect(new Set(riverShapes).size).toBeGreaterThan(4);
    expect(scene.terrain.tiles.filter((tile) => tile.date).map((tile) => tile.id)).toHaveLength(
      366,
    );
  });

  it('rejects invalid view dates and times and hides future data from cumulative frame stats', () => {
    const scene = buildWorld(
      inputFor([
        ['2024-03-01', 5],
        ['2024-03-02', 50],
      ]),
    );
    const view = defaultWorldView(scene);
    expect(() => frameWorld(scene, { ...view, cursorDate: '2024-02-30' })).toThrow();
    expect(() => frameWorld(scene, { ...view, elapsedSeconds: Infinity })).toThrow();
    expect(frameWorld(scene, { ...view, cursorDate: '2024-03-01' }).stats.totalContributions).toBe(
      5,
    );
    expect(frameWorld(scene, { ...view, cursorDate: '2023-12-31' }).days).toEqual([]);
  });
});
