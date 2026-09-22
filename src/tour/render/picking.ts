import { Raycaster, Vector2, type Object3D, type PerspectiveCamera } from 'three';
import type { TourModel } from '../types.js';
import type { populateVillage } from './populate.js';

export function createTourPicker(
  camera: PerspectiveCamera,
  canvas: HTMLCanvasElement,
  model: TourModel,
  village: ReturnType<typeof populateVillage>,
  surfaces: readonly Object3D[],
) {
  const ray = new Raycaster();
  const hitAt = (clientX: number, clientY: number) => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    if (
      !Number.isFinite(clientX) ||
      !Number.isFinite(clientY) ||
      clientX < rect.left ||
      clientX > rect.right ||
      clientY < rect.top ||
      clientY > rect.bottom
    )
      return null;
    camera.updateMatrixWorld();
    ray.setFromCamera(
      new Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        (-(clientY - rect.top) / rect.height) * 2 + 1,
      ),
      camera,
    );
    return ray.intersectObjects([village.root, ...surfaces], true)[0] ?? null;
  };
  return {
    groundPoint: (clientX: number, clientY: number) => {
      const hit = hitAt(clientX, clientY);
      return hit && hit.point.y >= -0.2 ? { x: hit.point.x, z: hit.point.z } : null;
    },
    cell: (clientX: number, clientY: number) => {
      const hit = hitAt(clientX, clientY);
      if (!hit) return null;
      const id =
        hit.instanceId === undefined
          ? undefined
          : village.identities.get(hit.object.uuid)?.[hit.instanceId];
      const placement = model.placements.find((candidate) => candidate.source.id === id);
      const cell = placement
        ? model.cells.find((candidate) => candidate.source.date === placement.source.anchorDate)
        : model.cells.find(
            (candidate) =>
              candidate.source.week === Math.floor((hit.point.x + 2) / 4) &&
              candidate.source.day === Math.floor((hit.point.z + 2) / 4),
          );
      return cell?.source ?? null;
    },
  };
}
