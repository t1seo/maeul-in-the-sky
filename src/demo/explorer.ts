import type { TerrainRenderResult } from '../core/scene-types.js';
import type { SnapshotV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { html, select } from './dom.js';
import { mountSvg } from './preview.js';
import { showDay } from './day-details.js';
import { bindDates } from './date-navigation.js';

export { setupZoom } from './zoom.js';

export function updateExplorer(
  output: TerrainRenderResult,
  snapshot: SnapshotV1,
  mode: ColorMode,
): void {
  const { metadata } = output;
  html('preview-panel').dataset.mode = mode;
  const target = html('live-terrain');
  const root = mountSvg(target, output[mode]);
  target.hidden = false;
  html('terrain').hidden = true;
  html('stat-total').textContent = metadata.stats.total.toLocaleString();
  html('stat-active').textContent = metadata.stats.activeDays.toLocaleString();
  html('stat-streak').textContent = `${metadata.stats.longestStreak.toLocaleString()} days`;
  html('period').textContent = metadata.fromDate
    ? `${metadata.fromDate} to ${metadata.toDate}`
    : 'No supplied dates';
  html('source-badge').textContent =
    snapshot.source.kind === 'sample'
      ? `Sample · @${snapshot.username}`
      : `@${snapshot.username} · ${snapshot.source.kind}`;
  html('provenance').textContent =
    snapshot.source.kind === 'sample'
      ? `Sample Contribution Calendar for @${snapshot.username}. ${metadata.dataDayCount} supplied days. Editing the setup username does not fetch an account.`
      : `@${snapshot.username} · Source: ${snapshot.source.kind}${snapshot.source.fetchedAt ? ` · Fetched ${snapshot.source.fetchedAt}` : ''}. ${metadata.dataDayCount} supplied days; ${metadata.missingDayCount} missing days are not counted as zero.`;
  html('scale-note').textContent =
    `${metadata.normalization.kind === 'relative' ? 'Relative P90' : 'Fixed'} height scale: ${metadata.normalization.maxCount} contributions. ${metadata.normalization.kind === 'relative' ? 'Heights can change when this history changes.' : 'Equal counts share equal heights at this maximum.'}`;
  const dateSelect = select('date-select');
  const previousDate = dateSelect.value;
  dateSelect.replaceChildren(
    ...[...metadata.cells]
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((cell) => new Option(`${cell.date} · ${cell.count} contributions`, cell.date)),
  );
  if (metadata.cells.some((cell) => cell.date === previousDate)) dateSelect.value = previousDate;
  const first = metadata.cells.find((cell) => cell.date === dateSelect.value);
  if (first) showDay(html('date-details'), first, metadata);
  else html('date-details').textContent = 'No contribution dates were supplied.';
  dateSelect.onchange = () => {
    const selected = metadata.cells.find((cell) => cell.date === dateSelect.value);
    if (selected) showDay(html('date-details'), selected, metadata);
  };
  bindDates(root, metadata, html('date-details'));
}
