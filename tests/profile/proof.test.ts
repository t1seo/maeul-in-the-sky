import { describe, expect, it } from 'vitest';
import {
  assertPngBytes,
  parseThreeMetrics,
  assertSamePose,
  assertCanonicalWorld,
} from '../../scripts/profile/proof.js';
import { defaultWorldView } from '../../src/world/model/defaults.js';
import { TINY_WORLD_INPUT, TINY_WORLD_SCENE } from '../../src/world/model/fixture.js';
import { createWorldDocument } from '../../src/world/data/document.js';

const metrics = {
  renderer: 'three',
  webgl2: true,
  contextLost: false,
  calls: 80,
  triangles: 30000,
  geometries: 25,
  textures: 2,
  frames: 5,
  elapsed: 0,
  width: 1600,
  height: 1000,
  version: 'WebGL 2.0',
};

describe('real Three capture evidence', () => {
  it('rejects a map fallback, empty geometry, moving clock and wrong capture aspect', () => {
    expect(parseThreeMetrics(metrics)).toEqual(metrics);
    for (const patch of [
      { renderer: 'map' },
      { webgl2: false },
      { contextLost: true },
      { triangles: 0 },
      { calls: 0 },
      { elapsed: 1 },
      { width: 1280 },
      { triangles: NaN },
    ])
      expect(() => parseThreeMetrics({ ...metrics, ...patch })).toThrow();
  });

  it('rejects arbitrary bytes and incorrectly sized images before publication', () => {
    expect(() => assertPngBytes(Buffer.from('not an image'))).toThrow('PNG');
    const header = Buffer.alloc(20000);
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(header);
    header.writeUInt32BE(800, 16);
    header.writeUInt32BE(600, 20);
    expect(() => assertPngBytes(header)).toThrow('1600');
  });

  it('allows only lighting to differ between themed views, tolerating numeric camera roundoff', () => {
    const day = defaultWorldView(TINY_WORLD_SCENE);
    assertSamePose(day, { ...day, lighting: 'night' });
    assertSamePose(day, {
      ...day,
      lighting: 'night',
      camera: { ...day.camera, zoom: day.camera.zoom + 1e-12 },
    });
    for (const view of [
      { ...day, cursorDate: '2024-02-28' },
      { ...day, elapsedSeconds: 1 },
      { ...day, weather: 'rain' as const },
      { ...day, camera: { ...day.camera, zoom: day.camera.zoom + 0.1 } },
    ])
      expect(() => assertSamePose(day, view)).toThrow('pose');
  });

  it('accepts observed Node/Chromium recipe rounding without changing the captured document', () => {
    const recipe = (value: number) =>
      TINY_WORLD_SCENE.modelRecipes.map((model) => ({
        ...model,
        parts: model.parts.map((part) => ({ ...part, rotation: { ...part.rotation, z: value } })),
      }));
    const scene = {
      ...TINY_WORLD_SCENE,
      settings: { ...TINY_WORLD_SCENE.settings, layout: 'seasonal-circle' as const },
      modelRecipes: recipe(0.055941571233560965),
    };
    const expected = createWorldDocument({
      scene,
      sourceSnapshot: TINY_WORLD_INPUT.snapshot,
      view: { ...defaultWorldView(scene), weather: 'clear', motion: 'off' },
    });
    const captured = {
      ...expected,
      scene: { ...expected.scene, modelRecipes: recipe(0.05594157123356096) },
    };
    const original = JSON.stringify(captured);
    expect(() =>
      assertCanonicalWorld(captured, TINY_WORLD_INPUT.snapshot, expected.scene),
    ).not.toThrow();
    expect(JSON.stringify(captured)).toBe(original);
    for (const value of [0.055941571233560965 + 1e-10, 0.06])
      expect(() =>
        assertCanonicalWorld(
          { ...captured, scene: { ...captured.scene, modelRecipes: recipe(value) } },
          TINY_WORLD_INPUT.snapshot,
          expected.scene,
        ),
      ).toThrow('modelRecipes');
  });
});
