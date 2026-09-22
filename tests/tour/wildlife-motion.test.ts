import { readFile } from 'node:fs/promises';
import { expect, it } from 'vitest';
import { Box3, PerspectiveCamera, SkinnedMesh } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { createWildlifePopulation } from '../../src/tour/wildlife/population.js';
import { disposeWildlifeModels } from '../../src/tour/wildlife/resources.js';

it('preserves an identical frozen skeletal pose when the camera crosses the distance threshold', async () => {
  const bytes = new Uint8Array(await readFile('docs/demo/tour/models/cow.glb')).buffer;
  const gltf = await new GLTFLoader().parseAsync(bytes, '');
  gltf.scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(gltf.scene, true);
  const model = parseTourSnapshot(sampleSnapshot());
  const population = createWildlifePopulation(model, {
    models: new Map([['cow', { gltf, bounds, height: bounds.max.y - bounds.min.y }]]),
    dispose: () => disposeWildlifeModels([gltf]),
  });
  try {
    const camera = new PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(24, 4, 16);
    camera.lookAt(24, 0.8, 8);
    population.update(2.543, camera);
    const bones: SkinnedMesh[] = [];
    population.root.traverse((object) => {
      if (object instanceof SkinnedMesh) bones.push(object);
    });
    const pose = () =>
      bones.map((mesh) => mesh.skeleton.bones.map((bone) => bone.quaternion.toArray()));
    const frozen = pose();
    camera.position.set(24, 10, 58);
    camera.lookAt(24, 0.8, 8);
    population.update(2.543, camera);
    expect(pose()).toEqual(frozen);
    population.update(2.75, camera);
    expect(pose()).not.toEqual(frozen);
    const farPose = pose();
    population.update(2.793, camera);
    expect(pose()).toEqual(farPose);
    camera.position.set(24, 4, 16);
    camera.lookAt(24, 0.8, 8);
    population.update(2.793, camera);
    expect(pose()).toEqual(farPose);
  } finally {
    population.dispose();
    disposeWildlifeModels([gltf]);
  }
});
