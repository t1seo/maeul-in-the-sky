import { readFile } from 'node:fs/promises';
import { Box3, Raycaster, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { expect, it } from 'vitest';
import { createWildlifeActor } from '../../src/tour/wildlife/actor.js';
import { disposeWildlifeModels } from '../../src/tour/wildlife/resources.js';
import { loadTourModel } from '../../src/tour/model/load.js';

it('keeps the feeding deer pickable after a previous pose cached raycast bounds', async () => {
  // Given an authored deer at a fixed dated anchor with its initial picking bounds cached.
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const anchor = model.placements.find((entry) => entry.source.catalogId === 'cow');
  if (!anchor) throw new Error('Expected the deterministic sample anchor');
  const placement = { ...anchor, source: { ...anchor.source, catalogId: 'deer' } };
  const bytes = new Uint8Array(await readFile('docs/demo/tour/models/deer.glb'));
  const gltf = await new GLTFLoader().parseAsync(bytes.buffer, '');
  gltf.scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(gltf.scene, true);
  const actor = createWildlifeActor(
    { gltf, bounds, height: bounds.getSize(new Vector3()).y },
    'deer',
    placement,
  );
  try {
    const mesh = actor.meshes.find((object) => object instanceof SkinnedMesh);
    if (!mesh) throw new Error('Expected the authored deer rig');
    const ray = new Raycaster(
      new Vector3(27.642980434237476, 0.6732499958506278, 9.028183037748816),
      new Vector3(-1, 0, 0),
    );
    ray.intersectObject(mesh, false);

    // When feeding extends visible geometry beyond that earlier pose's cached sphere.
    actor.update(20);
    const hits = ray.intersectObject(mesh, false);

    // Then clicking that visible geometry still reaches the same animal.
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.object).toBe(mesh);
  } finally {
    actor.dispose();
    disposeWildlifeModels([gltf]);
  }
});
