import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { Box3, Mesh, PerspectiveCamera, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadWildlifeLibrary, type WildlifeLibrary } from '../../../src/tour/wildlife/library.js';
import { createWildlifeActor, type WildlifeActor } from '../../../src/tour/wildlife/actor.js';
import { createWildlifePopulation } from '../../../src/tour/wildlife/population.js';
import { loadTourModel } from '../../../src/tour/model/load.js';
import { GeometryResources } from '../../../src/world/three/geometry/resources.js';
import { populateVillage } from '../../../src/tour/render/populate.js';
import { createTourPicker } from '../../../src/tour/render/picking.js';
import type { TourModel } from '../../../src/tour/types.js';
import { wildlifeBaseUrl } from './fixture.js';

let library: WildlifeLibrary;
let model: TourModel;
const actors: WildlifeActor[] = [];
beforeAll(async () => {
  library = await loadWildlifeLibrary(
    ['cow', 'squirrel'],
    wildlifeBaseUrl,
    new AbortController().signal,
  );
  model = (await loadTourModel({ pageUrl: 'https://example.github.io/tour/' })).model;
});
afterEach(() => {
  for (const actor of actors.splice(0)) actor.dispose();
  vi.restoreAllMocks();
});
afterAll(() => library?.dispose());

function cow(index = 0): WildlifeActor {
  const source = library.models.get('cow');
  const placement = model.placements.filter((item) => item.source.catalogId === 'cow')[index];
  if (!source || !placement) throw new Error('Expected the genuine sample cow');
  const actor = createWildlifeActor(source, 'cow', placement);
  actors.push(actor);
  return actor;
}

describe('authored wildlife and original dated identities', () => {
  it('clones independent skeletons while sharing the authored geometry and materials', () => {
    const first = cow();
    const second = cow(1);
    const mesh = first.meshes.find((entry) => entry instanceof SkinnedMesh);
    const other = second.meshes.find((entry) => entry instanceof SkinnedMesh);
    if (!(mesh instanceof SkinnedMesh) || !(other instanceof SkinnedMesh))
      throw new Error('Expected authored rigs');
    expect(mesh.geometry).toBe(other.geometry);
    expect(mesh.material).toBe(other.material);
    expect(mesh.skeleton).not.toBe(other.skeleton);
    expect(mesh.skeleton.bones[0]).not.toBe(other.skeleton.bones[0]);
    first.update(4);
    second.update(4);
    expect(mesh.skeleton.bones.map((bone) => bone.quaternion.toArray())).not.toEqual(
      other.skeleton.bones.map((bone) => bone.quaternion.toArray()),
    );
    const pose = mesh.skeleton.bones.map((bone) => bone.quaternion.toArray());
    first.update(5);
    expect(mesh.skeleton.bones.map((bone) => bone.quaternion.toArray())).not.toEqual(pose);
    expect(first.root.position).toEqual(new Vector3(24, 0.025, 8));
    const dispose = vi.spyOn(mesh.geometry, 'dispose');
    first.dispose();
    first.dispose();
    expect(dispose).not.toHaveBeenCalled();
    second.update(8);
    expect(second.inspect().time).toBe(8);
  });

  it('keeps feet grounded throughout authored idle and feeding, and freezes an identical time', () => {
    const actor = cow();
    const anchor = actor.root.position.clone();
    for (const time of [0, 0.5, 2, 8, 14, 21, 28, 36, 46]) {
      actor.update(time);
      const box = new Box3().setFromObject(actor.root, true);
      expect(box.min.y).toBeGreaterThan(-0.12);
      expect(box.min.y).toBeLessThan(0.15);
      expect(box.max.y).toBeLessThan(1.95);
      expect(actor.root.position).toEqual(anchor);
      actor.update(time);
      expect(new Box3().setFromObject(actor.root, true)).toEqual(box);
    }
  });

  it('retains a textured squirrel and original source anchors without an extra primitive body', () => {
    const source = library.models.get('squirrel');
    const placement = model.placements.find((item) => item.source.catalogId === 'squirrel');
    if (!source || !placement) throw new Error('Expected squirrel');
    const actor = createWildlifeActor(source, 'squirrel', placement);
    actors.push(actor);
    expect(actor.meshes).toHaveLength(1);
    expect(actor.meshes[0]).toBeInstanceOf(Mesh);
    expect(actor.inspect().animated).toBe(false);
    const first = new Box3().setFromObject(actor.root, true);
    actor.update(2);
    const second = new Box3().setFromObject(actor.root, true);
    expect(second.min.y).toBeCloseTo(first.min.y, 5);
    expect(second.max.y - second.min.y).toBeCloseTo(0.46, 1);
  });

  it('selects the animal source date even when its mesh lies over another day', () => {
    const placement = model.placements.find((item) => item.source.catalogId === 'cow');
    if (!placement) throw new Error('Expected cow');
    const relocated = { ...placement, position: { x: 0, y: 0, z: 0 } };
    const single = { ...model, placements: [relocated] };
    const resources = new GeometryResources();
    const village = populateVillage(single, resources, undefined, library);
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:400px;height:400px';
    document.body.append(canvas);
    try {
      const camera = new PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.set(0, 1, 6);
      camera.lookAt(0, 0.8, 0);
      village.root.updateMatrixWorld(true);
      const picker = createTourPicker(camera, canvas, single, village, []);
      const rect = canvas.getBoundingClientRect();
      expect(picker.cell(rect.left + 200, rect.top + 200)?.date).toBe(placement.source.anchorDate);
      expect(village.animals.inspect().count).toBe(1);
    } finally {
      resources.dispose();
      canvas.remove();
    }
  });

  it('culls outside the camera while preserving population identity and immutable model', () => {
    const before = JSON.stringify(model);
    const population = createWildlifePopulation(model, library);
    const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(100, 90, 100);
    camera.lookAt(100, 0, 12);
    population.update(2, camera);
    expect(population.inspect().visible).toBeGreaterThan(0);
    camera.lookAt(100, 200, 100);
    population.update(3, camera);
    expect(population.inspect().visible).toBe(0);
    population.dispose();
    population.dispose();
    population.update(5, camera);
    expect(JSON.stringify(model)).toBe(before);
  });
});

describe('wildlife load lifetime', () => {
  it('reports missing and corrupt assets, and accepts a library with no wildlife', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    for (const response of [new Response('', { status: 404 }), new Response('broken')]) {
      fetcher.mockResolvedValueOnce(response);
      await expect(
        loadWildlifeLibrary(['cow'], wildlifeBaseUrl, new AbortController().signal),
      ).rejects.toThrow('animal models');
    }
    const empty = await loadWildlifeLibrary([], wildlifeBaseUrl, new AbortController().signal);
    expect(empty.models.size).toBe(0);
    empty.dispose();
    empty.dispose();
  });

  it('disposes a parsed model that completes after cancellation', async () => {
    const controller = new AbortController();
    const parse = GLTFLoader.prototype.parseAsync;
    const disposed = vi.fn();
    vi.spyOn(GLTFLoader.prototype, 'parseAsync').mockImplementation(async function (
      this: GLTFLoader,
      data,
      path,
    ) {
      const result = await parse.call(this, data, path);
      result.scene.traverse((object) => {
        if (object instanceof Mesh) object.geometry.addEventListener('dispose', disposed);
      });
      controller.abort();
      return result;
    });
    await expect(
      loadWildlifeLibrary(['cow'], wildlifeBaseUrl, controller.signal),
    ).rejects.toThrow();
    expect(disposed).toHaveBeenCalledOnce();
  });
});
