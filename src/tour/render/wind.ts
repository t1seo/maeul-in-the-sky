import { DoubleSide, MeshDepthMaterial, RGBADepthPacking, Vector4 } from 'three';
import type { MeshStandardMaterial } from 'three';
import type { GeometryResources } from '../../world/three/geometry/resources.js';
import { WIND_PROFILES, type WindProfile } from './wind-profiles.js';
import { applyForestWindShader, type WindUniforms } from './wind-shader.js';

export function createForestWind(resources: GeometryResources) {
  const time = { value: 0 };
  const materials = new Map<string, MeshStandardMaterial>();
  const depths = new Map<WindProfile, MeshDepthMaterial>();
  const uniforms = new Map<WindProfile, WindUniforms>();
  resources.instance({
    dispose: (): void => {
      materials.clear();
      depths.clear();
      uniforms.clear();
    },
  });
  const forProfile = (profile: WindProfile): WindUniforms => {
    const cached = uniforms.get(profile);
    if (cached) return cached;
    const { strength, bend, flutter, height } = WIND_PROFILES[profile];
    const result = {
      forestTime: time,
      forestSettings: { value: new Vector4(strength, bend, flutter, height) },
    };
    uniforms.set(profile, result);
    return result;
  };
  return {
    get elapsed(): number {
      return time.value;
    },
    material: (base: MeshStandardMaterial, profile: WindProfile): MeshStandardMaterial => {
      const key = `${base.uuid}:${profile}`;
      const cached = materials.get(key);
      if (cached) return cached;
      const material = resources.material(base.clone());
      const baseProgram = base.customProgramCacheKey();
      material.onBeforeCompile = (shader, renderer) => {
        base.onBeforeCompile(shader, renderer);
        applyForestWindShader(shader, forProfile(profile));
      };
      material.customProgramCacheKey = () => `${baseProgram}:forest-wind-v1`;
      materials.set(key, material);
      return material;
    },
    depth: (profile: WindProfile): MeshDepthMaterial => {
      const cached = depths.get(profile);
      if (cached) return cached;
      const material = resources.material(
        new MeshDepthMaterial({ depthPacking: RGBADepthPacking, side: DoubleSide }),
      );
      material.onBeforeCompile = (shader) => applyForestWindShader(shader, forProfile(profile));
      material.customProgramCacheKey = () => 'forest-wind-depth-v1';
      depths.set(profile, material);
      return material;
    },
    update: (elapsed: number): void => {
      time.value = elapsed;
    },
  };
}

export type ForestWind = ReturnType<typeof createForestWind>;
