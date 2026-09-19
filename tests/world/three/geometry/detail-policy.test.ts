import { describe, expect, it } from 'vitest';
import { detailPolicy } from '../../../../src/world/three/geometry/detail-policy.js';
import type { WorldView } from '../../../../src/world/model/types.js';
import { scene, view } from './fixtures.js';

const large = { ...scene, bounds: { min: { x: -2, y: -2, z: -2 }, max: { x: 55, y: 3, z: 30 } } };

describe('local detail budgets', () => {
  it.each([
    [{ kind: 'world' }, false],
    [{ kind: 'month', monthKey: '2024-02' }, true],
    [{ kind: 'month', monthKey: '2024-03' }, false],
    [{ kind: 'day', date: '2024-02-28' }, true],
    [{ kind: 'entity', entityId: 'asset:2024-02-28' }, true],
    [{ kind: 'actor', actorId: 'train' }, false],
  ] satisfies readonly (readonly [WorldView['focus'], boolean])[])(
    'promotes only matching geometry for %j',
    (focus, expected) => {
      // Given
      const policy = detailPolicy(large, { ...view, focus });
      // When
      const full = policy.full('asset:2024-02-28', 'region:2024-02:nature', { x: 0, y: 0, z: 0 });
      // Then
      expect(full).toBe(expected);
    },
  );

  it('promotes close zoom locally while low quality uses a larger ornament cutoff', () => {
    // Given
    const focused = { ...view, camera: { ...view.camera, zoom: 4, target: { x: 0, y: 0, z: 0 } } };
    const policy = detailPolicy(large, focused);
    // When
    const nearby = policy.full('near', '', { x: 1, y: 0, z: 1 });
    const far = policy.full('far', '', { x: 50, y: 0, z: 30 });
    // Then
    expect(nearby).toBe(true);
    expect(far).toBe(false);
    expect(detailPolicy(large, { ...focused, quality: 'low' }).minimum).toBeGreaterThan(
      policy.minimum,
    );
  });
});
