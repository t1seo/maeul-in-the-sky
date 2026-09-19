import { expect, it, vi } from 'vitest';
import {
  Texture,
  WebGLRenderer,
  PCFShadowMap,
  Scene,
  Mesh,
  BoxGeometry,
  MeshStandardMaterial,
  PerspectiveCamera,
} from 'three';
import { createThreeController } from '../../../src/world/three/controller.js';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { browserFrames, openThree } from '../three/browser-harness.js';
import { observeShaderTextures } from '../../../src/world/three/shader-textures.js';

function observeLightingListeners() {
  const listeners = new Set<unknown>();
  const add = Texture.prototype.addEventListener;
  const remove = Texture.prototype.removeEventListener;
  vi.spyOn(Texture.prototype, 'addEventListener').mockImplementation(function (
    this: Texture,
    type,
    listener,
  ) {
    if (this.name === 'DFG_LUT') listeners.add(listener);
    add.call(this, type, listener);
  });
  vi.spyOn(Texture.prototype, 'removeEventListener').mockImplementation(function (
    this: Texture,
    type,
    listener,
  ) {
    if (this.name === 'DFG_LUT') listeners.delete(listener);
    remove.call(this, type, listener);
  });
  return listeners;
}

it('releases ten native contexts without retaining shared lighting-table listeners', async () => {
  const listeners = observeLightingListeners();
  const counts: number[] = [];
  for (let index = 0; index < 10; index++) {
    const { port, canvas } = await openThree();
    const context = canvas.getContext('webgl2');
    port.dispose();
    await browserFrames(1);
    expect(context?.isContextLost()).toBe(true);
    expect(canvas.dataset.geometries).toBe('0');
    counts.push(listeners.size);
    expect(listeners.size).toBe(0);
  }
  console.info('THREE_DFG_LISTENER_MEASUREMENT', JSON.stringify(counts));
}, 60_000);

it('keeps a simultaneously mounted replacement identical after the old renderer is released', async () => {
  const listeners = observeLightingListeners();
  const original = await openThree();
  const replacement = await openThree();
  const photo = { format: 'png', width: 320, height: 200 } as const;
  const before = new Uint8Array(await (await replacement.port.capture(photo)).arrayBuffer());
  expect(listeners.size).toBe(2);
  original.port.dispose();
  expect(listeners.size).toBe(1);
  expect(replacement.canvas.getContext('webgl2')?.isContextLost()).toBe(false);
  const after = new Uint8Array(await (await replacement.port.capture(photo)).arrayBuffer());
  expect(after).toEqual(before);
  replacement.port.dispose();
  expect(listeners.size).toBe(0);
});

it('preserves existing shader hooks and cache keys while excluding material-owned textures', () => {
  const renderer = new WebGLRenderer();
  const texture = new Texture();
  const shaderTexture = new Texture();
  const material = new MeshStandardMaterial({ map: texture });
  const original = vi.fn<NonNullable<typeof material.onBeforeCompile>>((parameters) => {
    parameters.uniforms.probe = { value: shaderTexture };
  });
  material.onBeforeCompile = original;
  const cacheKey = material.customProgramCacheKey();
  const geometry = new BoxGeometry();
  const scene = new Scene().add(new Mesh(geometry, material));
  const tracker = observeShaderTextures(renderer, scene);
  const textureDispose = vi.spyOn(texture, 'dispose');
  const shaderDispose = vi.spyOn(shaderTexture, 'dispose');
  try {
    renderer.compile(scene, new PerspectiveCamera());
    expect(original).toHaveBeenCalled();
    expect(material.customProgramCacheKey()).toBe(cacheKey);
    tracker.dispose();
    tracker.dispose();
    expect(material.onBeforeCompile).toBe(original);
    expect(material.customProgramCacheKey()).toBe(cacheKey);
    expect(textureDispose).not.toHaveBeenCalled();
    expect(shaderDispose).toHaveBeenCalledExactlyOnceWith();
  } finally {
    tracker.dispose();
    texture.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }
});

it('releases shader textures and destroys the native GPU context', async () => {
  const host = document.createElement('div');
  host.style.cssText = 'width:400px;height:300px';
  document.body.append(host);
  const renderer = new WebGLRenderer();
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  host.append(renderer.domElement);
  const observed = new Set<Texture>();
  const add = Texture.prototype.addEventListener;
  vi.spyOn(Texture.prototype, 'addEventListener').mockImplementation(function (
    this: Texture,
    type,
    listener,
  ) {
    observed.add(this);
    add.call(this, type, listener);
  });
  const disposed = vi.spyOn(Texture.prototype, 'dispose');
  const controller = createThreeController(
    renderer,
    host,
    TINY_WORLD_SCENE,
    { ...defaultWorldView(TINY_WORLD_SCENE), motion: 'off' },
    {
      onSelect() {},
      onViewChange() {},
      onError(error) {
        throw error;
      },
    },
  );
  const context = renderer.getContext();
  try {
    await controller.prepare();
    controller.api.dispose();
    const released = new Set(disposed.mock.contexts.filter((value) => value instanceof Texture));
    const retained = [...observed].filter((texture) => !released.has(texture));
    console.info(
      'THREE_DISPOSAL_BASELINE',
      JSON.stringify({
        geometries: renderer.info.memory.geometries,
        textures: renderer.info.memory.textures,
        retained: retained.map((texture) => ({
          name: texture.name,
          type: texture.constructor.name,
        })),
      }),
    );
    expect(renderer.info.memory.geometries).toBe(0);
    expect(retained).toHaveLength(0);
    expect(renderer.info.memory.textures).toBe(0);
    await browserFrames();
    expect(context.isContextLost()).toBe(true);
  } finally {
    controller.api.dispose();
    host.remove();
  }
});
