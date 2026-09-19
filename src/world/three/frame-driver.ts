import type { WebGLRenderer } from 'three';
import type { WorldView } from '../model/types.js';

export function createFrameDriver(
  renderer: WebGLRenderer,
  host: HTMLElement,
  paint: (delta: number) => void,
  onError: (error: unknown) => void,
) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let motion: WorldView['motion'] = 'off';
  let onScreen = true;
  let paused = false;
  let disposed = false;
  let lastTime: number | undefined;
  let pending: number | undefined;

  function isVisible() {
    return onScreen && !document.hidden && !paused && !disposed;
  }
  function draw(delta: number) {
    try {
      paint(delta);
    } catch (error) {
      paused = true;
      refresh();
      onError(error);
    }
  }
  function tick(time: number) {
    if (!isVisible()) return;
    const delta =
      lastTime === undefined ? 0 : Math.min(0.05, Math.max(0, (time - lastTime) / 1000));
    lastTime = time;
    draw(delta);
  }
  function request() {
    if (!isVisible() || pending !== undefined) return;
    pending = requestAnimationFrame(() => {
      pending = undefined;
      if (isVisible()) draw(0);
    });
  }
  function refresh() {
    renderer.setAnimationLoop(null);
    if (pending !== undefined) cancelAnimationFrame(pending);
    pending = undefined;
    lastTime = undefined;
    if (!isVisible()) return;
    if (motion === 'full' && !reduced.matches) renderer.setAnimationLoop(tick);
    else request();
  }
  reduced.addEventListener('change', refresh, { signal: events.signal });
  document.addEventListener('visibilitychange', refresh, { signal: events.signal });
  const observer = new IntersectionObserver((entries) => {
    const entry = entries.find((item) => item.target === host);
    if (entry && entry.isIntersecting !== onScreen) {
      onScreen = entry.isIntersecting;
      refresh();
    }
  });
  observer.observe(host);
  return {
    request,
    setMotion(next: WorldView['motion']) {
      motion = next;
      refresh();
    },
    setPaused(next: boolean) {
      paused = next;
      refresh();
    },
    dispose() {
      disposed = true;
      refresh();
      observer.disconnect();
      events.abort();
    },
  };
}
