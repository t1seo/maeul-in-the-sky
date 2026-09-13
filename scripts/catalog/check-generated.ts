import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { z } from 'zod';
import { ASSET_CATALOG, ASSET_CATALOG_COUNTS } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG, EPIC_CATALOG_COUNTS } from '../../src/themes/terrain/epics.js';
import { createGalleryItems } from './gallery-items.js';
import { countCatalogFamilies } from './model.js';
import { renderCatalogPage } from './page.js';
import { renderCatalogSprite } from './sprite.js';
import { CATALOG_FAMILIES, CATALOG_STYLES } from './types.js';

const SeasonSchema = z.enum(['all', 'winter', 'spring', 'summer', 'autumn']);
const BoundsSchema = z.object({
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive().finite(),
  height: z.number().positive().finite(),
});
const RecordSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['asset', 'wonder']),
  displayName: z.string().min(1),
  description: z.string().min(1),
  family: z.enum(CATALOG_FAMILIES),
  style: z.enum(CATALOG_STYLES),
  season: SeasonSchema,
  category: z.string().min(1),
  bounds: BoundsSchema,
});
const CatalogFileSchema = z.object({
  assets: z.object({
    counts: z.object({
      total: z.number().int(),
      classic: z.number().int(),
      korean: z.number().int(),
    }),
    entries: z.array(z.object({ id: z.string().min(1) }).loose()),
  }),
  wonders: z.object({
    counts: z.object({
      total: z.number().int(),
      rare: z.number().int(),
      epic: z.number().int(),
      legendary: z.number().int(),
    }),
    entries: z.array(z.object({ id: z.string().min(1) }).loose()),
  }),
  gallery: z.object({
    familyCounts: z.object({
      nature: z.number().int(),
      building: z.number().int(),
      decoration: z.number().int(),
      wonder: z.number().int(),
      korean: z.number().int(),
    }),
    records: z.array(RecordSchema),
  }),
});

export class CatalogDriftError extends Error {
  readonly target: string;

  constructor(target: string, message: string) {
    super(`${target}: ${message}`);
    this.name = 'CatalogDriftError';
    this.target = target;
  }
}

function requireMatch(target: string, actual: unknown, expected: unknown): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new CatalogDriftError(target, 'generated output differs from current catalog sources');
  }
}

export async function verifyGeneratedCatalog(outputDirectory: string): Promise<{
  readonly assets: number;
  readonly wonders: number;
  readonly records: number;
}> {
  const [jsonSource, html, darkSprite, lightSprite, outputCss, outputJs, sourceCss, sourceJs] =
    await Promise.all([
      readFile(resolve(outputDirectory, 'catalog.json'), 'utf8'),
      readFile(resolve(outputDirectory, 'index.html'), 'utf8'),
      readFile(resolve(outputDirectory, 'catalog-sprite-dark.svg'), 'utf8'),
      readFile(resolve(outputDirectory, 'catalog-sprite-light.svg'), 'utf8'),
      readFile(resolve(outputDirectory, 'catalog.css'), 'utf8'),
      readFile(resolve(outputDirectory, 'catalog.js'), 'utf8'),
      readFile(fileURLToPath(new URL('./client.css', import.meta.url)), 'utf8'),
      readFile(fileURLToPath(new URL('./client.js', import.meta.url)), 'utf8'),
    ]);
  const generated = CatalogFileSchema.parse(JSON.parse(jsonSource));
  const galleryItems = createGalleryItems();
  const records = galleryItems.map((item) => item.record);
  requireMatch('asset counts', generated.assets.counts, ASSET_CATALOG_COUNTS);
  requireMatch('asset entries', generated.assets.entries, ASSET_CATALOG);
  requireMatch('Wonder counts', generated.wonders.counts, EPIC_CATALOG_COUNTS);
  requireMatch('Wonder entries', generated.wonders.entries, EPIC_CATALOG);
  requireMatch('gallery records', generated.gallery.records, records);
  requireMatch('family totals', generated.gallery.familyCounts, countCatalogFamilies(records));
  requireMatch('index.html', html, renderCatalogPage(records, countCatalogFamilies(records)));
  requireMatch('dark sprite', darkSprite, renderCatalogSprite(galleryItems, 'dark'));
  requireMatch('light sprite', lightSprite, renderCatalogSprite(galleryItems, 'light'));
  requireMatch('catalog.css', outputCss, sourceCss);
  requireMatch('catalog.js', outputJs, sourceJs);
  return { assets: ASSET_CATALOG.length, wonders: EPIC_CATALOG.length, records: records.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const outputDirectory = resolve(process.argv[2] ?? 'docs/demo/catalog');
  const counts = await verifyGeneratedCatalog(outputDirectory);
  console.log(
    `Catalog is current: ${counts.assets} ordinary assets + ${counts.wonders} Wonders (${counts.records} cards).`,
  );
}
