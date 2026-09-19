import { describe, expect, it } from 'vitest';
import {
  buildWorld,
  defaultWorldView,
  frameWorld,
  parseWorldScene,
  seasonForMonth,
  weatherForMonth,
} from '../../../src/world/model/index.js';
import type { PublicRepoRecord } from '../../../src/world/model/types.js';
import { circleInput } from './circular-fixture.js';
import { inputFor, sequence } from './helpers.js';

const repositories: readonly PublicRepoRecord[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index),
  fullName: `village/project-${index}`,
  url: `https://github.com/village/project-${index}`,
  description: null,
  createdAt: '2024-01-01T00:00:00Z',
  retrievedAt: '2024-12-31T00:00:00Z',
  visibility: 'public',
  coverage: { complete: true },
  releases: [
    {
      id: `release-${index}`,
      tag: 'v1',
      url: `https://github.com/village/project-${index}/releases/tag/v1`,
      publishedAt: '2024-03-15T12:00:00Z',
    },
  ],
}));

describe('circular reserved land', () => {
  it.each(['classic', 'korean'] as const)(
    'reserves future %s rewards and twelve project plots',
    (culture) => {
      // Given
      const range = { from: '2024-03-01', to: '2024-03-31' };
      const sparse = circleInput(inputFor(sequence('2024-03-01', 31, 0), 2024, range));
      const dense = circleInput(inputFor(sequence('2024-03-01', 31, 50), 2024, range));
      const settings = { ...sparse.settings, culture };
      // When
      const before = buildWorld({ ...sparse, settings, repositories });
      const after = buildWorld({ ...dense, settings, repositories });
      // Then
      const projects = after.entities.filter((entity) => entity.kind === 'repository');
      expect(projects).toHaveLength(12);
      expect(projects).toEqual(before.entities.filter((entity) => entity.kind === 'repository'));
      const woodland = after.entities.filter(
        (entity) => entity.id.startsWith('scenery:circle:') && entity.scale.x > 1,
      );
      expect(
        projects.every((project) =>
          woodland.every(
            (grove) =>
              Math.abs(project.position.x - grove.position.x) > 1 ||
              Math.abs(project.position.z - grove.position.z) > 1,
          ),
        ),
      ).toBe(true);
      const dated = new Set(
        after.terrain.tiles
          .filter((tile) => tile.date)
          .map((tile) => `${tile.position.x}:${tile.position.z}`),
      );
      const primary = after.entities.filter((entity) => !entity.parentId);
      expect(
        new Set(primary.map((entity) => `${entity.position.x}:${entity.position.z}`)).size,
      ).toBe(primary.length);
      expect(
        primary
          .filter((entity) => entity.kind !== 'asset')
          .every((entity) => !dated.has(`${entity.position.x}:${entity.position.z}`)),
      ).toBe(true);
      expect(after.entities.some((entity) => entity.kind === 'festival')).toBe(true);
      expect(after.entities.filter((entity) => entity.kind === 'wonder')).toHaveLength(3);
      expect(after.entities.find((entity) => entity.id.endsWith(':home'))?.modelKey).toMatch(
        culture === 'korean' ? /^hanok:/ : /^house:/,
      );
      expect(parseWorldScene(after)).toEqual(after);
      const view = defaultWorldView(after);
      expect(
        frameWorld(after, { ...view, cursorDate: '2024-03-14' }).entities.some(
          (entity) => entity.kind === 'release',
        ),
      ).toBe(false);
      expect(
        frameWorld(after, { ...view, cursorDate: '2024-03-15' }).entities.filter(
          (entity) => entity.kind === 'release',
        ),
      ).toHaveLength(12);
      expect(frameWorld(after, view).stats.totalContributions).toBe(1550);
    },
  );

  it.each(['north', 'south'] as const)(
    'keeps all %s filler palettes seasonal while overrides stay presentational',
    (hemisphere) => {
      // Given
      const input = circleInput(
        inputFor([['2024-04-12', 5]], 2024, { from: '2024-04-01', to: '2024-04-30' }),
      );
      const scene = buildWorld({ ...input, settings: { ...input.settings, hemisphere } });
      const view = defaultWorldView(scene);
      const filler = scene.regions.filter((region) => region.id.includes(':scaffold:'));
      // When
      const seasons = filler.map((region) => seasonForMonth(scene, view, region.monthKey));
      // Then
      expect(seasons).toEqual(['spring', 'summer', 'autumn', 'winter']);
      expect(filler.map((region) => weatherForMonth(scene, view, region.monthKey))).toEqual([
        'clear',
        'rain',
        'clear',
        'snow',
      ]);
      const override = { ...view, seasonOverride: 'winter' as const };
      expect(
        filler.every((region) => seasonForMonth(scene, override, region.monthKey) === 'winter'),
      ).toBe(true);
      expect(frameWorld(scene, override).terrain).toEqual(frameWorld(scene, view).terrain);
    },
  );

  it('retains date cells and shared routes across seeds without leaking future actors', () => {
    // Given
    const input = circleInput(
      inputFor(sequence('2024-03-01', 31, 50), 2024, { from: '2024-03-01', to: '2024-03-31' }),
    );
    const initial = buildWorld(input);
    // When
    const reseeded = buildWorld({
      ...input,
      settings: { ...input.settings, layoutSeed: 'another-world' },
    });
    // Then
    expect(
      reseeded.terrain.tiles.map((tile) => [tile.id, tile.position.x, tile.position.z]),
    ).toEqual(initial.terrain.tiles.map((tile) => [tile.id, tile.position.x, tile.position.z]));
    expect(reseeded.routes).toEqual(initial.routes);
    expect(reseeded.entities).not.toEqual(initial.entities);
    const early = frameWorld(initial, { ...defaultWorldView(initial), cursorDate: '2024-03-01' });
    expect(
      early.actors.filter((actor) => actor.kind === 'train' || actor.kind === 'ferry'),
    ).toHaveLength(0);
    expect(early.actors.every((actor) => actor.visibleFrom <= '2024-03-01')).toBe(true);
    expect(early.events).toHaveLength(0);
  });
});
