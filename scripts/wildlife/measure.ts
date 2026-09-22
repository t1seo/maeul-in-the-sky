import type { Document, Node } from '@gltf-transform/core';
import { Box3, Matrix4, Vector3 } from 'three';
import { retainWildlifeClip } from './optimize.js';
import { applyPose, clipDuration, poseSnapshot } from './pose.js';
import { WildlifeAssetError } from './sources.js';

function skinMatrices(node: Node): Matrix4[] | null {
  const skin = node.getSkin();
  if (!skin) return null;
  const inverseBind = skin.getInverseBindMatrices();
  return skin.listJoints().map((joint, index) => {
    const matrix = new Matrix4().fromArray(joint.getWorldMatrix());
    return inverseBind
      ? matrix.multiply(new Matrix4().fromArray(inverseBind.getElement(index, [])))
      : matrix;
  });
}

function poseBounds(document: Document): Box3 {
  const bounds = new Box3();
  for (const node of document.getRoot().listNodes()) {
    const mesh = node.getMesh();
    if (!mesh) continue;
    const world = new Matrix4().fromArray(node.getWorldMatrix());
    const matrices = skinMatrices(node);
    for (const primitive of mesh.listPrimitives()) {
      const positions = primitive.getAttribute('POSITION');
      const joints = primitive.getAttribute('JOINTS_0');
      const weights = primitive.getAttribute('WEIGHTS_0');
      if (!positions || (matrices && (!joints || !weights))) {
        throw new WildlifeAssetError(mesh.getName(), 'Missing geometry or skin attributes');
      }
      for (let vertex = 0; vertex < positions.getCount(); vertex += 1) {
        const original = new Vector3().fromArray(positions.getElement(vertex, []));
        const position = original.clone().applyMatrix4(world);
        if (matrices && joints && weights) {
          position.set(0, 0, 0);
          const joint = joints.getElement(vertex, []);
          const weight = weights.getElement(vertex, []);
          for (let influence = 0; influence < 4; influence += 1) {
            if (!weight[influence]) continue;
            const matrix = matrices[joint[influence]];
            if (!matrix) throw new WildlifeAssetError(mesh.getName(), 'Invalid skin joint');
            position.addScaledVector(original.clone().applyMatrix4(matrix), weight[influence]);
          }
        }
        bounds.expandByPoint(position);
      }
    }
  }
  if (bounds.isEmpty()) throw new WildlifeAssetError('geometry', 'Empty measured bounds');
  return bounds;
}

function serializeBounds(bounds: Box3) {
  const rounded = (point: Vector3) => point.toArray().map((value) => Number(value.toFixed(6)));
  return {
    min: rounded(bounds.min),
    max: rounded(bounds.max),
    size: rounded(bounds.getSize(new Vector3())),
  };
}

export function measureWildlife(document: Document, id: string) {
  const root = document.getRoot();
  const reset = poseSnapshot(document);
  const bindBounds = serializeBounds(poseBounds(document));
  const animations = root
    .listAnimations()
    .filter((animation) => retainWildlifeClip(id, animation.getName()));
  const animatedBounds = animations.map((animation) => {
    const duration = clipDuration(animation);
    const bounds = new Box3();
    const feet: number[] = [];
    for (let sample = 0; sample < 17; sample += 1) {
      reset();
      applyPose(animation, (duration * sample) / 16);
      const pose = poseBounds(document);
      bounds.union(pose);
      feet.push(pose.min.y);
    }
    return {
      clip: animation.getName(),
      samples: 17,
      ...serializeBounds(bounds),
      minFootY: Number(Math.min(...feet).toFixed(6)),
      maxFootY: Number(Math.max(...feet).toFixed(6)),
    };
  });
  reset();
  return { bindBounds, animatedBounds };
}

export function assertPreservedBounds(
  id: string,
  original: ReturnType<typeof measureWildlife>,
  optimized: ReturnType<typeof measureWildlife>,
): void {
  const values = (measurement: ReturnType<typeof measureWildlife>) => [
    ...measurement.bindBounds.min,
    ...measurement.bindBounds.max,
    ...measurement.animatedBounds.flatMap((bounds) => [
      ...bounds.min,
      ...bounds.max,
      bounds.minFootY,
      bounds.maxFootY,
    ]),
  ];
  const before = values(original);
  const after = values(optimized);
  if (
    before.length !== after.length ||
    before.some((value, index) => Math.abs(value - after[index]) > 0.0001)
  ) {
    throw new WildlifeAssetError(
      id,
      'Optimization changed the authored bind or animated silhouette',
    );
  }
}
