import { afterAll, beforeAll, expect, it } from 'vitest';
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  InstancedMesh,
  Mesh,
  MeshDepthMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  Vector3,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import { loadAuthoredLibrary, type AuthoredLibrary } from '../../../src/tour/authored/library.js';
import { createAuthoredBatches } from '../../../src/tour/authored/batches.js';
import { naturePart, NATURE_NODES } from '../../../src/tour/authored/nature-models.js';
import { GeometryResources } from '../../../src/world/three/geometry/resources.js';
import { createForestWind } from '../../../src/tour/render/wind.js';
import { loadTourModel } from '../../../src/tour/model/load.js';
import type { TourModel } from '../../../src/tour/types.js';
import { wildlifeBaseUrl } from './fixture.js';

let library: AuthoredLibrary;
let model: TourModel;
beforeAll(async () => {
  library = await loadAuthoredLibrary(
    ['nature/nature-collection.glb', 'village/house.glb'],
    wildlifeBaseUrl,
    new AbortController().signal,
  );
  model = (await loadTourModel({ pageUrl: 'https://example.github.io/tour/' })).model;
});
afterAll(() => library?.dispose());

it('loads every named nature root with real normal maps and grounds actual vertex geometry', () => {
  // Given the shipped collection and all of its named models.
  const collection = library.models.get('nature/nature-collection.glb');
  if (!collection) throw new TypeError('Expected the authored nature collection');
  const resources = new GeometryResources();
  const placement = model.placements[0];
  const before = JSON.stringify(model);
  try {
    for (const name of NATURE_NODES) {
      // When the actual model is instanced at its real-world size.
      const batches = createAuthoredBatches(resources);
      const source = collection.source(name);
      batches.add(source, naturePart(name, 3, 2.5), {
        ...placement,
        position: { x: 0, y: 0, z: 0 },
      });
      batches.finish();
      const bounds = new Box3().setFromObject(batches.root, true);
      const size = bounds.getSize(new Vector3());
      // Then the visible model remains grounded, bounded and materially detailed.
      expect(bounds.min.y).toBeCloseTo(0, 4);
      expect(Math.max(size.x, size.z)).toBeLessThanOrEqual(2.501);
      expect(size.y).toBeLessThanOrEqual(3.001);
      expect(source.meshes.every((mesh) => mesh.geometry.hasAttribute('normal'))).toBe(true);
      batches.dispose();
    }
    expect(collection.source('CommonTree_3').meshes.some((mesh) => mesh.material.normalMap)).toBe(
      true,
    );
    expect(JSON.stringify(model)).toBe(before);
  } finally {
    resources.dispose();
  }
});

it('compiles textured seasonal leaves and matching wind shadows in real WebGL', () => {
  // Given the actual cutout leaf model, its seasonal tint and the production wind shader.
  const collection = library.models.get('nature/nature-collection.glb');
  if (!collection) throw new TypeError('Expected the authored nature collection');
  const resources = new GeometryResources();
  const wind = createForestWind(resources);
  const batches = createAuthoredBatches(resources, wind);
  const placement = {
    ...model.placements[0],
    position: { x: 0, y: 0, z: 0 },
    season: 'autumn' as const,
  };
  batches.add(
    collection.source('CommonTree_3'),
    naturePart('CommonTree_3', 3.5, 3, { wind: 'tree' }),
    placement,
  );
  batches.finish();
  const canvas = document.createElement('canvas');
  const renderer = new WebGLRenderer({ canvas, antialias: false });
  const target = new WebGLRenderTarget(256, 256);
  const camera = new PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(5, 3, 6);
  camera.lookAt(0, 1.5, 0);
  const scene = new Scene();
  scene.background = new Color('#dce6ed');
  const light = new DirectionalLight('#ffffff', 3);
  light.position.set(4, 8, 3);
  light.castShadow = true;
  const plane = new Mesh(
    resources.geometry(new PlaneGeometry(20, 20)),
    resources.material(new MeshStandardMaterial({ color: '#80996a' })),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.receiveShadow = true;
  scene.add(batches.root, light, new AmbientLight('#ffffff', 1), plane);
  renderer.shadowMap.enabled = true;
  renderer.setRenderTarget(target);
  const errors: string[] = [];
  renderer.debug.onShaderError = () => errors.push('Authored shader failed to compile');
  const pixels = () => {
    renderer.render(scene, camera);
    const result = new Uint8Array(256 * 256 * 4);
    renderer.readRenderTargetPixels(target, 0, 0, 256, 256, result);
    return result;
  };
  try {
    // When a fixed viewpoint observes a held pose and then a different wind time.
    wind.update(0);
    const first = pixels();
    const frozen = pixels();
    wind.update(2.3);
    const moved = pixels();
    // Then normals, textured alpha silhouettes and seasonal shaders work together without a separate clock.
    expect(errors).toEqual([]);
    expect(frozen).toEqual(first);
    expect(moved.some((value, index) => value !== first[index])).toBe(true);
    const leaves = batches.root.children.find(
      (object) =>
        object instanceof InstancedMesh &&
        object.material instanceof MeshStandardMaterial &&
        object.material.alphaTest > 0,
    );
    if (!(leaves instanceof InstancedMesh) || !(leaves.material instanceof MeshStandardMaterial))
      throw new TypeError('Expected alpha-tested leaves');
    const depth = leaves.customDepthMaterial;
    expect(depth).toBeInstanceOf(MeshDepthMaterial);
    if (!(depth instanceof MeshDepthMaterial))
      throw new TypeError('Expected matching depth material');
    expect(depth.map).toBe(leaves.material.map);
    expect(depth.alphaTest).toBe(leaves.material.alphaTest);
    expect(leaves.material.normalMap).not.toBeNull();
  } finally {
    batches.dispose();
    resources.dispose();
    target.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
});
