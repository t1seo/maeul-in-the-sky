import type { ArchiveV1, SnapshotV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { snapshotToContributionData } from '../core/settings/parse.js';
import { html, safeAction, textNode } from './dom.js';
import { downloadBlob, downloadText, pngBlob } from './downloads.js';
import { renderSnapshot } from './preview.js';
import { CURRENT_RENDERER, type DemoRenderer } from './renderers.js';
import { RENDERER_VERSIONS } from './renderer-version.js';
import { resolveDisplaySize } from '../core/display-size.js';
import { settingsForRenderer } from './renderer-settings.js';

export function snapshotKey(snapshot: SnapshotV1): string {
  return `${snapshot.username.toLowerCase()}:${snapshot.year}`;
}

export function annualCardSvg(
  snapshot: SnapshotV1,
  mode: ColorMode,
  maxCount?: number,
  renderer: DemoRenderer = CURRENT_RENDERER,
): string {
  return renderSnapshot(
    snapshot,
    {
      ...snapshot.settings,
      layout: 'card',
      motion: 'off',
      title: `@${snapshot.username} · ${snapshot.year}`,
      ...(maxCount === undefined ? {} : { normalization: { kind: 'fixed', maxCount } }),
    },
    'village',
    renderer,
  )[mode];
}

export function showArchiveList(
  snapshots: readonly SnapshotV1[],
  selected: Set<string>,
  mode: ColorMode,
  open: (snapshot: SnapshotV1) => void,
  renderer: DemoRenderer = CURRENT_RENDERER,
): void {
  const items = snapshots.map((snapshot) => {
    const item = textNode('article', '', 'archive-item');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = snapshotKey(snapshot);
    checkbox.checked = selected.has(checkbox.value);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) selected.add(checkbox.value);
      else selected.delete(checkbox.value);
    });
    label.append(checkbox, document.createTextNode(`@${snapshot.username} ${snapshot.year}`));
    item.append(label);
    const { stats } = snapshotToContributionData(snapshot);
    item.append(
      textNode(
        'p',
        `${stats.total.toLocaleString()} contributions · ${snapshot.source.kind}\n${stats.fromDate} to ${stats.toDate}`,
      ),
    );
    const actions = textNode('div', '', 'button-row');
    const openButton = textNode('button', `View ${snapshot.year}`);
    openButton.type = 'button';
    openButton.addEventListener('click', () => open(snapshot));
    const svgButton = textNode('button', `Download ${snapshot.year} card`);
    svgButton.type = 'button';
    svgButton.addEventListener('click', () =>
      safeAction(() =>
        downloadText(
          annualCardSvg(snapshot, mode, undefined, renderer),
          `maeul-${snapshot.username}-${snapshot.year}-card.svg`,
          'image/svg+xml',
        ),
      ),
    );
    actions.append(openButton, svgButton);
    item.append(actions);
    return item;
  });
  html('archive-list').replaceChildren(...items);
}

export function showComparison(
  archive: ArchiveV1,
  mode: ColorMode,
  renderer: DemoRenderer = CURRENT_RENDERER,
): void {
  const maxCount = archive.comparison.normalization.maxCount;
  const snapshots = archive.snapshots.filter((snapshot) =>
    archive.comparison.years.includes(snapshot.year),
  );
  html('comparison-note').textContent =
    `Comparing ${snapshots.length} years for @${snapshots[0]?.username ?? ''}. Common fixed maximum: ${maxCount} contributions. ${snapshots.some((snapshot) => settingsForRenderer(snapshot.settings, renderer.version).terrainMode === 'landscape') ? 'Landscape elevations follow geography; daily rewards follow contribution counts.' : 'Equal counts share equal terrain heights; all cards use this scale.'} Artwork: ${RENDERER_VERSIONS[renderer.version].label}.`;
  const cards = snapshots.map((snapshot) => {
    const card = textNode('article', '', 'annual-card');
    card.dataset.normalizationMax = String(maxCount);
    card.dataset.year = String(snapshot.year);
    card.dataset.renderer = renderer.version;
    const svg = annualCardSvg(snapshot, mode, maxCount, renderer);
    const dimensions = resolveDisplaySize({
      ...settingsForRenderer(snapshot.settings, renderer.version),
      layout: 'card',
    });
    const image = document.createElement('img');
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
    image.alt = `${snapshot.year} village for ${snapshot.username}, common maximum ${maxCount}`;
    image.width = dimensions.width;
    image.height = dimensions.height;
    card.append(
      textNode('h3', String(snapshot.year)),
      image,
      textNode('p', `Source: ${snapshot.source.kind} · fixed max ${maxCount}`),
    );
    const actions = textNode('div', '', 'button-row');
    const svgButton = textNode('button', `Download ${snapshot.year} SVG`);
    svgButton.addEventListener('click', () =>
      downloadText(svg, `maeul-${snapshot.year}-comparison.svg`, 'image/svg+xml'),
    );
    const pngButton = textNode('button', `Download ${snapshot.year} PNG`);
    pngButton.addEventListener('click', () =>
      safeAction(async () =>
        downloadBlob(
          await pngBlob(svg, dimensions.width, dimensions.height, mode === 'light'),
          `maeul-${snapshot.year}-comparison.png`,
        ),
      ),
    );
    actions.append(svgButton, pngButton);
    card.append(actions);
    return card;
  });
  html('comparison-cards').replaceChildren(...cards);
}
