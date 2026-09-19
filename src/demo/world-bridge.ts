import type { SnapshotV1 } from '../core/snapshot-types.js';
import { serializeSnapshot } from '../core/settings/serialize.js';
import { element, errorMessage, status } from './dom.js';
import { parseSnapshot } from '../core/settings/parse.js';
import type { RendererVersion } from './renderer-version.js';

export function setupWorldBridge(
  currentSnapshot: () => SnapshotV1,
  renderer: () => RendererVersion = () => 'current',
): void {
  const world = element('#explore-world', HTMLAnchorElement);
  const activity = document.querySelector<HTMLAnchorElement>('#explore-activity');
  for (const link of activity ? [world, activity] : [world]) {
    link.addEventListener('click', (event) => {
      try {
        sessionStorage.setItem('maeul-world-transfer', serializeSnapshot(currentSnapshot()));
        link.setAttribute(
          'href',
          `./world/?renderer=${renderer()}${link === activity ? '&panel=activity' : ''}`,
        );
      } catch (error) {
        event.preventDefault();
        status(
          `Could not open this world: ${errorMessage(error)}. Download a snapshot and import it in the world explorer.`,
          true,
        );
      }
    });
  }
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
