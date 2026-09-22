import { afterEach, expect, it, vi } from 'vitest';
import { DoubleSide, FrontSide, MeshStandardMaterial, Texture } from 'three';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createForestWind } from '../../src/tour/render/wind.js';

const resources = new GeometryResources();
afterEach(() => resources.dispose());

it('preserves cutout leaf silhouettes and material isolation in wind shadows', () => {
  // Given two differently masked leaf materials and an opaque trunk.
  const first = new MeshStandardMaterial({
    map: new Texture(),
    alphaMap: new Texture(),
    alphaTest: 0.5,
    side: FrontSide,
  });
  const second = new MeshStandardMaterial({ map: new Texture(), alphaTest: 0.3, side: DoubleSide });
  const wind = createForestWind(resources);

  // When depth materials are requested for the same wind field.
  const depth = wind.depth('tree', first);
  const other = wind.depth('tree', second);
  const trunk = wind.depth('tree');
  const dispose = vi.fn();
  depth.addEventListener('dispose', dispose);

  // Then visible alpha, material side and resource ownership survive the shadow pass.
  expect(depth.map).toBe(first.map);
  expect(depth.alphaMap).toBe(first.alphaMap);
  expect(depth.alphaTest).toBe(0.5);
  expect(depth.side).toBe(FrontSide);
  expect(other).not.toBe(depth);
  expect(other.map).toBe(second.map);
  expect(trunk.map).toBeNull();
  expect(wind.depth('tree', first)).toBe(depth);
  resources.dispose();
  expect(dispose).toHaveBeenCalledTimes(1);
  first.map?.dispose();
  first.alphaMap?.dispose();
  second.map?.dispose();
  first.dispose();
  second.dispose();
});
