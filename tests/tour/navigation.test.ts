import { describe, expect, it } from 'vitest';
import { createGround } from '../../src/tour/navigation/ground.js';

const cells = [
  { x: 0, z: 0, surface: 'grass' },
  { x: 4, z: 0, surface: 'water' },
  { x: 8, z: 0, surface: 'grass' },
  { x: 0, z: 4, surface: 'snow' },
] as const;

describe('safe walking in the actual Calendar village', () => {
  it('blocks missing dates, water, island edges and solid buildings', () => {
    const ground = createGround(cells, [], [{ x: 0, z: 0, halfX: 0.6, halfZ: 0.6 }]);
    expect(ground.canStand({ x: 0, z: 0 })).toBe(false);
    expect(ground.canStand({ x: 1.2, z: 0 })).toBe(true);
    expect(ground.canStand({ x: 1.9, z: 0 })).toBe(false);
    expect(ground.canStand({ x: 4, z: 0 })).toBe(false);
    expect(ground.canStand({ x: 4, z: 4 })).toBe(false);
    expect(ground.canStand({ x: 0, z: 4 })).toBe(true);
    expect(ground.nearest({ x: 0, z: 0 })).not.toEqual({ x: 0, z: 0 });
  });

  it('allows an actual bridge across water, but never invented ground', () => {
    const ground = createGround(
      cells,
      [
        [
          { x: 0, z: 0 },
          { x: 8, z: 0 },
        ],
      ],
      [],
    );
    expect(ground.canStand({ x: 4, z: 0 })).toBe(true);
    expect(ground.canStand({ x: 4, z: 1 })).toBe(false);
    expect(ground.move({ x: 0, z: 0 }, { x: 8, z: 0 }).x).toBeCloseTo(8);
  });

  it('sweeps long movements so frames cannot tunnel through a house or water', () => {
    const ground = createGround(cells, [], []);
    expect(ground.move({ x: 0, z: 0 }, { x: 8, z: 0 }).x).toBeLessThan(2);
    const obstacle = createGround(cells, [], [{ x: 0, z: 1, halfX: 0.5, halfZ: 0.15 }]);
    expect(obstacle.move({ x: 0, z: 0 }, { x: 0, z: 4 }).z).toBeLessThan(0.7);
    expect(ground.nearest({ x: 100, z: 0 })).not.toBeNull();
  });

  it('disables walking when every observed cell is liquid', () => {
    const ground = createGround([{ x: 0, z: 0, surface: 'water' }], [], []);
    expect(ground.nearest({ x: 0, z: 0 })).toBeNull();
  });
});
