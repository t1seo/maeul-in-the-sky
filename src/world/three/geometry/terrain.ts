import { Float32BufferAttribute, Mesh, MeshStandardMaterial, Vector2 } from 'three';
import type { Group, Intersection } from 'three';
import type { WorldFrame, WorldScene, WorldView } from '../../model/types.js';
import { SurfaceBuffer } from './buffer.js';
import { createCliffs } from './cliffs.js';
import type { GeometryResources } from './resources.js';
import { atlasUV, createGroundTextures, surfaceCells } from './surface-textures.js';
import { terrainPatches } from './terrain-grid.js';
import { createTerrainShading, smoothTerrainNormals } from './terrain-shading.js';

export function createTerrain(
  scene: WorldScene,
  content: Group,
  resources: GeometryResources,
): {
  readonly update: (frame: WorldFrame, view: WorldView) => void;
  readonly identify: (hit: Intersection) => string | undefined;
} {
  let patches = terrainPatches(
    scene.terrain.tiles.map((tile) => ({ ...tile, activityHeight: 0 })),
    scene.terrain.waterLevel,
  );
  const surface = new SurfaceBuffer();
  for (const patch of patches) {
    const [a, b, c, d] = patch.corners;
    for (const [from, to] of [
      [a, b],
      [b, c],
      [c, d],
      [d, a],
    ])
      surface.triangle(patch.center, from, to);
  }
  const surfaceGeometry = resources.geometry(surface.build());
  const shade = createTerrainShading(scene, surfaceGeometry);
  const textures = createGroundTextures(resources);
  const material = resources.material(
    new MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.96,
      ...textures,
      normalScale: new Vector2(0.22, 0.22),
    }),
  );
  const ground = new Mesh(surfaceGeometry, material);
  ground.name = 'terrain:surface';
  ground.receiveShadow = true;
  ground.castShadow = true;
  const cliffGeometry = resources.geometry(createCliffs(scene, patches).build());
  const cliffUV = new Float32BufferAttribute(
    new Float32Array(cliffGeometry.getAttribute('position').count * 2),
    2,
  );
  const corners = [
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 1],
    [1, 0],
    [0, 0],
  ] as const;
  for (let index = 0; index < cliffUV.count; index += 1) {
    const corner = corners[index % 6];
    if (corner) cliffUV.setXY(index, ...atlasUV(surfaceCells.rock, corner[0], corner[1]));
  }
  cliffGeometry.setAttribute('uv', cliffUV);
  const cliffs = new Mesh(
    cliffGeometry,
    resources.material(
      new MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.98,
        ...textures,
        normalScale: new Vector2(0.35, 0.35),
      }),
    ),
  );
  cliffs.name = 'terrain:cliffs';
  cliffs.castShadow = true;
  cliffs.receiveShadow = true;
  content.add(ground, cliffs);
  let visibleDays = new Map<string, string>();
  let previousPalette = '';
  let previousHeight = '';
  return {
    update: (frame, view) => {
      visibleDays = new Map(
        frame.days.filter((day) => day.date <= frame.cursorDate).map((day) => [day.tileId, day.id]),
      );
      const heightSignature = `${frame.cursorDate}:${[...visibleDays.keys()].join('|')}`;
      if (heightSignature !== previousHeight) {
        patches = terrainPatches(
          frame.terrain.tiles.map((tile) =>
            tile.source === 'day' && !visibleDays.has(tile.id)
              ? { ...tile, activityHeight: 0 }
              : tile,
          ),
          frame.terrain.waterLevel,
        );
        const nextSurface = new SurfaceBuffer();
        for (const patch of patches) {
          const [a, b, c, d] = patch.corners;
          for (const [from, to] of [
            [a, b],
            [b, c],
            [c, d],
            [d, a],
          ])
            nextSurface.triangle(patch.center, from, to);
        }
        for (const [geometry, positions] of [
          [surfaceGeometry, nextSurface.positions],
          [cliffs.geometry, createCliffs(scene, patches).positions],
        ] as const) {
          const attribute = geometry.getAttribute('position');
          attribute.array.set(positions);
          attribute.needsUpdate = true;
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
        }
        smoothTerrainNormals(surfaceGeometry);
        previousHeight = heightSignature;
      }
      const signature = `${view.seasonOverride}:${view.cursorDate}:${view.weather}`;
      if (signature === previousPalette) return;
      shade(patches, view);
      previousPalette = signature;
    },
    identify: (hit) => {
      if (hit.object !== ground || hit.faceIndex === undefined || hit.faceIndex === null)
        return undefined;
      const patch = patches[Math.floor(hit.faceIndex / 4)];
      return patch?.tile.source === 'day' ? visibleDays.get(patch.tile.id) : undefined;
    },
  };
}
