import { createArchive } from '../core/archive/comparison.js';
import { serializeArchive } from '../core/archive/serialize.js';
import type { ArchiveV1, SnapshotV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { button, click, dialog, errorMessage, html, input, select, status } from './dom.js';
import { downloadText } from './downloads.js';
import type { ImportedData } from './imports.js';
import {
  comparisonLibrary,
  loadLibrary,
  matchingSnapshots,
  mergeSnapshots,
  saveLibrary,
  type Library,
} from './archive-store.js';
import { showArchiveList, showComparison, snapshotKey } from './archive-view.js';
import { CURRENT_RENDERER, type DemoRenderer } from './renderers.js';

export type ArchiveController = {
  readonly importData: (data: ImportedData) => Promise<boolean>;
  readonly refresh: () => void;
};

function confirmReplacement(snapshots: readonly SnapshotV1[]): Promise<boolean> {
  const modal = dialog('replace-dialog');
  html('replace-description').textContent =
    `${snapshots.map((snapshot) => `@${snapshot.username} ${snapshot.year}`).join(', ')} already exists. Replace these saved snapshots with the imported data? Your other years will be kept.`;
  modal.returnValue = '';
  return new Promise((resolve) => {
    button('replace-confirm').onclick = () => modal.close('replace');
    button('replace-cancel').onclick = () => modal.close('cancel');
    modal.addEventListener('close', () => resolve(modal.returnValue === 'replace'), { once: true });
    modal.showModal();
  });
}

export function setupArchive(
  current: () => SnapshotV1,
  mode: () => ColorMode,
  open: (snapshot: SnapshotV1) => void,
  renderer: () => DemoRenderer = () => CURRENT_RENDERER,
): ArchiveController {
  let library: Library = { snapshots: [] };
  const selected = new Set<string>();
  const restoreScale = (maxCount: number): void => {
    select('comparison-scale').value = 'fixed';
    input('comparison-max').value = String(maxCount);
  };
  const report = (message: string, error = false): void => {
    html('archive-status').textContent = message;
    html('archive-status').dataset.error = String(error);
  };
  try {
    library = loadLibrary(window.localStorage);
    if (library.comparison) restoreScale(library.comparison.maxCount);
    for (const snapshot of library.snapshots) {
      if (
        library.comparison?.username.toLowerCase() === snapshot.username.toLowerCase() &&
        library.comparison.years.includes(snapshot.year)
      )
        selected.add(snapshotKey(snapshot));
    }
  } catch (error) {
    report(
      `Saved archive could not be opened: ${errorMessage(error)}. Existing browser data was not changed.`,
      true,
    );
  }
  const commit = (next: Library): boolean => {
    const saved = saveLibrary(window.localStorage, next);
    if (!saved.ok) {
      report(saved.message, true);
      status(saved.message, true);
      return false;
    }
    library = next;
    return true;
  };
  const refresh = (): void => {
    showArchiveList(library.snapshots, selected, mode(), open, renderer());
    if (library.comparison) {
      const { username, years, maxCount } = library.comparison;
      const archive = createArchive(
        library.snapshots.filter(
          (snapshot) => snapshot.username.toLowerCase() === username.toLowerCase(),
        ),
        years,
        { kind: 'fixed', maxCount },
      );
      showComparison(archive, mode(), renderer());
    }
  };
  const selectedArchive = (): ArchiveV1 => {
    const snapshots = library.snapshots.filter((snapshot) => selected.has(snapshotKey(snapshot)));
    return createArchive(
      snapshots,
      snapshots.map((snapshot) => snapshot.year),
      select('comparison-scale').value === 'fixed'
        ? { kind: 'fixed', maxCount: Number(input('comparison-max').value) }
        : { kind: 'relative' },
    );
  };
  const importData = async (data: ImportedData): Promise<boolean> => {
    const conflicts = matchingSnapshots(library, data.snapshots);
    if (conflicts.length && !(await confirmReplacement(conflicts))) {
      report('Import canceled. Your existing archive and preview were kept.');
      return false;
    }
    let next = mergeSnapshots(library, data.snapshots, conflicts.length > 0);
    if (data.archive) next = comparisonLibrary(next, data.archive);
    if (!commit(next)) return false;
    for (const snapshot of data.snapshots) selected.add(snapshotKey(snapshot));
    if (data.archive) {
      restoreScale(data.archive.comparison.normalization.maxCount);
      selected.clear();
      for (const snapshot of data.archive.snapshots)
        if (data.archive.comparison.years.includes(snapshot.year))
          selected.add(snapshotKey(snapshot));
    }
    report(
      `${library.snapshots.length} saved snapshot${library.snapshots.length === 1 ? '' : 's'}. Sources and exact counts are stored in this browser.`,
    );
    refresh();
    return true;
  };
  click('save-snapshot', async () => {
    await importData({ snapshots: [current()] });
  });
  click('compare-years', () => {
    const archive = selectedArchive();
    if (!commit(comparisonLibrary(library, archive))) return;
    showComparison(archive, mode(), renderer());
    report(
      `Compared ${archive.comparison.years.length} years with common maximum ${archive.comparison.normalization.maxCount}. Saved comparison restored on reload.`,
    );
  });
  click('export-archive', () => {
    const archive = selectedArchive();
    downloadText(
      serializeArchive(archive),
      `maeul-${archive.snapshots[0]?.username ?? 'village'}-archive.json`,
    );
    report(
      `Downloaded ${archive.snapshots.length} selected snapshots with their shared scale. Select two to five years from one account for an archive.`,
    );
  });
  if (library.snapshots.length)
    report(`${library.snapshots.length} saved snapshots restored from this browser.`);
  refresh();
  return { importData, refresh };
}
