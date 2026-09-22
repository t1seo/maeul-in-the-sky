import { AnimationMixer, Group, Mesh, SkinnedMesh, Vector3 } from 'three';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { hash } from '../../utils/math.js';
import type { TourPlacement } from '../types.js';
import { WILDLIFE, type WildlifeSpecies } from './catalog.js';
import type { WildlifeModel } from './library.js';
import { trackSkinnedBounds } from './picking.js';

export function createWildlifeActor(
  model: WildlifeModel,
  species: WildlifeSpecies,
  placement: TourPlacement,
) {
  const root = new Group();
  root.name = `Wildlife ${species}`;
  const pose = clone(model.gltf.scene);
  const pivot = new Group();
  const center = model.bounds.getCenter(new Vector3());
  const height = placement.source.catalogId === 'lamb' ? 0.66 : WILDLIFE[species].height;
  const scale = height / model.height;
  pivot.position.set(-center.x * scale, -model.bounds.min.y * scale, -center.z * scale);
  pivot.scale.setScalar(scale);
  pivot.add(pose);
  root.add(pivot);
  root.position.set(placement.position.x, placement.position.y + 0.025, placement.position.z);
  const seed = hash(placement.source.id) >>> 0;
  root.rotation.y = (seed / 0xffffffff) * Math.PI * 2;
  const meshes: Mesh[] = [];
  const skeletons = new Set<SkinnedMesh['skeleton']>();
  const invalidateBounds: (() => void)[] = [];
  pose.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.frustumCulled = false;
    meshes.push(object);
    if (object instanceof SkinnedMesh) {
      skeletons.add(object.skeleton);
      invalidateBounds.push(trackSkinnedBounds(object));
    }
  });
  const mixer = new AnimationMixer(pose);
  const idleClips = model.gltf.animations.filter((clip) => /Idle/iu.test(clip.name));
  const idle = idleClips[seed % idleClips.length];
  const eating = model.gltf.animations.find((clip) => /Eating/iu.test(clip.name));
  const idleAction = idle ? mixer.clipAction(idle).play() : null;
  const eatingAction = eating ? mixer.clipAction(eating).play() : null;
  const phase = (seed % 10007) / 113;
  const rate = 0.87 + (seed % 31) / 100;
  let lastTime = -1;
  let disposed = false;
  const update = (elapsed: number): void => {
    if (disposed || elapsed === lastTime) return;
    lastTime = elapsed;
    const time = elapsed * rate + phase;
    if (idleAction) {
      const cycle = (time % 29) / 29;
      const blend = eatingAction
        ? Math.max(0, Math.min(1, (Math.sin(cycle * Math.PI * 2) - 0.1) * 3))
        : 0;
      const weight = blend * blend * (3 - 2 * blend);
      idleAction.setEffectiveWeight(1 - weight);
      eatingAction?.setEffectiveWeight(weight);
      mixer.setTime(time);
    } else {
      const breath = 1 + Math.sin(time * 2.8) * 0.006;
      pivot.scale.y = scale * breath;
      pivot.position.y = -model.bounds.min.y * scale * breath;
    }
    root.updateMatrixWorld(true);
    for (const invalidate of invalidateBounds) invalidate();
  };
  update(0);
  return {
    root,
    meshes,
    species,
    height,
    update,
    inspect: () => ({
      species,
      sourceId: placement.source.id,
      time: lastTime,
      animated: Boolean(idle),
    }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      mixer.stopAllAction();
      mixer.uncacheRoot(pose);
      for (const skeleton of skeletons) skeleton.dispose();
      root.removeFromParent();
    },
  };
}

export type WildlifeActor = ReturnType<typeof createWildlifeActor>;
