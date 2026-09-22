import { afterEach, expect, it, vi } from 'vitest';
import { MeshStandardMaterial, Texture } from 'three';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createAuthoredMaterials } from '../../src/tour/authored/materials.js';

const resources = new GeometryResources();
afterEach(() => resources.dispose());

it('tints only named foliage while preserving authored maps and isolated seasonal variants', () => {
  // Given one shared leaf material and a bark material using a detailed texture.
  const leaf = new MeshStandardMaterial({
    map: new Texture(),
    normalMap: new Texture(),
    alphaTest: 0.5,
  });
  leaf.name = 'Foliage';
  const bark = new MeshStandardMaterial({ color: '#5e3d25' });
  bark.name = 'Bark';
  const part = { file: 'tree.glb', height: 3, maxSpan: 2, foliageMaterials: ['Foliage'] };
  const library = createAuthoredMaterials(resources);
  // When the same authored plant enters different seasons and a blossom variant.
  const summer = library.material(leaf, part, 'summer');
  const autumn = library.material(leaf, part, 'autumn');
  const winter = library.material(leaf, part, 'winter');
  const blossom = library.material(leaf, { ...part, foliageColor: '#e8afc5' }, 'spring');
  // Then foliage-only shader variants retain all detail and never mutate shared originals.
  expect(summer).toBe(leaf);
  expect(autumn).not.toBe(leaf);
  expect(winter).not.toBe(autumn);
  expect(blossom).not.toBe(winter);
  expect(library.material(bark, part, 'winter')).toBe(bark);
  expect(library.material(leaf, part, 'autumn')).toBe(autumn);
  expect(autumn.map).toBe(leaf.map);
  expect(autumn.normalMap).toBe(leaf.normalMap);
  expect(autumn.alphaTest).toBe(0.5);
  expect(leaf.color.getHexString()).toBe('ffffff');
  expect(autumn.customProgramCacheKey()).not.toBe(leaf.customProgramCacheKey());
  const originalDisposed = vi.fn();
  const cloneDisposed = vi.fn();
  leaf.addEventListener('dispose', originalDisposed);
  autumn.addEventListener('dispose', cloneDisposed);
  resources.dispose();
  expect(originalDisposed).not.toHaveBeenCalled();
  expect(cloneDisposed).toHaveBeenCalledOnce();
  leaf.map?.dispose();
  leaf.normalMap?.dispose();
  leaf.dispose();
  bark.dispose();
});
