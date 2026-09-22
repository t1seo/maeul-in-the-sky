import { readFile } from 'node:fs/promises';
import { afterEach, expect, it } from 'vitest';
import { Box3, SkinnedMesh, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { createWildlifeActor } from '../../src/tour/wildlife/actor.js';
import { disposeWildlifeModels } from '../../src/tour/wildlife/resources.js';
import type { WildlifeSpecies } from '../../src/tour/wildlife/catalog.js';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

async function fixture(species: WildlifeSpecies) {
  const data = new Uint8Array(await readFile(`docs/demo/tour/models/${species}.glb`));
  const gltf = await new GLTFLoader().parseAsync(data.buffer, '');
  cleanup.push(() => disposeWildlifeModels([gltf]));
  gltf.scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(gltf.scene, true);
  const anchor = parseTourSnapshot(sampleSnapshot()).placements[0];
  if (!anchor) throw new Error('Expected a sample placement');
  const placement = {
    ...anchor,
    source: { ...anchor.source, catalogId: species },
    position: { x: 0, y: 0, z: 0 },
  };
  const actor = createWildlifeActor(
    { gltf, bounds, height: bounds.getSize(new Vector3()).y },
    species,
    placement,
  );
  cleanup.push(actor.dispose);
  return actor;
}

it.each(['frog', 'spider', 'fish', 'whale'] as const)(
  'plays the actual peaceful %s rig and freezes its exact pose',
  async (species) => {
    // Given the published model and its retained authored clip.
    const actor = await fixture(species);
    const meshes = actor.meshes.filter((mesh) => mesh instanceof SkinnedMesh);
    const pose = () =>
      meshes.map((mesh) =>
        mesh.skeleton.bones.map((bone) => [
          ...bone.position.toArray(),
          ...bone.quaternion.toArray(),
        ]),
      );
    const initial = pose();
    const anchor = actor.root.position.clone();
    // When the shared animation clock advances and then stops.
    actor.update(0.83);
    const advanced = pose();
    actor.update(0.83);
    // Then original bones animate without moving the source anchor or paused pose.
    expect(actor.inspect().animated).toBe(true);
    expect(meshes).toHaveLength(1);
    expect(advanced).not.toEqual(initial);
    expect(pose()).toEqual(advanced);
    expect(actor.root.position).toEqual(anchor);
  },
);

it.each(['frog', 'spider', 'fish', 'whale'] as const)(
  'bounds every sampled %s pose for grounding and frustum culling',
  async (species) => {
    // Given each new rig at a level source anchor.
    const actor = await fixture(species);
    const sphere = actor.cullingSphere.clone();
    sphere.center.add(actor.root.position);
    // When idle or swim traverses its repeating pose cycle.
    for (const time of Array.from({ length: 17 }, (_, index) => index / 4)) {
      actor.update(time);
      const bounds = new Box3().setFromObject(actor.root, true);
      // Then geometry stays within the conservative culling sphere and its habitat.
      for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
          for (const z of [bounds.min.z, bounds.max.z])
            expect(sphere.containsPoint(new Vector3(x, y, z))).toBe(true);
      if (species === 'fish' || species === 'whale') {
        expect(bounds.min.y).toBeLessThan(0);
        expect(bounds.max.y).toBeGreaterThan(0);
        expect(actor.root.position.y).toBe(0);
      } else {
        expect(bounds.min.y).toBeGreaterThan(-0.05);
        expect(bounds.min.y).toBeLessThan(0.09);
      }
    }
  },
);

it.each(['turtle', 'jellyfish'] as const)(
  'retains the authored unrigged %s silhouette without stretching its anatomy',
  async (species) => {
    // Given an unrigged external model.
    const actor = await fixture(species);
    const initial = new Box3().setFromObject(actor.root, true);
    // When the environment clock advances.
    actor.update(5);
    // Then an unanimated source is not disguised with deformed legs or a bobbing body.
    expect(actor.inspect().animated).toBe(false);
    expect(new Box3().setFromObject(actor.root, true)).toEqual(initial);
  },
);
