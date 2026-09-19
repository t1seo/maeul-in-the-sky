import { DataTexture, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { describe, expect, it, vi } from 'vitest';
import type { WorldScene } from '../../../../src/world/model/types.js';
import { createWorldGeometry } from '../../../../src/world/three/geometry/index.js';
import { frameFor, scene, view } from './fixtures.js';

function terrain(world: ReturnType<typeof createWorldGeometry>) {
  const mesh = world.content.getObjectByName('terrain:surface');
  if (!(mesh instanceof Mesh) || !(mesh.material instanceof MeshStandardMaterial))
    throw new TypeError('Terrain requires a standard material');
  return mesh;
}

describe('continuous textured ground', () => {
  it('resolves calendar winter snow through the canonical seasonal weather helper', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), { ...view, weather: 'snow' });
    const expected = Array.from(terrain(world).geometry.getAttribute('color').array);
    // When
    world.update(frameFor(), { ...view, weather: 'seasonal' });
    // Then
    expect(Array.from(terrain(world).geometry.getAttribute('color').array)).toEqual(expected);
    world.dispose();
  });

  it('shares smooth normals and blended colors at adjoining grass and sand corners', () => {
    // Given
    const mixed: WorldScene = {
      ...scene,
      terrain: {
        ...scene.terrain,
        tiles: scene.terrain.tiles.map((tile, index) => ({
          ...tile,
          surface: index === 0 ? 'grass' : 'sand',
          position: { ...tile.position, y: index * 0.5 + 0.4 },
        })),
      },
    };
    const world = createWorldGeometry(mixed);
    // When
    world.update(frameFor(mixed), view);
    const geometry = terrain(world).geometry;
    const position = geometry.getAttribute('position');
    const normals = geometry.getAttribute('normal');
    const colors = geometry.getAttribute('color');
    const shared = new Map<string, { readonly normal: Vector3; readonly color: Vector3 }>();
    // Then
    for (let index = 0; index < position.count; index += 1) {
      const key = new Vector3().fromBufferAttribute(position, index).toArray().join(':');
      const normal = new Vector3().fromBufferAttribute(normals, index);
      const color = new Vector3().fromBufferAttribute(colors, index);
      expect(normal.length()).toBeCloseTo(1, 5);
      const previous = shared.get(key);
      if (previous) {
        expect(normal.distanceTo(previous.normal)).toBeLessThan(0.00001);
        expect(color.distanceTo(previous.color)).toBeLessThan(0.00001);
      }
      shared.set(key, { normal, color });
    }
    world.dispose();
  });

  it('uses compact deterministic color and normal textures with seasonal surface UVs', () => {
    // Given
    const a = createWorldGeometry(scene);
    const b = createWorldGeometry(scene);
    a.update(frameFor(), { ...view, seasonOverride: 'summer' });
    b.update(frameFor(), { ...view, seasonOverride: 'summer' });
    const first = terrain(a);
    const second = terrain(b);
    // Then
    expect(first.material.map).toBeInstanceOf(DataTexture);
    expect(first.material.normalMap).toBeInstanceOf(DataTexture);
    if (first.material.map instanceof DataTexture && second.material.map instanceof DataTexture) {
      expect(first.material.map.image.data).toEqual(second.material.map.image.data);
      expect(first.material.map.image.width * first.material.map.image.height).toBeLessThanOrEqual(
        131072,
      );
      expect(new Set(first.material.map.image.data).size).toBeGreaterThan(12);
    }
    const uv = first.geometry.getAttribute('uv');
    expect(uv?.count).toBe(first.geometry.getAttribute('position').count);
    const summer = Array.from(uv?.array ?? []);
    const positions = Array.from(first.geometry.getAttribute('position').array);
    // When
    a.update(frameFor(), { ...view, seasonOverride: 'winter', weather: 'snow' });
    // Then
    expect(Array.from(first.geometry.getAttribute('uv').array)).not.toEqual(summer);
    expect(Array.from(first.geometry.getAttribute('position').array)).toEqual(positions);
    a.dispose();
    b.dispose();
  });

  it('releases each shared surface texture exactly once', () => {
    // Given
    const world = createWorldGeometry(scene);
    world.update(frameFor(), view);
    const textures = new Set<DataTexture>();
    world.content.traverse((object) => {
      if (!(object instanceof Mesh) || !(object.material instanceof MeshStandardMaterial)) return;
      for (const map of [object.material.map, object.material.normalMap, object.material.alphaMap])
        if (map instanceof DataTexture) textures.add(map);
    });
    const disposed = [...textures].map((texture) => vi.spyOn(texture, 'dispose'));
    // When
    world.dispose();
    world.dispose();
    // Then
    expect(textures.size).toBeGreaterThanOrEqual(2);
    for (const spy of disposed) expect(spy).toHaveBeenCalledTimes(1);
  });
});
