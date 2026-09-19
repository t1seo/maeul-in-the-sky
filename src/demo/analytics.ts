import type { SnapshotV1 } from '../core/snapshot-types.js';
import { setupAnalytics } from '../world/analytics/index.js';
import { dialog } from './dom.js';

export function setupDemoAnalytics(
  currentSnapshot: () => SnapshotV1,
  signal: AbortSignal,
): () => void {
  const opener = document.getElementById('explore-activity');
  if (!(opener instanceof HTMLButtonElement)) return () => {};
  const root = dialog('analytics-dialog');
  const analytics = setupAnalytics(currentSnapshot, signal);
  const refresh = (): void => {
    if (root.open) analytics.refresh();
  };
  opener.addEventListener(
    'click',
    () => {
      root.showModal();
      refresh();
    },
    { signal },
  );
  for (const closer of root.querySelectorAll<HTMLButtonElement>('[data-close]'))
    closer.addEventListener('click', () => root.close(), { signal });
  root.addEventListener('close', () => opener.focus(), { signal });
  signal.addEventListener('abort', () => root.close(), { once: true });
  return refresh;
}
