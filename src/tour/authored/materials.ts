import { Color, type MeshStandardMaterial } from 'three';
import type { WorldSeason } from '../../world/model/geometry-types.js';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import type { AuthoredPart } from './types.js';

const FOLIAGE = {
  spring: '#9cb77b',
  summer: null,
  autumn: '#c68b43',
  winter: '#d7e2de',
} as const satisfies Readonly<Record<WorldSeason, string | null>>;

export function createAuthoredMaterials(resources: GeometryResources) {
  const cache = new Map<string, MeshStandardMaterial>();
  resources.instance({ dispose: () => cache.clear() });
  return {
    material: (
      base: MeshStandardMaterial,
      part: AuthoredPart,
      season: WorldSeason,
    ): MeshStandardMaterial => {
      if (!part.foliageMaterials?.includes(base.name)) return base;
      const color = part.foliageColor ?? FOLIAGE[part.season ?? season];
      if (!color) return base;
      const key = `${base.uuid}:${color}`;
      const cached = cache.get(key);
      if (cached) return cached;
      const material = resources.material(base.clone());
      const tint = { value: new Color(color) };
      material.onBeforeCompile = (shader, renderer) => {
        base.onBeforeCompile(shader, renderer);
        shader.uniforms.authoredFoliageTint = tint;
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', '#include <common>\nuniform vec3 authoredFoliageTint;')
          .replace(
            '#include <color_fragment>',
            `#include <color_fragment>
          float authoredLeafLuminance = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          diffuseColor.rgb = authoredFoliageTint * (0.35 + 0.9 * sqrt(max(authoredLeafLuminance, 0.0)));
        `,
          );
      };
      const baseProgram = base.customProgramCacheKey();
      material.customProgramCacheKey = () => `${baseProgram}:authored-foliage-v1`;
      cache.set(key, material);
      return material;
    },
  };
}
