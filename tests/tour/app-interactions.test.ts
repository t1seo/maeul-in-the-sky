import { describe, expect, it } from 'vitest';
import { projectMapPoint, unprojectMapPoint } from '../../src/tour/app/map-coordinates.js';
import { createTapGesture } from '../../src/tour/app/tap-gesture.js';

const bounds = { minX: -2, maxX: 210, minZ: -2, maxZ: 26 };
const size = { width: 424, height: 100 };

describe('tour map coordinates', () => {
  it('keeps square world tiles square in wide and tall minimaps', () => {
    for (const viewport of [size, { width: 288, height: 120 }]) {
      for (const extent of [bounds, { minX: -2, maxX: 2, minZ: -2, maxZ: 26 }]) {
        const start = projectMapPoint(extent, viewport, { x: 0, z: 0 });
        const end = projectMapPoint(extent, viewport, { x: 4, z: 4 });
        expect(end.x - start.x).toBeCloseTo(end.y - start.y, 8);
      }
    }
  });

  it('does not teleport when a click lands in the empty letterbox area', () => {
    expect(unprojectMapPoint(bounds, size, { x: 212, y: 11 })).toBeNull();
    const narrow = { minX: -2, maxX: 2, minZ: -2, maxZ: 26 };
    expect(unprojectMapPoint(narrow, size, { x: 11, y: 50 })).toBeNull();
  });

  it('round-trips canonical positions without replacing the calendar axes', () => {
    for (const point of [
      { x: 0, z: 0 },
      { x: 160, z: 4 },
      { x: 208, z: 24 },
    ]) {
      const projected = projectMapPoint(bounds, size, point);
      const restored = unprojectMapPoint(bounds, size, projected);
      expect(restored?.x).toBeCloseTo(point.x, 8);
      expect(restored?.z).toBeCloseTo(point.z, 8);
    }
  });

  it('keeps the same clicked day when the map is resized for a phone', () => {
    const phone = { width: 288, height: 120 };
    const point = { x: 72, z: 20 };
    const restored = unprojectMapPoint(bounds, phone, projectMapPoint(bounds, phone, point));
    expect(restored?.x).toBeCloseTo(72, 8);
    expect(restored?.z).toBeCloseTo(20, 8);
  });

  it('rejects clicks in the map margin and non-finite pointer coordinates', () => {
    expect(unprojectMapPoint(bounds, size, { x: 0, y: 0 })).toBeNull();
    expect(unprojectMapPoint(bounds, size, { x: 425, y: 60 })).toBeNull();
    expect(unprojectMapPoint(bounds, size, { x: Number.NaN, y: 60 })).toBeNull();
  });
});

describe('tour click and drag distinction', () => {
  it('accepts a deliberate short tap', () => {
    const gesture = createTapGesture();
    gesture.start({ id: 1, x: 20, y: 30 });
    expect(gesture.finish({ id: 1, x: 22, y: 31 })).toBe(true);
    expect(gesture.finish({ id: 1, x: 22, y: 31 })).toBe(false);
  });

  it('does not teleport after a drag that returns to its starting point', () => {
    const gesture = createTapGesture();
    gesture.start({ id: 1, x: 20, y: 30 });
    gesture.move({ id: 1, x: 40, y: 30 });
    gesture.move({ id: 1, x: 20, y: 30 });
    expect(gesture.finish({ id: 1, x: 20, y: 30 })).toBe(false);
  });

  it('accumulates small movements rather than testing only the final displacement', () => {
    const gesture = createTapGesture();
    gesture.start({ id: 1, x: 20, y: 30 });
    gesture.move({ id: 1, x: 23, y: 30 });
    gesture.move({ id: 1, x: 20, y: 30 });
    expect(gesture.finish({ id: 1, x: 23, y: 30 })).toBe(false);
  });

  it('does not turn a canceled or multi-touch gesture into a click', () => {
    const gesture = createTapGesture();
    gesture.start({ id: 1, x: 20, y: 30 });
    gesture.cancel();
    expect(gesture.finish({ id: 1, x: 20, y: 30 })).toBe(false);
    gesture.start({ id: 1, x: 20, y: 30 });
    gesture.start({ id: 2, x: 50, y: 30 });
    expect(gesture.finish({ id: 2, x: 50, y: 30 })).toBe(false);
    expect(gesture.finish({ id: 1, x: 20, y: 30 })).toBe(false);
  });
});
