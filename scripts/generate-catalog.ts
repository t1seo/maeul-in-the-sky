import { copyFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { Resvg } from '@resvg/resvg-js';
import {
  ASSET_CATALOG,
  ASSET_CATALOG_COUNTS,
  renderCatalogAsset,
  type AssetBounds,
  type AssetSeason,
} from '../src/themes/terrain/assets.js';
import { EPIC_CATALOG, EPIC_CATALOG_COUNTS, EPIC_RENDERERS } from '../src/themes/terrain/epics.js';
import {
  getTerrainPalette100,
  getSeasonalPalette100,
  type AssetColors,
} from '../src/themes/terrain/palette.js';
import { withMotionContext } from '../src/core/animation.js';
import type { ColorMode } from '../src/core/types.js';
import { createGalleryItems } from './catalog/gallery-items.js';
import { countCatalogFamilies } from './catalog/model.js';
import { renderCatalogPage } from './catalog/page.js';
import { renderCatalogSprite } from './catalog/sprite.js';

interface PreviewItem {
  readonly id: string;
  readonly displayName: string;
  readonly caption: string;
  readonly season: AssetSeason;
  readonly bounds: AssetBounds;
  readonly render: (colors: AssetColors) => string;
}
const SEASON_WEEKS: Readonly<Record<AssetSeason, number>> = {
  all: 28,
  winter: 0,
  spring: 16,
  summer: 28,
  autumn: 42,
};
const escape = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

export function catalogSVG(items: readonly PreviewItem[], title: string, mode: ColorMode): string {
  const columns = Math.min(6, Math.max(1, items.length));
  const tileWidth = 168;
  const tileHeight = 134;
  const width = columns * tileWidth + 32;
  const height = Math.ceil(items.length / columns) * tileHeight + 88;
  const background = mode === 'dark' ? '#15212c' : '#f3f3ec';
  const card = mode === 'dark' ? '#1f303d' : '#fffef7';
  const ink = mode === 'dark' ? '#e6eee9' : '#283b38';
  const muted = mode === 'dark' ? '#b0c3c1' : '#566a62';
  const tiles = items.map((item, index) => {
    const { x, y, width: w, height: h } = item.bounds;
    const scale = Math.min(4, 140 / w, 80 / h);
    const dx = 16 + (index % columns) * tileWidth;
    const dy = 72 + Math.floor(index / columns) * tileHeight;
    const colors =
      item.season === 'all'
        ? getTerrainPalette100(mode).assets
        : getSeasonalPalette100(mode, SEASON_WEEKS[item.season], 0).assets;
    const art = withMotionContext({ mode: 'off', namespace: `catalog-${item.id}` }, () =>
      item.render(colors),
    );
    return (
      `<g transform="translate(${dx},${dy})" data-catalog-id="${escape(item.id)}">` +
      `<rect width="156" height="122" rx="10" fill="${card}"/>` +
      `<g transform="translate(${78 - (x + w / 2) * scale},${46 - (y + h / 2) * scale}) scale(${scale})">${art}</g>` +
      `<text x="78" y="101" text-anchor="middle" font-size="11" fill="${ink}">${escape(item.displayName)}</text>` +
      `<text x="78" y="115" text-anchor="middle" font-size="8" fill="${muted}">${escape(item.caption)}</text></g>`
    );
  });
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="catalog-title catalog-description">` +
    `<title id="catalog-title">${escape(title)}</title><desc id="catalog-description">${items.length} registered entries; static ${mode} previews sized from renderer bounds.</desc>` +
    `<rect width="100%" height="100%" fill="${background}"/><g font-family="Arial, sans-serif">` +
    `<text x="20" y="31" font-size="20" font-weight="bold" fill="${ink}">${escape(title)}</text>` +
    `<text x="20" y="52" font-size="11" fill="${muted}">${items.length} registered entries · ${mode} · seasonal colors · static poses</text>` +
    tiles.join('') +
    '</g></svg>'
  );
}

export async function generateCatalog(outputDirectory: string): Promise<void> {
  await mkdir(outputDirectory, { recursive: true });
  const ordinary: PreviewItem[] = ASSET_CATALOG.map((entry) => ({
    ...entry,
    caption: `${entry.category} · ${entry.style} · ${entry.season}`,
    render: (colors) => renderCatalogAsset(entry.id, colors),
  }));
  const wonders: PreviewItem[] = EPIC_CATALOG.map((entry) => ({
    ...entry,
    caption: `${entry.tier} · ${entry.category}`,
    render: (colors) => EPIC_RENDERERS[entry.id](0, 0, colors),
  }));
  const groups = [
    { name: 'assets', title: 'Maeul asset catalog', items: ordinary },
    {
      name: 'korean',
      title: 'Korean village · original Maeul artwork',
      items: ordinary.filter((entry) => entry.caption.includes('korean')),
    },
    { name: 'wonders', title: 'Maeul Wonders · separate landmark catalog', items: wonders },
  ];
  const galleryItems = createGalleryItems();
  const pixelGalleryItems = createGalleryItems('pixel');
  const galleryRecords = galleryItems.map((item) => item.record);
  for (const mode of ['dark', 'light'] as const) {
    for (const group of groups) {
      const svg = catalogSVG(group.items, group.title, mode);
      await writeFile(resolve(outputDirectory, `${group.name}-${mode}.svg`), svg);
      const png = new Resvg(svg, { font: { loadSystemFonts: true, defaultFontFamily: 'Arial' } })
        .render()
        .asPng();
      await writeFile(resolve(outputDirectory, `${group.name}-${mode}.png`), png);
    }
  }
  await writeFile(
    resolve(outputDirectory, 'catalog.json'),
    JSON.stringify(
      {
        assets: { counts: ASSET_CATALOG_COUNTS, entries: ASSET_CATALOG },
        wonders: { counts: EPIC_CATALOG_COUNTS, entries: EPIC_CATALOG },
        gallery: {
          familyCounts: countCatalogFamilies(galleryRecords),
          records: galleryRecords,
        },
      },
      null,
      2,
    ) + '\n',
  );
  await Promise.all([
    writeFile(
      resolve(outputDirectory, 'index.html'),
      renderCatalogPage(galleryRecords, countCatalogFamilies(galleryRecords)),
    ),
    writeFile(
      resolve(outputDirectory, 'catalog-sprite-dark.svg'),
      renderCatalogSprite(galleryItems, 'dark'),
    ),
    writeFile(
      resolve(outputDirectory, 'catalog-sprite-light.svg'),
      renderCatalogSprite(galleryItems, 'light'),
    ),
    writeFile(
      resolve(outputDirectory, 'catalog-sprite-pixel-dark.svg'),
      renderCatalogSprite(pixelGalleryItems, 'dark'),
    ),
    writeFile(
      resolve(outputDirectory, 'catalog-sprite-pixel-light.svg'),
      renderCatalogSprite(pixelGalleryItems, 'light'),
    ),
    copyFile(
      fileURLToPath(new URL('./catalog/client.css', import.meta.url)),
      resolve(outputDirectory, 'catalog.css'),
    ),
    copyFile(
      fileURLToPath(new URL('./catalog/client.js', import.meta.url)),
      resolve(outputDirectory, 'catalog.js'),
    ),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const outputDirectory = resolve(
    process.argv[2] ?? '.orca/maeul-improvements/evidence/assets-catalog',
  );
  await generateCatalog(outputDirectory);
  console.log(
    `Generated ${ASSET_CATALOG_COUNTS.total} assets and ${EPIC_CATALOG_COUNTS.total} Wonders in ${outputDirectory}`,
  );
}
