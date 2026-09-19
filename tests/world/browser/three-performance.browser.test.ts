import { describe, expect, it } from 'vitest';
import { buildWorld } from '../../../src/world/model/index.js';
import { inputFor, sequence } from '../model/helpers.js';
import { browserFrames, openThree } from '../three/browser-harness.js';

describe('annual Three WebGL workload', () => {
  it.each(['archipelago', 'island', 'seasonal'] as const)(
    'renders every dated %s scene with bounded GPU submissions',
    async (layout) => {
      const input = inputFor(sequence('2024-01-01', 366, 25));
      const scene = buildWorld({ ...input, settings: { ...input.settings, layout } });
      const started = performance.now();
      const { port, canvas } = await openThree({ motion: 'off' }, {}, scene);
      const startupMs = performance.now() - started;
      const overview = {
        calls: Number(canvas.dataset.calls),
        triangles: Number(canvas.dataset.triangles),
      };
      expect(overview.calls).toBeLessThan(180);
      expect(overview.triangles).toBeLessThan(450_000);
      expect(overview.triangles).toBeGreaterThan(100_000);
      port.focus({ kind: 'month', monthKey: '2024-06' });
      await browserFrames();
      const month = {
        calls: Number(canvas.dataset.calls),
        triangles: Number(canvas.dataset.triangles),
      };
      expect(month.calls).toBeLessThan(200);
      expect(month.triangles).toBeLessThan(900_000);
      port.reset();
      port.update({ ...port.getView(), motion: 'full' });
      await browserFrames(4);
      const periods: number[] = [];
      let previous = performance.now();
      for (let index = 0; index < 24; index++) {
        await browserFrames(1);
        const now = performance.now();
        periods.push(now - previous);
        previous = now;
      }
      periods.sort((a, b) => a - b);
      const context = canvas.getContext('webgl2');
      const renderer: unknown = context?.getParameter(context.RENDERER);
      const debug: unknown = context?.getExtension('WEBGL_debug_renderer_info');
      const unmaskedRenderer: unknown =
        debug &&
        typeof debug === 'object' &&
        'UNMASKED_RENDERER_WEBGL' in debug &&
        typeof debug.UNMASKED_RENDERER_WEBGL === 'number'
          ? context?.getParameter(debug.UNMASKED_RENDERER_WEBGL)
          : undefined;
      console.info(
        'THREE_ANNUAL_MEASUREMENT',
        JSON.stringify({
          layout,
          dates: scene.days.length,
          entities: scene.entities.length,
          startupMs,
          overview,
          month,
          browserRafP50Ms: periods[12],
          browserRafP95Ms: periods[22],
          renderer,
          unmaskedRenderer,
          drawingBuffer: [canvas.width, canvas.height],
        }),
      );
      port.dispose();
      expect(canvas.dataset.geometries).toBe('0');
      expect(canvas.dataset.textures).toBe('0');
      expect(context?.isContextLost()).toBe(true);
    },
    // SwiftShader needs additional time for the unchanged 24-frame workload under coverage.
    120_000,
  );
});
