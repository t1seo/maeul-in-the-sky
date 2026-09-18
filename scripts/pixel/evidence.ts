import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { Resvg } from '@resvg/resvg-js';
import { getSeasonalPalette100, getTerrainPalette100 } from '../../src/themes/terrain/palette.js';
import type { TerrainPalette100 } from '../../src/themes/terrain/palette.js';
import { renderPixelAsset } from '../../src/themes/terrain/pixel/render.js';
import { PIXEL_SPRITES } from '../../src/themes/terrain/pixel/generated/index.js';
import { pixelSources } from './sources.js';
import type { PixelSource } from './sources.js';
import { PIXEL_OUTPUT, PIXEL_ROOT } from './fingerprint.js';

const output = resolve(PIXEL_ROOT, '.orca/asset-overhaul/lanes/pixel');
mkdirSync(output, { recursive: true });
const sources = pixelSources();
const light = getTerrainPalette100('light');
const dark = getTerrainPalette100('dark');
type Column = {
  readonly label: string;
  readonly palette: TerrainPalette100;
  readonly pixel: boolean;
};

function saveSheet(name: string, rows: readonly PixelSource[], columns: readonly Column[]): void {
  const width = 150 + columns.length * 190;
  const height = 50 + rows.length * 170;
  const labels = columns
    .map(
      (column, index) =>
        `<text x="${150 + index * 190 + 95}" y="28" text-anchor="middle">${column.label}</text>`,
    )
    .join('');
  const art = rows
    .map((source, row) => {
      const label = `<text x="12" y="${105 + row * 170}">${source.id}</text>`;
      return (
        label +
        columns
          .map((column, index) => {
            const x = 150 + index * 190;
            const y = 50 + row * 170;
            const background = column.palette === dark ? '#16222a' : '#eef2e8';
            const scale = 6;
            const cx = x + 95 - (source.bounds.x + source.bounds.width / 2) * scale;
            const cy = y + 85 - (source.bounds.y + source.bounds.height / 2) * scale;
            const rendered = column.pixel
              ? renderPixelAsset(source.id, 0, 0, column.palette.assets)
              : source.render(column.palette.assets, 0);
            return `<rect x="${x}" y="${y}" width="188" height="168" fill="${background}"/><g transform="translate(${cx},${cy}) scale(${scale})">${rendered}</g>`;
          })
          .join('')
      );
    })
    .join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#ffffff"/><g font-family="sans-serif" font-size="13" fill="#203a2c">${labels}${art}</g></svg>`;
  writeFileSync(resolve(output, `${name}.svg`), svg);
  writeFileSync(resolve(output, `${name}.png`), new Resvg(svg).render().asPng());
}

const representativeIds = [
  'pine',
  'hanok',
  'ricePaddy',
  'choga',
  'sotdae',
  'pagoda',
  'giantWaterfall',
];
saveSheet(
  'representative-comparison',
  representativeIds.flatMap((id) => sources.filter((source) => source.id === id)),
  [
    { label: 'Miniature / light', palette: light, pixel: false },
    { label: 'Pixel / light', palette: light, pixel: true },
    { label: 'Pixel / dark', palette: dark, pixel: true },
  ],
);
saveSheet(
  'season-pixel',
  sources.filter((source) => ['deciduous', 'ricePaddy', 'pine', 'hanok'].includes(source.id)),
  [
    { label: 'Spring', palette: getSeasonalPalette100('light', 15, 0), pixel: true },
    { label: 'Summer', palette: getSeasonalPalette100('light', 28, 0), pixel: true },
    { label: 'Autumn', palette: getSeasonalPalette100('light', 42, 0), pixel: true },
    { label: 'Winter', palette: getSeasonalPalette100('light', 2, 0), pixel: true },
  ],
);

function metrics(svg: string) {
  return {
    bytes: Buffer.byteLength(svg),
    gzipBytes: gzipSync(svg).byteLength,
    nodes: (svg.match(/<[a-z][^>]*>/g) ?? []).length,
  };
}
const catalog = sources.map((source) => {
  const pixel = renderPixelAsset(source.id, 0, 0, light.assets);
  const sprite = PIXEL_SPRITES[source.id][0];
  return {
    id: source.id,
    variants: source.variants,
    pixels: sprite.pixels,
    layers: sprite.layers.length,
    rectangles: sprite.layers.reduce((sum, layer) => sum + (layer.d.match(/M/g) ?? []).length, 0),
    miniature: metrics(source.render(light.assets, 0)),
    pixel: metrics(pixel),
  };
});
const files = readdirSync(PIXEL_OUTPUT).filter((file) => file.endsWith('.ts'));
const combined = Buffer.concat(files.map((file) => readFileSync(resolve(PIXEL_OUTPUT, file))));
writeFileSync(
  resolve(output, 'metrics.json'),
  JSON.stringify(
    {
      assets: sources.length,
      variants: sources.reduce((sum, source) => sum + source.variants, 0),
      generatedSourceBytes: combined.byteLength,
      generatedSourceGzipBytes: gzipSync(combined).byteLength,
      catalog,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Wrote pixel PNG/SVG evidence and metrics for ${sources.length} assets to ${output}`);
