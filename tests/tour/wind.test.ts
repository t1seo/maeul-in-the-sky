import { afterEach, describe, expect, it, vi } from 'vitest';
import { InstancedMesh, MeshDepthMaterial, MeshStandardMaterial } from 'three';
import { part } from '../../src/world/model/recipes/primitives.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createBatches } from '../../src/tour/render/batches.js';
import { createForestWind } from '../../src/tour/render/wind.js';
import { WIND_PROFILES, windInfluence, windMargin } from '../../src/tour/render/wind-profiles.js';

const owned: GeometryResources[] = [];
afterEach(() => owned.splice(0).forEach((resources) => resources.dispose()));
function setup() {
  const resources = new GeometryResources();
  owned.push(resources);
  return { resources, wind: createForestWind(resources) };
}

describe('grounded forest motion', () => {
  it.each(Object.keys(WIND_PROFILES))(
    'anchors the %s root while allowing the upper plant to bend',
    (key) => {
      // Given: every profile shares the same ground plane.
      const entry = Object.entries(WIND_PROFILES).find(([name]) => name === key);
      expect(entry).toBeDefined();
      if (!entry) return;
      const [, profile] = entry;

      // When: influence is evaluated below ground, at a root and at its upper extent.
      const weights = [-1, 0, 0.015, 0.2, profile.height, profile.height + 100].map((height) =>
        windInfluence(height, profile),
      );

      // Then: roots remain rigid and a finite envelope bounds every taller vertex.
      expect(weights.slice(0, 3)).toEqual([0, 0, 0]);
      expect(weights[3]).toBeGreaterThan(0);
      expect(weights[4]).toBeGreaterThan(weights[3]);
      expect(windInfluence(100, profile)).toBe(windInfluence(1000, profile));
      expect(windMargin(profile)).toBeGreaterThan(0);
      expect(windMargin(profile)).toBeLessThan(0.5);
    },
  );

  it('keeps a paused forest at the exact same elapsed time', () => {
    // Given: an existing animated pose.
    const { wind } = setup();
    wind.update(14.25);

    // When: repeated renders use the paused renderer clock.
    for (let frame = 0; frame < 100; frame++) wind.update(14.25);

    // Then: no independent clock advances the wind.
    expect(wind.elapsed).toBe(14.25);
  });

  it('isolates each wind profile from a shared static material and owns cleanup once', () => {
    // Given: a common standard material used for a rock and leaves.
    const { resources, wind } = setup();
    const base = resources.standard(0.9, 1);
    const staticProgram = base.customProgramCacheKey();

    // When: animated and depth materials are requested repeatedly.
    const tree = wind.material(base, 'tree');
    const shrub = wind.material(base, 'shrub');
    const depth = wind.depth('tree');
    const repeatedTree = wind.material(base, 'tree');
    const repeatedDepth = wind.depth('tree');
    const materialDispose = vi.fn();
    const depthDispose = vi.fn();
    tree.addEventListener('dispose', materialDispose);
    depth.addEventListener('dispose', depthDispose);
    resources.dispose();

    // Then: static shading stays unchanged and each owned copy is disposed once.
    expect(tree).toBeInstanceOf(MeshStandardMaterial);
    expect(tree).not.toBe(base);
    expect(tree).not.toBe(shrub);
    expect(repeatedTree).toBe(tree);
    expect(repeatedDepth).toBe(depth);
    expect(depth).toBeInstanceOf(MeshDepthMaterial);
    expect(base.customProgramCacheKey()).toBe(staticProgram);
    expect(materialDispose).toHaveBeenCalledTimes(1);
    expect(depthDispose).toHaveBeenCalledTimes(1);
  });

  it('separates equally colored static and moving parts without losing dates or shared geometry', () => {
    // Given: one cube shape used by a plant and a building at the same scale.
    const { resources, wind } = setup();
    const batches = createBatches(resources, wind);
    const cube = part('box', '#74a367', [0, 1, 0], [1, 2, 1]);
    batches.add(cube, 'leaf', { x: 4, y: 0, z: 8 }, 1, 'tree:date', false, 'tree');
    batches.add(cube, 'wall', { x: 4, y: 0, z: 8 }, 1, 'building:date');

    // When: the scene batches become renderable objects.
    const meshes = batches.finish().children.filter((child) => child instanceof InstancedMesh);
    const [moving, fixed] = meshes;

    // Then: profile-specific materials and shadows never leak into rigid geometry.
    expect(meshes).toHaveLength(2);
    expect(moving.geometry).toBe(fixed.geometry);
    expect(moving.material).not.toBe(fixed.material);
    expect(moving.customDepthMaterial).toBe(wind.depth('tree'));
    expect(fixed.customDepthMaterial).toBeUndefined();
    expect(moving.boundingSphere?.radius).toBeGreaterThan(fixed.boundingSphere?.radius ?? 0);
    expect(moving.geometry.boundingSphere?.radius).toBeCloseTo(Math.sqrt(3) / 2);
    expect(batches.identities.get(moving.uuid)).toEqual(['tree:date']);
    expect(batches.identities.get(fixed.uuid)).toEqual(['building:date']);
  });
});
