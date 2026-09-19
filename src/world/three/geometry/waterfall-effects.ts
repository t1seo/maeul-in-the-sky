import {
  DoubleSide,
  DynamicDrawUsage,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Sphere,
  TetrahedronGeometry,
  Vector3,
} from 'three';
import type { BufferGeometry, Group } from 'three';
import type { GeometryResources } from './resources.js';
import { createWaterfallMist } from './waterfall-mist.js';
import { sampleWaterfall, waterfallBounds, type WaterfallPath } from './waterfall-path.js';

const STREAKS = 6;
const DROPLETS = 4;
const MIST = 3;

export function createWaterfallEffects(
  paths: readonly WaterfallPath[],
  content: Group,
  resources: GeometryResources,
): (seconds: number) => void {
  if (!paths.length) return () => {};
  const bounds = waterfallBounds(paths);
  const droplet = resources.geometry(new TetrahedronGeometry(Math.sqrt(3) / 2));
  function batch(
    name: string,
    geometry: BufferGeometry,
    material: MeshStandardMaterial,
    count: number,
  ) {
    const mesh = new InstancedMesh(geometry, resources.material(material), count * paths.length);
    mesh.name = `waterfalls:${name}`;
    mesh.instanceMatrix.setUsage(DynamicDrawUsage);
    mesh.boundingBox = bounds.clone();
    mesh.boundingSphere = bounds.getBoundingSphere(new Sphere());
    resources.instance(mesh);
    content.add(mesh);
    return mesh;
  }
  const streaks = batch(
    'streaks',
    droplet,
    new MeshStandardMaterial({
      color: '#edffff',
      roughness: 0.3,
      transparent: true,
      opacity: 0.84,
      depthWrite: false,
      emissive: '#b8ecf5',
      emissiveIntensity: 0.3,
    }),
    STREAKS,
  );
  const droplets = batch(
    'droplets',
    droplet,
    new MeshStandardMaterial({
      color: '#c4e9ed',
      roughness: 0.25,
      transparent: true,
      opacity: 0.58,
      depthWrite: false,
      emissive: '#9ddfea',
      emissiveIntensity: 0.2,
    }),
    DROPLETS,
  );
  const mistSurface = createWaterfallMist(resources);
  const mist = batch(
    'mist',
    mistSurface.geometry,
    new MeshStandardMaterial({
      map: mistSurface.texture,
      roughness: 1,
      transparent: true,
      opacity: 0.3,
      depthWrite: false,
      side: DoubleSide,
      emissive: '#c4e0e5',
      emissiveIntensity: 0.35,
    }),
    MIST,
  );
  streaks.renderOrder = 3;
  droplets.renderOrder = 3;
  mist.renderOrder = 4;
  const placement = new Object3D();
  const up = new Vector3(0, 1, 0);
  const tangent = new Vector3();
  let previousSeconds = -1;
  return (elapsedSeconds) => {
    const seconds = Math.max(0, elapsedSeconds);
    if (seconds === previousSeconds) return;
    previousSeconds = seconds;
    for (const [index, path] of paths.entries()) {
      const width = path.waterway.width;
      for (let slot = 0; slot < STREAKS; slot += 1) {
        const progress =
          (path.phase + slot / STREAKS + (seconds * (2.1 + slot * 0.12)) / path.length) % 1;
        const side = (((slot * 0.618 + path.phase) % 1) - 0.5) * width * 0.76;
        const point = sampleWaterfall(path, progress, side, 0.035);
        const before = sampleWaterfall(path, Math.max(0, progress - 0.01), side, 0.035);
        const after = sampleWaterfall(path, Math.min(1, progress + 0.01), side, 0.035);
        tangent.set(after.x - before.x, after.y - before.y, after.z - before.z).normalize();
        placement.position.set(point.x, point.y, point.z);
        placement.quaternion.setFromUnitVectors(up, tangent);
        const fade = Math.sin(progress * Math.PI) ** 0.45;
        const thickness = Math.min(0.14, Math.max(0.035, width * 0.14));
        placement.scale.set(
          thickness * fade,
          Math.min(path.length * 0.22, 0.6 + slot * 0.11) * fade,
          thickness * 0.65 * fade,
        );
        placement.updateMatrix();
        streaks.setMatrixAt(index * STREAKS + slot, placement.matrix);
      }
      placement.quaternion.identity();
      for (let slot = 0; slot < DROPLETS; slot += 1) {
        const progress = (path.phase + slot / DROPLETS + seconds * 0.65) % 1;
        const side = (((slot * 0.618 + path.phase) % 1) - 0.5) * width * (0.5 + progress * 0.5);
        const point = sampleWaterfall(path, 0.68 + progress * 0.32, side, 0.1 + progress * 0.3);
        const size = (0.05 + slot * 0.006) * Math.sin(progress * Math.PI);
        placement.position.set(point.x, point.y - progress * progress * 0.55, point.z);
        placement.scale.set(size, size * (3 + progress * 2), size);
        placement.updateMatrix();
        droplets.setMatrixAt(index * DROPLETS + slot, placement.matrix);
      }
      const [dx, dz] = path.direction;
      for (let slot = 0; slot < MIST; slot += 1) {
        const phase = seconds * 0.45 + path.phase * Math.PI * 2 + slot * 2;
        const side = (slot - 1) * width * 0.42 + Math.sin(phase) * 0.08;
        placement.position.set(
          path.end.x + dz * side + dx * 0.18,
          path.end.y - 0.12 + Math.sin(phase) * 0.14,
          path.end.z - dx * side + dz * 0.18,
        );
        placement.rotation.y = phase * 0.12;
        const size = Math.max(1, width) * (2.2 + Math.sin(phase) * 0.25);
        placement.scale.set(size, 0.8 + Math.cos(phase) * 0.15, size);
        placement.updateMatrix();
        mist.setMatrixAt(index * MIST + slot, placement.matrix);
      }
    }
    for (const mesh of [streaks, droplets, mist]) mesh.instanceMatrix.needsUpdate = true;
  };
}
