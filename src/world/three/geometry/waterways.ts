import { DoubleSide, Mesh, MeshStandardMaterial, Vector2 } from 'three';
import type { BufferGeometry, Group } from 'three';
import type { Vec3, WorldScene, WorldView } from '../../model/types.js';
import type { GeometryResources } from './resources.js';
import { addBasins } from './water-basins.js';
import { WaterBuffer } from './water-buffer.js';
import { addPond, addStream } from './water-shapes.js';
import { createWaterTextures } from './water-textures.js';
import { createWaterfallEffects } from './waterfall-effects.js';
import { createWaterfallFrost } from './waterfall-frost.js';
import { waterfallDirection, waterfallPath, type WaterfallSurface } from './waterfall-path.js';

function prepareOverlay(geometry: BufferGeometry, distance: number): BufferGeometry {
  geometry.deleteAttribute('color');
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  for (let index = 0; index < position.count; index += 1)
    position.setXYZ(
      index,
      position.getX(index) + normal.getX(index) * distance,
      position.getY(index) + normal.getY(index) * distance,
      position.getZ(index) + normal.getZ(index) * distance,
    );
  position.needsUpdate = true;
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createWaterways(
  scene: WorldScene,
  content: Group,
  resources: GeometryResources,
): (view: WorldView) => void {
  const water = new WaterBuffer();
  const foam = new WaterBuffer();
  const waterfalls: WaterfallSurface[] = [];
  addBasins(water, foam, scene);
  for (const waterway of scene.terrain.waterways) {
    switch (waterway.kind) {
      case 'river':
        addStream(water, waterway.points, waterway.width, 0.035);
        for (const side of [-1, 1])
          addStream(foam, waterway.points, 0.045, 0.043, side * waterway.width * 0.47, [-0.5, 0.5]);
        break;
      case 'pond':
        addPond(water, waterway);
        addStream(foam, waterway.points, 0.045, 0.063, 0, [-0.5, 0.5]);
        break;
      case 'waterfall': {
        const direction = waterfallDirection(scene, waterway);
        const path = waterfallPath(scene, waterway, direction);
        const spread = (point: Vec3) =>
          path
            ? 1 +
              0.55 *
                Math.min(1, Math.max(0, (path.mouth.y - point.y) / (path.mouth.y - path.end.y)))
            : 1;
        const firstVertex = water.surface.positions.length / 3;
        addStream(water, waterway.points, waterway.width, 0, 0, undefined, direction, spread);
        if (path)
          waterfalls.push({
            path,
            firstVertex,
            vertexCount: water.surface.positions.length / 3 - firstVertex,
          });
        for (const side of [-0.32, -0.1, 0.16, 0.36])
          addStream(
            foam,
            waterway.points,
            waterway.width * 0.12,
            0.003,
            side * waterway.width,
            [-0.5, 0.5],
            direction,
            spread,
          );
        break;
      }
      default: {
        const exhaustive: never = waterway.kind;
        return exhaustive;
      }
    }
  }
  if (!water.surface.positions.length) return () => {};
  const textures = createWaterTextures(resources);
  const geometry = resources.geometry(water.build());
  const animateFalls = createWaterfallEffects(
    waterfalls.map((surface) => surface.path),
    content,
    resources,
  );
  const frost = createWaterfallFrost(scene, waterfalls, geometry, content, resources);
  const mesh = new Mesh(
    geometry,
    resources.material(
      new MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.48,
        metalness: 0,
        side: DoubleSide,
        normalMap: textures.normal,
        normalScale: new Vector2(0.28, 0.28),
      }),
    ),
  );
  mesh.name = 'waterways';
  mesh.receiveShadow = true;
  const current = new Mesh(
    resources.geometry(prepareOverlay(geometry.clone(), 0.006)),
    resources.material(
      new MeshStandardMaterial({
        map: textures.current,
        roughness: 0.62,
        transparent: true,
        opacity: 0.72,
        side: DoubleSide,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      }),
    ),
  );
  current.name = 'waterways:current';
  current.renderOrder = 1;
  content.add(mesh, current);
  if (foam.surface.positions.length) {
    const shore = new Mesh(
      resources.geometry(prepareOverlay(foam.build(), 0.004)),
      resources.material(
        new MeshStandardMaterial({
          map: textures.shore,
          roughness: 0.8,
          transparent: true,
          opacity: 0.45,
          side: DoubleSide,
          depthWrite: false,
          polygonOffset: true,
          polygonOffsetFactor: -2,
          polygonOffsetUnits: -2,
        }),
      ),
    );
    shore.name = 'waterways:foam';
    shore.renderOrder = 2;
    content.add(shore);
  }
  return (view) => {
    textures.current.offset.y = -((view.elapsedSeconds * 0.045) % 1);
    textures.shore.offset.y = -((view.elapsedSeconds * 0.072) % 1);
    textures.normal.offset.y = -((view.elapsedSeconds * 0.025) % 1);
    animateFalls(view.elapsedSeconds);
    frost(view);
  };
}
