import { Color, ConeGeometry, InstancedMesh, MeshStandardMaterial, Object3D } from 'three';
import type { BufferGeometry, Group } from 'three';
import type { WorldScene, WorldView } from '../../model/types.js';
import { regionSeasons } from './palette.js';
import type { GeometryResources } from './resources.js';
import { sampleWaterfall, type WaterfallSurface } from './waterfall-path.js';

const ICE_OFFSETS = [-0.43, 0.28, 0.46] as const;

export function createWaterfallFrost(
  scene: WorldScene,
  surfaces: readonly WaterfallSurface[],
  geometry: BufferGeometry,
  content: Group,
  resources: GeometryResources,
): (view: WorldView) => void {
  if (!surfaces.length) return () => {};
  const seasonFor = regionSeasons(scene);
  const colors = geometry.getAttribute('color');
  const color = new Color();
  const flowing = new Color('#ace8f3');
  for (const surface of surfaces) {
    for (
      let index = surface.firstVertex;
      index < surface.firstVertex + surface.vertexCount;
      index += 1
    ) {
      color.fromBufferAttribute(colors, index).lerp(flowing, 0.78);
      colors.setXYZ(index, color.r, color.g, color.b);
    }
  }
  const original = new Float32Array(colors.array);
  const tint = new Color('#e2f3f5');
  const frost = new InstancedMesh(
    resources.geometry(new ConeGeometry(0.5, 1, 3)),
    resources.material(
      new MeshStandardMaterial({
        color: '#ddf1f1',
        roughness: 0.22,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
      }),
    ),
    surfaces.length * ICE_OFFSETS.length,
  );
  frost.name = 'waterfalls:frost';
  frost.renderOrder = 3;
  resources.instance(frost);
  content.add(frost);
  const placement = new Object3D();
  placement.rotation.x = Math.PI;
  let previousSignature = '';
  return (view) => {
    const signature = `${view.seasonOverride}:${view.cursorDate.slice(0, 7)}`;
    if (signature === previousSignature) return;
    previousSignature = signature;
    frost.count = 0;
    for (const surface of surfaces) {
      const winter = seasonFor(surface.path.regionId, view) === 'winter';
      for (
        let index = surface.firstVertex;
        index < surface.firstVertex + surface.vertexCount;
        index += 1
      ) {
        color.fromArray(original, index * 3);
        if (winter) color.lerp(tint, 0.62);
        colors.setXYZ(index, color.r, color.g, color.b);
      }
      if (!winter) continue;
      for (const [slot, side] of ICE_OFFSETS.entries()) {
        const path = surface.path;
        const point = sampleWaterfall(path, 0, side * path.waterway.width, 0.045);
        const height = Math.min((path.mouth.y - path.end.y) * 0.28, 0.22 + slot * 0.12);
        placement.position.set(point.x, point.y - height / 2, point.z);
        placement.scale.set(Math.min(0.12, path.waterway.width * 0.12), height, 0.07);
        placement.updateMatrix();
        frost.setMatrixAt(frost.count, placement.matrix);
        frost.count += 1;
      }
    }
    colors.needsUpdate = true;
    frost.visible = frost.count > 0;
    frost.instanceMatrix.needsUpdate = true;
    frost.computeBoundingBox();
    frost.computeBoundingSphere();
  };
}
