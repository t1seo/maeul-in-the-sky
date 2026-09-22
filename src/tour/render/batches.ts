import {
  Color,
  Group,
  InstancedMesh,
  type Matrix4,
  type BufferGeometry,
  type Material,
} from 'three';
import type { ModelPart, Vec3 } from '../../world/model/geometry-types.js';
import { createPrimitiveLibrary } from '../../world/three/geometry/primitives.js';
import { transform } from '../../world/three/geometry/placements.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { ForestWind } from './wind.js';
import { WIND_PROFILES, windMargin, type WindProfile } from './wind-profiles.js';

type Instance = { readonly matrix: Matrix4; readonly color: string; readonly id: string };
type Batch = {
  readonly geometry: BufferGeometry;
  readonly material: Material;
  readonly windProfile: WindProfile | 'none';
  readonly items: Instance[];
};

export function createBatches(resources: GeometryResources, wind?: ForestWind) {
  const library = createPrimitiveLibrary(resources);
  const drafts = new Map<string, Batch>();
  const identities = new Map<string, readonly string[]>();
  const glows = new Set<ReturnType<GeometryResources['standard']>>();
  return {
    add: (
      part: ModelPart,
      recipeKey: string,
      anchor: Vec3,
      scale: number,
      id: string,
      glow = false,
      profile: WindProfile | 'none' = 'none',
    ): void => {
      const base = resources.standard(glow ? 0.4 : 0.9, part.opacity, glow);
      const windProfile = wind ? profile : 'none';
      const material = wind && windProfile !== 'none' ? wind.material(base, windProfile) : base;
      if (glow) glows.add(material);
      const key = `${Math.floor(anchor.x / 40)}:${library.key(part, recipeKey)}:${part.opacity}:${glow}:${windProfile}`;
      const batch = drafts.get(key) ?? {
        geometry: library.geometry(part, recipeKey, false),
        material,
        windProfile,
        items: [],
      };
      const parent = transform(anchor, { x: 0, y: 0, z: 0 }, { x: scale, y: scale, z: scale });
      batch.items.push({
        matrix: parent.multiply(transform(part.position, part.rotation, part.size)),
        color: part.color,
        id,
      });
      drafts.set(key, batch);
    },
    finish: (): Group => {
      const group = new Group();
      for (const batch of drafts.values()) {
        const mesh = new InstancedMesh(batch.geometry, batch.material, batch.items.length);
        resources.instance(mesh);
        batch.items.forEach((item, index) => {
          mesh.setMatrixAt(index, item.matrix);
          mesh.setColorAt(index, new Color(item.color));
        });
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.computeBoundingSphere();
        if (wind && batch.windProfile !== 'none') {
          mesh.name = `Wind ${batch.windProfile}`;
          mesh.customDepthMaterial = wind.depth(batch.windProfile);
          const margin = windMargin(WIND_PROFILES[batch.windProfile]);
          if (mesh.boundingSphere) mesh.boundingSphere.radius += margin;
          mesh.computeBoundingBox();
          mesh.boundingBox?.expandByScalar(margin);
        }
        identities.set(
          mesh.uuid,
          batch.items.map((item) => item.id),
        );
        group.add(mesh);
      }
      return group;
    },
    identities,
    glows,
  };
}
