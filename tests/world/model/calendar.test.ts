import { describe, expect, it } from 'vitest';
import { buildWorld, defaultWorldView, frameWorld } from '../../../src/world/model/index.js';
import { inputFor, sequence } from './helpers.js';

describe('world dated identity', () => {
  it('keeps observed zero distinct from a missing day and scenery', () => {
    const input = inputFor([
      ['2024-02-28', 0],
      ['2024-03-01', 12],
    ]);
    const scene = buildWorld(input);
    expect(scene.days.find((day) => day.date === '2024-02-28')).toMatchObject({
      kind: 'observed',
      count: 0,
    });
    expect(scene.days.find((day) => day.date === '2024-02-29')).toMatchObject({ kind: 'missing' });
    expect(
      scene.terrain.tiles.some((tile) => tile.source === 'scenery' && tile.date === undefined),
    ).toBe(true);
    expect(
      frameWorld(scene, { ...defaultWorldView(scene), cursorDate: scene.range.to }).stats,
    ).toMatchObject({
      totalContributions: 12,
      observedDays: 2,
      activeDays: 1,
      missingDays: 364,
    });
  });

  it.each([1, 99, 2024, 9999])('preserves supported year %i without a 1900 offset', (year) => {
    const yearKey = String(year).padStart(4, '0');
    const scene = buildWorld(inputFor([[`${yearKey}-01-01`, 1]], year));
    expect(scene.days[0]?.date).toBe(`${yearKey}-01-01`);
    expect(scene.days.at(-1)?.date).toBe(`${yearKey}-12-31`);
    expect(scene.days).toHaveLength(year === 2024 ? 366 : 365);
  });

  it('keeps all thirteen rolling year-months despite the snapshot year label', () => {
    const records = sequence('2024-09-19', 366);
    const scene = buildWorld(inputFor(records, 2025));
    expect(new Set(scene.days.map((day) => day.monthKey)).size).toBe(13);
    expect(scene.days.filter((day) => day.kind === 'observed')).toHaveLength(366);
    expect(scene.days.find((day) => day.date === '2024-09-19')).toMatchObject({ count: 1 });
    expect(scene.islands.flatMap((island) => island.monthKeys)).toContain('2024-09');
  });

  it('reserves a calendar for empty input without invented observations', () => {
    const scene = buildWorld(inputFor([]));
    expect(scene.days).toHaveLength(366);
    expect(scene.days.every((day) => day.kind === 'missing')).toBe(true);
    expect(frameWorld(scene, defaultWorldView(scene)).stats.totalContributions).toBe(0);
    expect(scene.events).toEqual([]);
  });

  it('keeps a canonical result when input day order is shuffled', () => {
    const records = sequence('2024-04-01', 10, 7);
    const scene = buildWorld(inputFor(records));
    expect(scene).toEqual(buildWorld(inputFor([...records].reverse())));
  });

  it('does not move or unlock the past when future activity is appended', () => {
    const previous = inputFor(sequence('2024-06-01', 30, 3));
    const extended = inputFor([
      ...sequence('2024-06-01', 30, 3),
      ...sequence('2024-07-01', 90, 1000),
    ]);
    const first = buildWorld(previous);
    const second = buildWorld(extended);
    const view = { ...defaultWorldView(first), cursorDate: '2024-06-30' };
    expect(frameWorld(second, view)).toEqual(frameWorld(first, view));
    expect(second.sourceDigest).not.toBe(first.sourceDigest);
    expect(second.worldId).toBe(first.worldId);
  });

  it('caps the activity height with fixed scale fifty without changing counts', () => {
    const scene = buildWorld(
      inputFor([
        ['2024-01-01', 50],
        ['2024-01-02', 500],
      ]),
    );
    const tiles = scene.terrain.tiles.filter(
      (tile) => tile.date === '2024-01-01' || tile.date === '2024-01-02',
    );
    expect(tiles.map((tile) => tile.activityHeight)).toEqual([1, 1]);
    expect(frameWorld(scene, defaultWorldView(scene)).stats.totalContributions).toBe(550);
  });
});
