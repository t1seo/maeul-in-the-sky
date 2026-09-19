import { InstancedMesh } from 'three';
import type { BufferGeometry, Group, Intersection, MeshStandardMaterial } from 'three';
import type { WorldFrame, WorldScene, WorldView } from '../../model/types.js';
import { detailPolicy } from './detail-policy.js';
import { recipeColor, regionSeasons, regionWeather } from './palette.js';
import { recipePlacements, transform } from './placements.js';
import type { PartPlacement } from './placements.js';
import { createPrimitiveLibrary } from './primitives.js';
import type { GeometryResources } from './resources.js';
import { seasonalGeometry, showDetail } from './seasonal.js';

type Batch = {
  readonly mesh: InstancedMesh<BufferGeometry, MeshStandardMaterial>;
  readonly placements: readonly PartPlacement[];
  readonly actor: boolean;
  readonly ids: string[];
  readonly glow: boolean;
  readonly overview: boolean;
};

export function createRecipeInstances(
  scene: WorldScene,
  content: Group,
  resources: GeometryResources,
): {
  readonly update: (frame: WorldFrame, view: WorldView) => void;
  readonly identify: (hit: Intersection) => string | undefined;
} {
  const library = createPrimitiveLibrary(resources);
  const seasonFor = regionSeasons(scene);
  const weatherFor = regionWeather(scene);
  const drafts = recipePlacements(scene, library.key);
  const batches = new Map<InstancedMesh, Batch>();
  const span = Math.max(
    scene.bounds.max.x - scene.bounds.min.x,
    scene.bounds.max.z - scene.bounds.min.z,
  );
  for (const [key, draft] of drafts) {
    for (const overview of span <= 18 ? [false] : [false, true]) {
      const geometry = draft.detail
        ? resources.geometry(seasonalGeometry(draft.detail, draft.part, draft.recipeKey, overview))
        : library.geometry(draft.part, draft.recipeKey, overview);
      const mesh = new InstancedMesh(
        geometry,
        resources.standard(draft.part.roughness, draft.part.opacity, draft.glow),
        draft.placements.length,
      );
      mesh.name = `models:${key}:${overview ? 'overview' : 'detail'}`;
      mesh.count = 0;
      mesh.visible = false;
      mesh.castShadow = draft.part.opacity === 1;
      mesh.receiveShadow = true;
      resources.instance(mesh);
      content.add(mesh);
      batches.set(mesh, {
        mesh,
        placements: draft.placements,
        actor: draft.actor,
        ids: [],
        glow: draft.glow,
        overview,
      });
    }
  }
  let previousStatic = '';
  return {
    update: (frame, view) => {
      const visible = new Set(
        frame.entities
          .filter((entity) => entity.visibleFrom <= frame.cursorDate)
          .map((entity) => entity.id),
      );
      const actors = new Map(
        frame.actors
          .filter((actor) => actor.visibleFrom <= frame.cursorDate)
          .map((actor) => [actor.id, actor]),
      );
      const policy = detailPolicy(scene, view);
      const signature = `${view.seasonOverride}:${view.cursorDate}:${view.weather}:${policy.signature}:${[...visible].join('|')}`;
      const detailById = new Map<string, boolean>();
      for (const batch of batches.values()) {
        if (batch.glow)
          batch.mesh.material.emissiveIntensity =
            view.lighting === 'night' ? 0.65 : view.lighting === 'sunset' ? 0.2 : 0;
        if (!batch.actor && signature === previousStatic) continue;
        batch.ids.length = 0;
        for (const placement of batch.placements) {
          const actor = actors.get(placement.id);
          if (batch.actor ? !actor : !visible.has(placement.id)) continue;
          const full =
            detailById.get(placement.id) ??
            policy.full(placement.id, placement.regionId, actor?.position ?? placement.position);
          detailById.set(placement.id, full);
          if (
            full === batch.overview ||
            (batch.overview && !placement.essential && placement.size < policy.minimum)
          )
            continue;
          const season = seasonFor(placement.regionId, view);
          const weather = weatherFor(placement.regionId, view);
          if (!showDetail(placement.detail, season, weather)) continue;
          const index = batch.ids.length;
          const matrix = actor
            ? transform(
                actor.position,
                { x: 0, y: actor.yaw, z: 0 },
                { x: 1, y: 1, z: 1 },
              ).multiply(placement.matrix)
            : placement.matrix;
          batch.mesh.setMatrixAt(index, matrix);
          batch.mesh.setColorAt(
            index,
            recipeColor(placement.color, placement.seasonal, season, weather),
          );
          batch.ids.push(placement.id);
        }
        batch.mesh.count = batch.ids.length;
        batch.mesh.visible = batch.mesh.count > 0;
        batch.mesh.userData = { instanceIds: [...batch.ids] };
        batch.mesh.instanceMatrix.needsUpdate = true;
        if (batch.mesh.instanceColor) batch.mesh.instanceColor.needsUpdate = true;
        batch.mesh.computeBoundingBox();
        batch.mesh.computeBoundingSphere();
      }
      previousStatic = signature;
    },
    identify: (hit) => {
      if (!(hit.object instanceof InstancedMesh) || hit.instanceId === undefined) return undefined;
      const batch = batches.get(hit.object);
      return batch?.mesh.visible ? batch.ids[hit.instanceId] : undefined;
    },
  };
}
