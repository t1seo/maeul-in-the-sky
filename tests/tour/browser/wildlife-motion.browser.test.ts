import { expect, it, vi } from 'vitest';
import { createTourRenderer } from '../../../src/tour/render/renderer.js';
import { loadTourModel } from '../../../src/tour/model/load.js';
import { loadWildlifeLibrary } from '../../../src/tour/wildlife/library.js';
import { wildlifeBaseUrl } from './fixture.js';

const pause = () => new Promise<void>((resolve) => setTimeout(resolve, 120));

it('shares the scenery clock and freezes reduced, hidden and offscreen poses without catch-up', async () => {
  const { model } = await loadTourModel({ pageUrl: 'https://example.github.io/tour/' });
  const library = await loadWildlifeLibrary(
    ['cow', 'squirrel'],
    wildlifeBaseUrl,
    new AbortController().signal,
  );
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'width:900px;height:600px';
  document.body.append(canvas);
  const renderer = createTourRenderer(canvas, model, { wildlife: library });
  try {
    await expect.poll(() => renderer.inspect().elapsed).toBeGreaterThan(0);
    renderer.setReducedMotion(true);
    const stopped = renderer.inspect().elapsed;
    await pause();
    expect(renderer.inspect().elapsed).toBe(stopped);
    expect(renderer.inspect().windTime).toBe(stopped);
    renderer.setReducedMotion(false);
    await expect.poll(() => renderer.inspect().elapsed).toBeGreaterThan(stopped);
    const hidden = vi.spyOn(document, 'hidden', 'get').mockReturnValue(true);
    document.dispatchEvent(new Event('visibilitychange'));
    const hiddenTime = renderer.inspect().elapsed;
    await pause();
    expect(renderer.inspect().windTime).toBe(hiddenTime);
    hidden.mockRestore();
    document.dispatchEvent(new Event('visibilitychange'));
    canvas.style.transform = 'translateY(4000px)';
    await expect.poll(() => renderer.inspect().visible).toBe(false);
    const offscreenTime = renderer.inspect().elapsed;
    await pause();
    expect(renderer.inspect().elapsed).toBe(offscreenTime);
    canvas.style.transform = '';
    await expect.poll(() => renderer.inspect().visible).toBe(true);
    expect(renderer.inspect().elapsed - offscreenTime).toBeLessThan(0.1);
    await expect.poll(() => renderer.inspect().elapsed).toBeGreaterThan(offscreenTime);
  } finally {
    vi.restoreAllMocks();
    renderer.dispose();
    library.dispose();
    canvas.remove();
  }
});
