import {
  BoxGeometry,
  ConeGeometry,
  CylinderGeometry,
  OctahedronGeometry,
  SphereGeometry,
} from 'three';
import type { BufferGeometry } from 'three';
import type { ModelPart } from '../../model/types.js';
import { createRoof, roofProfile } from './roof.js';
import type { GeometryResources } from './resources.js';

export function createPrimitiveGeometry(
  primitive: ModelPart['primitive'],
  key: string,
  overview = false,
): BufferGeometry {
  switch (primitive) {
    case 'box':
      return new BoxGeometry(1, 1, 1);
    case 'cylinder':
      return new CylinderGeometry(0.5, 0.5, 1, overview ? 4 : 8);
    case 'cone':
      return new ConeGeometry(0.5, 1, overview ? 4 : 8);
    case 'sphere':
      return overview ? new OctahedronGeometry(0.5) : new SphereGeometry(0.5, 8, 6);
    case 'roof':
      return createRoof(roofProfile(key));
    default: {
      const exhaustive: never = primitive;
      return exhaustive;
    }
  }
}

export function createPrimitiveLibrary(resources: GeometryResources): {
  readonly key: (part: ModelPart, recipeKey: string) => string;
  readonly geometry: (part: ModelPart, recipeKey: string, overview: boolean) => BufferGeometry;
} {
  const cache = new Map<string, BufferGeometry>();
  const key = (part: ModelPart, recipeKey: string): string =>
    part.primitive === 'roof' ? `roof:${roofProfile(recipeKey)}` : part.primitive;
  return {
    key,
    geometry: (part, recipeKey, overview) => {
      const id = `${key(part, recipeKey)}:${overview}`;
      const cached = cache.get(id);
      if (cached) return cached;
      const geometry = resources.geometry(
        createPrimitiveGeometry(part.primitive, recipeKey, overview),
      );
      geometry.computeBoundingBox();
      geometry.computeBoundingSphere();
      cache.set(id, geometry);
      return geometry;
    },
  };
}
