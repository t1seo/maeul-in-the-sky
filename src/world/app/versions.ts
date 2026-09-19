import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { serializeSnapshot } from '../../core/settings/serialize.js';
import { html, select } from './dom.js';

export function setupVersionSelection(
  currentSnapshot: () => SnapshotV1,
  signal: AbortSignal,
  navigate: (url: string) => void = (url) => window.location.assign(url),
): void {
  const picker = select('world-version');
  const message = html('world-version-status');
  const reset = (): void => {
    picker.value = 'world';
    message.hidden = true;
    message.textContent = '';
  };
  const fail = (reason: string): void => {
    message.hidden = false;
    message.textContent = `${reason} Your current world is unchanged.`;
  };
  reset();
  picker.addEventListener(
    'change',
    () => {
      const version = picker.value;
      reset();
      if (version === 'world') return;
      if (version !== 'current' && version !== 'classic') {
        fail('Please select a view version again.');
        return;
      }
      let serialized: string;
      try {
        serialized = serializeSnapshot(currentSnapshot());
      } catch {
        fail(
          'Could not transfer the contribution records. Import valid records, then choose again.',
        );
        return;
      }
      try {
        window.sessionStorage.setItem('maeul-demo-transfer', serialized);
        navigate(`../?renderer=${version}`);
      } catch {
        fail('Could not open the SVG version. Check browser storage, then choose again.');
      }
    },
    { signal },
  );
}
