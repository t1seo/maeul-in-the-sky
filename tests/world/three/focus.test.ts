import { describe, expect, it } from 'vitest';
import { Vector3 } from 'three';
import { frameWorld, defaultWorldView } from '../../../src/world/model/index.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import type { WorldFocus, WorldFrame } from '../../../src/world/model/types.js';
import { focusBounds, toBounds } from '../../../src/world/three/focus.js';

const frame = frameWorld(TINY_WORLD_SCENE, defaultWorldView(TINY_WORLD_SCENE));
describe('World focus targets', () => {
  it.each<WorldFocus>([
    { kind: 'world' },
    { kind: 'month', monthKey: 'unknown' },
    { kind: 'day', date: 'unknown' },
    { kind: 'entity', entityId: 'unknown' },
    { kind: 'actor', actorId: 'unknown' },
  ])('falls back to the world when target cannot be found: %j', (focus) => {
    expect(focusBounds(TINY_WORLD_SCENE, frame, focus)).toEqual(toBounds(TINY_WORLD_SCENE.bounds));
  });

  it('frames all visible dates for a month and locates day and entity focus', () => {
    const month = focusBounds(TINY_WORLD_SCENE, frame, { kind: 'month', monthKey: '2024-02' });
    for (const tile of frame.terrain.tiles)
      expect(month.containsPoint(new Vector3().copy(tile.position))).toBe(true);
    expect(
      focusBounds(TINY_WORLD_SCENE, frame, { kind: 'day', date: '2024-02-28' }).getCenter(
        new Vector3(),
      ).x,
    ).toBe(0);
    const entity = focusBounds(TINY_WORLD_SCENE, frame, {
      kind: 'entity',
      entityId: 'asset:2024-02-28',
    });
    expect(entity.getSize(new Vector3()).x).toBeGreaterThan(3);
  });

  it('locates the sampled position of a moving actor', () => {
    const moving: WorldFrame = {
      ...frame,
      actors: [
        {
          id: 'walker',
          actorId: 'walker',
          kind: 'resident',
          modelKey: 'tree',
          routeId: 'walk',
          speed: 1,
          phase: 0,
          visibleFrom: '2024-02-28',
          position: { x: 5, y: 1, z: 7 },
          yaw: 0,
        },
      ],
    };
    const actor = focusBounds(TINY_WORLD_SCENE, moving, { kind: 'actor', actorId: 'walker' });
    expect(actor.containsPoint(new Vector3(5, 1, 7))).toBe(true);
    expect(actor.getCenter(new Vector3()).x).toBe(5);
  });
});
