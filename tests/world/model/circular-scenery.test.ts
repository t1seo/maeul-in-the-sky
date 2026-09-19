import { describe, expect, it } from 'vitest';
import { buildWorld, parseWorldScene } from '../../../src/world/model/index.js';
import { circleSeason } from '../../../src/world/model/circular-layout.js';
import { circleInput } from './circular-fixture.js';
import { inputFor, sequence } from './helpers.js';

describe('legible circular nature', () => {
  it.each([31, 793])('keeps larger woodland footprints clear in a %i-day scene', (count) => {
    // Given
    const input = circleInput(inputFor(sequence('2023-12-01', count, 50), 2025));
    // When
    const scene = buildWorld(input);
    // Then
    const filler = scene.entities.filter((entity) => entity.id.startsWith('scenery:circle:'));
    expect(filler).toHaveLength(96);
    const large = filler.filter((entity) => entity.scale.x > 1);
    for (const season of ['spring', 'summer', 'autumn', 'winter'] as const) {
      expect(
        large.filter((entity) => circleSeason(entity.position) === season).length,
      ).toBeGreaterThanOrEqual(4);
    }
    expect(large.every((entity) => entity.scale.y >= 3)).toBe(true);
    expect(
      filler.some(
        (entity) =>
          circleSeason(entity.position) === 'spring' && entity.modelKey.startsWith('blossoms:'),
      ),
    ).toBe(true);
    const forbidden = [
      ...scene.terrain.tiles
        .filter(
          (tile) => tile.source === 'day' || tile.surface === 'water' || tile.surface === 'path',
        )
        .map((tile) => tile.position),
      ...scene.entities
        .filter((entity) => !entity.id.startsWith('scenery:circle:'))
        .map((entity) => entity.position),
    ];
    for (const grove of large) {
      expect(
        forbidden.some(
          (position) =>
            Math.abs(position.x - grove.position.x) <= 1 &&
            Math.abs(position.z - grove.position.z) <= 1,
        ),
      ).toBe(false);
      expect(scene.bounds.max.y).toBeGreaterThan(grove.position.y + grove.scale.y);
      expect(
        filler.some(
          (other) =>
            other.id !== grove.id &&
            Math.abs(other.position.x - grove.position.x) <= 1 &&
            Math.abs(other.position.z - grove.position.z) <= 1,
        ),
      ).toBe(false);
    }
    expect(parseWorldScene(scene)).toEqual(scene);
  });
});
