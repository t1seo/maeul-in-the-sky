import {
  Group,
  InstancedMesh,
  type Matrix4,
  type BufferGeometry,
  type MeshStandardMaterial,
} from 'three';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { TourPlacement } from '../types.js';
import type { ForestWind } from '../render/wind.js';
import type { AuthoredSource } from './transforms.js';
import { authoredMatrix } from './transforms.js';
import type { AuthoredPart } from './types.js';
import { createAuthoredMaterials } from './materials.js';
import { WIND_PROFILES, windMargin, type WindProfile } from '../render/wind-profiles.js';

type Instance = { readonly matrix: Matrix4; readonly id: string };
type Batch = {
  readonly geometry: BufferGeometry;
  readonly material: MeshStandardMaterial;
  readonly profile: WindProfile | null;
  readonly name: string;
  readonly instances: Instance[];
};

export function createAuthoredBatches(resources: GeometryResources, wind?: ForestWind) {
  const root = new Group();
  const identities = new Map<string, readonly string[]>();
  const drafts = new Map<string, Batch>();
  const materials = createAuthoredMaterials(resources);
  const meshes: InstancedMesh[] = [];
  let instances = 0;
  let disposed = false;
  return {
    root,
    identities,
    add: (source: AuthoredSource, part: AuthoredPart, placement: TourPlacement): void => {
      const transform = authoredMatrix(source, part, placement);
      for (const mesh of source.meshes) {
        const base = materials.material(mesh.material, part, placement.season);
        const profile = wind ? (part.wind ?? null) : null;
        const material = wind && profile ? wind.material(base, profile) : base;
        const key = `${Math.floor(placement.position.x / 40)}:${mesh.geometry.uuid}:${material.uuid}:${profile}`;
        const batch = drafts.get(key) ?? {
          geometry: mesh.geometry,
          material,
          profile,
          name: part.node ?? part.file,
          instances: [],
        };
        batch.instances.push({
          matrix: transform.clone().multiply(mesh.matrix),
          id: placement.source.id,
        });
        drafts.set(key, batch);
        instances++;
      }
    },
    finish: (): void => {
      for (const batch of drafts.values()) {
        const mesh = new InstancedMesh(batch.geometry, batch.material, batch.instances.length);
        mesh.name = `Authored ${batch.name}`;
        batch.instances.forEach((instance, index) => mesh.setMatrixAt(index, instance.matrix));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.computeBoundingBox();
        mesh.computeBoundingSphere();
        if (wind && batch.profile) {
          mesh.customDepthMaterial = wind.depth(batch.profile, batch.material);
          const margin = windMargin(WIND_PROFILES[batch.profile]);
          mesh.boundingBox?.expandByScalar(margin);
          if (mesh.boundingSphere) mesh.boundingSphere.radius += margin;
        }
        identities.set(
          mesh.uuid,
          batch.instances.map((instance) => instance.id),
        );
        meshes.push(mesh);
        root.add(mesh);
      }
      drafts.clear();
    },
    inspect: () => ({ instances, drawables: meshes.length }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      for (const mesh of meshes) mesh.dispose();
      meshes.length = 0;
      drafts.clear();
      identities.clear();
      root.clear();
    },
  };
}
