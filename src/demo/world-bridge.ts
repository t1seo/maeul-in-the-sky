import type { SnapshotV1 } from '../core/snapshot-types.js';
import { serializeSnapshot } from '../core/settings/serialize.js';
import { element, errorMessage, status } from './dom.js';
import { parseSnapshot } from '../core/settings/parse.js';
import type { RendererVersion } from './renderer-version.js';
import { setupDemoAnalytics } from './analytics.js';

export function setupWorldBridge(
  currentSnapshot: () => SnapshotV1,
  renderer: () => RendererVersion = () => 'current',
  transferSnapshot: () => SnapshotV1 = currentSnapshot,
): { readonly refresh: () => void; readonly dispose: () => void } {
  const world = element('#explore-world', HTMLAnchorElement);
  const lifetime = new AbortController();
  const { signal } = lifetime;
  const refresh = setupDemoAnalytics(currentSnapshot, signal);
  world.addEventListener(
    'click',
    (event) => {
      try {
        sessionStorage.setItem('maeul-world-transfer', serializeSnapshot(transferSnapshot()));
        world.setAttribute('href', `./world/?renderer=${renderer()}`);
      } catch (error) {
        event.preventDefault();
        status(
          `Could not open this world: ${errorMessage(error)}. Download a snapshot and import it in the world explorer.`,
          true,
        );
      }
    },
    { signal },
  );
  window.addEventListener(
    'pagehide',
    (event) => {
      if (!event.persisted) lifetime.abort();
    },
    { signal },
  );
  return { refresh, dispose: () => lifetime.abort() };
}

export function consumeDemoTransfer(open: (snapshot: SnapshotV1) => void): void {
  try {
    const saved = sessionStorage.getItem('maeul-demo-transfer');
    if (saved === null) return;
    open(parseSnapshot(saved));
    if (sessionStorage.getItem('maeul-demo-transfer') === saved)
      sessionStorage.removeItem('maeul-demo-transfer');
  } catch (error) {
    status(
      `Could not restore your world snapshot: ${errorMessage(error)}. The current scene and saved transfer are kept. You can retry by reloading or import a snapshot.`,
      true,
    );
  }
}
