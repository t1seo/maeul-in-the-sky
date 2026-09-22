import type { ModelPart } from '../../world/model/geometry-types.js';

export function fitNatureFruit(
  part: ModelPart,
  center: { readonly x: number; readonly z: number } = { x: 0, z: 0 },
): ModelPart {
  return {
    ...part,
    position: {
      ...part.position,
      x: center.x + (part.position.x - center.x) * 0.6,
      z: center.z + (part.position.z - center.z) * 0.6,
    },
    size: { x: part.size.x * 0.65, y: part.size.y * 0.65, z: part.size.z * 0.65 },
  };
}
