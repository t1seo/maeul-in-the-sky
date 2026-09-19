import {
  Color,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  SphereGeometry,
  type OrthographicCamera,
} from 'three';
import type { WorldView } from '../model/types.js';
import { SKY_COLORS } from './sky-background.js';

const LOBES = [
  [-0.95, -0.13, 0.48],
  [-0.5, 0.02, 0.7],
  [0.04, 0.25, 0.86],
  [0.6, 0.08, 0.64],
  [1, -0.12, 0.4],
  [-0.12, -0.2, 0.65],
] as const;
const BANKS = [
  [-0.92, -0.45, 0.18],
  [0.94, -0.26, 0.15],
  [-0.48, 0.63, 0.13],
  [0.68, 0.69, 0.1],
  [0.15, -1.05, 0.19],
] as const;

export function createClouds() {
  const geometry = new SphereGeometry(1, 18, 12);
  const material = new MeshStandardMaterial({
    color: '#ffffff',
    roughness: 1,
    emissive: '#bdccd1',
    emissiveIntensity: 0.22,
  });
  const mesh = new InstancedMesh(geometry, material, LOBES.length * BANKS.length);
  mesh.name = 'cloud-volumes';
  mesh.frustumCulled = false;
  const placement = new Object3D();
  const color = new Color();
  function update(view: WorldView, camera: OrthographicCamera, seconds: number) {
    material.emissiveIntensity = view.lighting === 'night' ? 0.025 : 0.22;
    let index = 0;
    for (const [bankX, bankY, bankScale] of BANKS) {
      const scale = (camera.top / camera.zoom) * bankScale;
      const drift = Math.sin(seconds * 0.018 + index) * 0.025;
      for (const [x, y, radius] of LOBES) {
        placement.position.set(
          (camera.right / camera.zoom) * (bankX + drift) + x * scale,
          (camera.top / camera.zoom) * bankY + y * scale,
          -camera.far * 0.68 + Math.cos(index * 1.7) * scale * 0.2,
        );
        placement.position.applyMatrix4(camera.matrixWorld);
        placement.quaternion.copy(camera.quaternion);
        placement.scale.set(scale * radius, scale * radius * 0.72, scale * radius * 0.85);
        placement.updateMatrix();
        mesh.setMatrixAt(index, placement.matrix);
        color.set(SKY_COLORS[view.lighting].cloud).multiplyScalar(y < 0 ? 0.96 : 1);
        mesh.setColorAt(index, color);
        index++;
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }
  return { mesh, update };
}
