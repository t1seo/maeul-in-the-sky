import { WorldDataError } from './errors.js';

export function createLatestRequestGate() {
  let revision = 0;
  let active: AbortController | undefined;
  return {
    async run<T>(task: (signal: AbortSignal) => Promise<T>): Promise<T> {
      active?.abort();
      const current = ++revision;
      const controller = new AbortController();
      active = controller;
      try {
        const value = await task(controller.signal);
        if (current !== revision)
          throw new WorldDataError('stale', 'A newer world request replaced this response.');
        if (controller.signal.aborted)
          throw new WorldDataError('cancelled', 'World loading was cancelled.');
        return value;
      } finally {
        if (active === controller) active = undefined;
      }
    },
    cancel(): void {
      active?.abort();
    },
  };
}
