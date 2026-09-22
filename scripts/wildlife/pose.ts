import type { Animation, Document } from '@gltf-transform/core';
import { Quaternion } from 'three';
import { WildlifeAssetError } from './sources.js';

export function poseSnapshot(document: Document): () => void {
  const poses = document
    .getRoot()
    .listNodes()
    .map((node) => ({
      node,
      translation: node.getTranslation(),
      rotation: node.getRotation(),
      scale: node.getScale(),
    }));
  return () => {
    for (const pose of poses) {
      pose.node.setTranslation(pose.translation).setRotation(pose.rotation).setScale(pose.scale);
    }
  };
}

export function clipDuration(animation: Animation): number {
  return Math.max(
    ...animation.listSamplers().map((sampler) => {
      const input = sampler.getInput();
      return input ? input.getScalar(input.getCount() - 1) : 0;
    }),
  );
}

export function applyPose(animation: Animation, time: number): void {
  for (const channel of animation.listChannels()) {
    const node = channel.getTargetNode();
    const sampler = channel.getSampler();
    const input = sampler?.getInput();
    const output = sampler?.getOutput();
    if (!node || !sampler || !input || !output) {
      throw new WildlifeAssetError(animation.getName(), 'Incomplete animation channel');
    }
    if (sampler.getInterpolation() === 'CUBICSPLINE') {
      throw new WildlifeAssetError(animation.getName(), 'Unexpected cubic interpolation');
    }
    let right = 0;
    while (right < input.getCount() - 1 && input.getScalar(right) < time) right += 1;
    const left = Math.max(0, right - 1);
    const start = input.getScalar(left);
    const span = input.getScalar(right) - start;
    const alpha =
      span > 0 && sampler.getInterpolation() !== 'STEP'
        ? Math.max(0, Math.min(1, (time - start) / span))
        : 0;
    const a = output.getElement(left, []);
    const b = output.getElement(right, []);
    switch (channel.getTargetPath()) {
      case 'rotation': {
        const rotation = new Quaternion().fromArray(a).slerp(new Quaternion().fromArray(b), alpha);
        node.setRotation([rotation.x, rotation.y, rotation.z, rotation.w]);
        break;
      }
      case 'translation':
        node.setTranslation([
          a[0] + (b[0] - a[0]) * alpha,
          a[1] + (b[1] - a[1]) * alpha,
          a[2] + (b[2] - a[2]) * alpha,
        ]);
        break;
      case 'scale':
        node.setScale([
          a[0] + (b[0] - a[0]) * alpha,
          a[1] + (b[1] - a[1]) * alpha,
          a[2] + (b[2] - a[2]) * alpha,
        ]);
        break;
      default:
        throw new WildlifeAssetError(animation.getName(), 'Unexpected animation target');
    }
  }
}
