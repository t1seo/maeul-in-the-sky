import { afterEach, describe, expect, it } from 'vitest';
import { createTourRenderer } from '../../../src/tour/render/renderer.js';
import { loadTourModel } from '../../../src/tour/model/load.js';

const cleanups: (() => void)[] = [];
afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

describe('a real WebGL entrance into the Calendar village', () => {
  it('renders actual meshes, changes viewpoints and lighting, then disposes', async () => {
    const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'width:900px;height:600px';
    document.body.append(canvas);
    let navigationUpdates = 0;
    const renderer = createTourRenderer(canvas, model, {
      reducedMotion: true,
      onNavigationFrame: () => navigationUpdates++,
    });
    cleanups.push(() => {
      renderer.dispose();
      canvas.remove();
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const first = renderer.inspect();
    expect(first.triangles).toBeGreaterThan(1000);
    expect(first.drawCalls).toBeLessThan(350);
    expect(first.mode).toBe('orbit');
    await expect.poll(() => navigationUpdates).toBeGreaterThan(0);
    const rect = canvas.getBoundingClientRect();
    const cell = renderer.pick(rect.left + rect.width / 2, rect.top + rect.height / 2);
    expect(model.cells.some((candidate) => candidate.source.date === cell?.date)).toBe(true);
    expect(renderer.teleportAt(rect.left + rect.width / 2, rect.top + rect.height / 2)).toBe(true);
    expect(renderer.inspect().mode).toBe('walk');
    expect(renderer.inspect().position.y).toBeCloseTo(1.55);
    const standing = renderer.inspect().position;
    expect(renderer.teleportAt(rect.left - 100, rect.top - 100)).toBe(false);
    expect(renderer.teleportAt(NaN, rect.top)).toBe(false);
    expect(renderer.inspect().position).toEqual(standing);
    renderer.navigation.overview();
    expect(renderer.inspect().position.y).toBeGreaterThan(first.position.y);
    renderer.navigation.home();
    renderer.setLighting('night');
    expect(renderer.inspect().lighting).toBe('night');
    renderer.setLighting('day');
    renderer.setLighting('golden');
    expect(renderer.navigation.walk()).toBe(true);
    expect(renderer.inspect().mode).toBe('walk');
    expect(renderer.inspect().position.y).toBeCloseTo(1.55);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
    expect(renderer.inspect().mode).toBe('orbit');
    renderer.navigation.startTour();
    expect(renderer.inspect().touring).toBe(true);
    canvas.dispatchEvent(new WheelEvent('wheel'));
    expect(renderer.inspect().touring).toBe(false);
    renderer.dispose();
    expect(renderer.inspect().disposed).toBe(true);
  });
});
