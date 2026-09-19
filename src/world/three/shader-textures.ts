import { Material, Texture, type Object3D, type WebGLRenderer } from 'three';

type Uniforms = Parameters<Material['onBeforeCompile']>[0]['uniforms'];
type TextureScope = {
  renderer: WebGLRenderer;
  uniforms: Set<Uniforms>;
};
const activeScopes = new Set<TextureScope>();

function texturesIn(scope: TextureScope): Set<Texture> {
  const textures = new Set<Texture>();
  for (const uniforms of scope.uniforms)
    for (const uniform of Object.values(uniforms))
      if (uniform.value instanceof Texture) textures.add(uniform.value);
  return textures;
}

export function observeShaderTextures(renderer: WebGLRenderer, root: Object3D) {
  const scope: TextureScope = { renderer, uniforms: new Set() };
  const owned = new Set<Texture>();
  const callbacks = new Map<
    Material,
    { compile: Material['onBeforeCompile']; cacheKey: Material['customProgramCacheKey'] }
  >();
  activeScopes.add(scope);
  root.traverse((object) => {
    if (!('material' in object)) return;
    for (const material of Array.isArray(object.material) ? object.material : [object.material]) {
      if (!(material instanceof Material) || callbacks.has(material)) continue;
      for (const value of Object.values(material)) if (value instanceof Texture) owned.add(value);
      const compile = material.onBeforeCompile;
      const cacheKey = material.customProgramCacheKey;
      const originalKey = material.customProgramCacheKey();
      callbacks.set(material, { compile, cacheKey });
      material.onBeforeCompile = (parameters, currentRenderer) => {
        compile.call(material, parameters, currentRenderer);
        scope.uniforms.add(parameters.uniforms);
      };
      material.customProgramCacheKey = () => originalKey;
    }
  });
  return {
    dispose() {
      if (!activeScopes.delete(scope)) return;
      for (const [material, original] of callbacks) {
        material.onBeforeCompile = original.compile;
        material.customProgramCacheKey = original.cacheKey;
      }
      for (const texture of texturesIn(scope)) {
        if (owned.has(texture)) continue;
        // Shared shader textures retain renderer listeners in r186 until their public disposal.
        texture.dispose();
        for (const other of activeScopes)
          if (texturesIn(other).has(texture) && !other.renderer.getContext().isContextLost())
            other.renderer.initTexture(texture);
      }
      callbacks.clear();
      scope.uniforms.clear();
      owned.clear();
    },
  };
}
