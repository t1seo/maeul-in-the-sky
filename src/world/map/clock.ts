export type MapClock = { readonly refresh: () => void; readonly dispose: () => void };

export function createMapClock(
  host: HTMLElement,
  enabled: () => boolean,
  advance: (seconds: number) => void,
  onError: (error: Error) => void,
): MapClock {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let visible = true;
  let disposed = false;
  let failed = false;
  let request: number | undefined;
  let previous: number | undefined;
  const active = (): boolean =>
    !disposed && !failed && visible && !document.hidden && !reduced.matches && enabled();
  const cancel = (): void => {
    if (request !== undefined) cancelAnimationFrame(request);
    request = undefined;
    previous = undefined;
  };
  const tick = (now: number): void => {
    request = undefined;
    if (!active()) {
      previous = undefined;
      return;
    }
    if (previous === undefined) previous = now;
    const elapsed = now - previous;
    if (elapsed >= 1000 / 30) {
      previous = now;
      try {
        advance(Math.min(elapsed / 1000, 0.1));
      } catch (error) {
        failed = true;
        if (error instanceof Error) onError(error);
        else throw error;
      }
    }
    if (active()) request = requestAnimationFrame(tick);
  };
  const refresh = (): void => {
    if (!active()) cancel();
    else if (request === undefined) request = requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    refresh();
  });
  observer.observe(host);
  reduced.addEventListener('change', refresh, { signal: events.signal });
  document.addEventListener('visibilitychange', refresh, { signal: events.signal });
  refresh();
  return {
    refresh,
    dispose: () => {
      disposed = true;
      cancel();
      observer.disconnect();
      events.abort();
    },
  };
}
