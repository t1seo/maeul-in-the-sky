import { selectComparisonSnapshots } from '../core/archive/selection.js';
import { escapeXml } from '../core/svg.js';
import { snapshotToContributionData } from '../core/settings/parse.js';
import type { ArchiveV1 } from '../core/snapshot-types.js';
import type { ColorMode, Theme } from '../core/types.js';
import { namespaceAndPositionSvg } from './svg-composition.js';

export function renderArchiveComparison(
  archive: ArchiveV1,
  theme: Theme,
  source: string,
): { dark: string; light: string } {
  const width = 420;
  const header = 64;
  const rowHeight = 390;
  const snapshots = selectComparisonSnapshots(archive.snapshots, archive.comparison.years);
  const height = header + rowHeight * snapshots.length;
  const rows = snapshots.map((snapshot) => ({
    year: snapshot.year,
    svg: theme.render(snapshotToContributionData(snapshot), {
      title: snapshot.settings.title,
      width,
      height: 360,
      hemisphere: snapshot.settings.hemisphere,
      density: snapshot.settings.density,
      style: snapshot.settings.style,
      layout: 'card',
      motion: snapshot.settings.motion,
      layoutSeed: snapshot.settings.layoutSeed,
      normalization: archive.comparison.normalization,
    }),
  }));
  const renderMode = (mode: ColorMode) => {
    const background = mode === 'dark' ? '#0d1117' : '#ffffff';
    const foreground = mode === 'dark' ? '#f0f6fc' : '#1f2328';
    const label = source === 'shared-p90' ? 'Pooled nonzero P90' : 'Fixed common maximum';
    const legend = `${label}: ${archive.comparison.normalization.maxCount} contributions/day`;
    const username = snapshots[0]?.username ?? '';
    const body = rows
      .map((row, index) => {
        const top = header + index * rowHeight;
        const svg = namespaceAndPositionSvg(
          row.svg[mode],
          `archive-${mode}-${index}-`,
          0,
          top + 30,
        );
        return `<text x="16" y="${top + 22}" font-size="18" font-weight="600">${row.year}</text>${svg}`;
      })
      .join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="archive-${mode}-title archive-${mode}-desc"><title id="archive-${mode}-title">${escapeXml(username)} annual village comparison</title><desc id="archive-${mode}-desc">${escapeXml(legend)}. Equal contribution counts use equal terrain heights.</desc><rect width="${width}" height="${height}" fill="${background}"/><g fill="${foreground}" font-family="Noto Sans KR, sans-serif"><text x="16" y="25" font-size="18">@${escapeXml(username)} · ${archive.comparison.years.join(', ')}</text><text x="16" y="49" font-size="12">${escapeXml(legend)}</text>${body}</g></svg>`;
  };
  return { dark: renderMode('dark'), light: renderMode('light') };
}
