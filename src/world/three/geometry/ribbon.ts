import type { Vec3 } from '../../model/types.js';
import type { SurfaceBuffer } from './buffer.js';

type RibbonSection = { readonly left: Vec3; readonly right: Vec3 };

export function addRibbon(
  buffer: SurfaceBuffer,
  points: readonly Vec3[],
  width: number,
  elevation = 0,
  thickness = 0,
  offset = 0,
): void {
  const unique = points.filter((point, index) => {
    const previous = points[index - 1];
    return (
      !previous ||
      Math.hypot(point.x - previous.x, point.y - previous.y, point.z - previous.z) > 0.00001
    );
  });
  const sections: RibbonSection[] = unique.map((point, index) => {
    const before = unique[index - 1] ?? point;
    const after = unique[index + 1] ?? point;
    const length = Math.hypot(after.x - before.x, after.z - before.z);
    const x = length > 0 ? (after.z - before.z) / length : 1;
    const z = length > 0 ? -(after.x - before.x) / length : 0;
    const at = (distance: number): Vec3 => ({
      x: point.x + x * distance,
      y: point.y + elevation,
      z: point.z + z * distance,
    });
    return { left: at(offset - width / 2), right: at(offset + width / 2) };
  });
  const lower = (point: Vec3): Vec3 => ({ ...point, y: point.y - thickness });
  for (let index = 1; index < sections.length; index += 1) {
    const before = sections[index - 1];
    const after = sections[index];
    if (!before || !after) continue;
    buffer.quad(before.left, after.left, after.right, before.right);
    if (thickness <= 0) continue;
    buffer.quad(lower(before.left), lower(before.right), lower(after.right), lower(after.left));
    buffer.quad(before.left, lower(before.left), lower(after.left), after.left);
    buffer.quad(before.right, after.right, lower(after.right), lower(before.right));
    if (index === 1)
      buffer.quad(before.right, lower(before.right), lower(before.left), before.left);
    if (index === sections.length - 1)
      buffer.quad(after.left, lower(after.left), lower(after.right), after.right);
  }
}
