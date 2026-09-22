import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets/catalog.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics/catalog.js';
import { readModelInventory } from '../../scripts/authored/inventory.js';
import {
  requestedAssetBudget,
  verifyRequestedAssetBudget,
} from '../../scripts/authored/inventory-budget.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { authoredAsset } from '../../src/tour/authored/catalog.js';
import { createCoverage } from '../../scripts/authored/coverage.js';

const ROOT = resolve('docs/demo/tour/models');
const COVERAGE = z.object({
  version: z.literal(1),
  catalog: z.array(
    z.object({
      id: z.string(),
      label: z.string().min(1),
      kind: z.enum(['ordinary', 'wonder']),
      status: z.enum(['authored', 'hybrid', 'retained']),
      reason: z.string().min(20),
      models: z.array(z.object({ file: z.string(), node: z.string().optional() })),
    }),
  ),
  generated: z.array(
    z.object({ id: z.string(), status: z.literal('retained'), reason: z.string().min(20) }),
  ),
});

describe('published authored inventory coverage', () => {
  it('keeps the sample within the transfer and decoded texture budgets when only required models load', async () => {
    const model = parseTourSnapshot(sampleSnapshot());
    const budget = await requestedAssetBudget(model, readModelInventory(ROOT), ROOT);
    expect(() => verifyRequestedAssetBudget(budget)).not.toThrow();
    expect(budget.files.some((file) => file.file.startsWith('nature/'))).toBe(true);
    expect(budget.files.some((file) => file.file.startsWith('village/'))).toBe(true);
    expect(budget.bytes).toBeGreaterThan(0);
  });
  it('accounts for every catalog ID and generated scenery when the public ledger is read', () => {
    const expected = [...ASSET_CATALOG, ...EPIC_CATALOG].map((entry) => entry.id).sort();
    const report = COVERAGE.parse(JSON.parse(readFileSync(resolve(ROOT, 'coverage.json'), 'utf8')));
    expect(report.catalog).toEqual(createCoverage(authoredAsset).catalog);
    expect(report.catalog.map((entry) => entry.id).sort()).toEqual(expected);
    expect(report.catalog.filter((entry) => entry.kind === 'ordinary')).toHaveLength(210);
    expect(report.catalog.filter((entry) => entry.kind === 'wonder')).toHaveLength(30);
    expect(report.generated.map((entry) => entry.id)).toEqual(
      expect.arrayContaining([
        'terrain',
        'grass',
        'water',
        'particles',
        'paths',
        'shore-pebbles',
        'meadow-flowers',
      ]),
    );
    for (const entry of report.catalog)
      expect(entry.models.length > 0).toBe(entry.status !== 'retained');
  });

  it('credits every creator, source, license and adaptation when the three inventories are published', () => {
    const models = readModelInventory(ROOT);
    const credits = readFileSync(resolve(ROOT, 'CREDITS.md'), 'utf8');
    const page = readFileSync(resolve(ROOT, '../credits.html'), 'utf8');
    expect(page).toContain('<h1>3D asset credits</h1>');
    for (const model of models) {
      expect(credits).toContain(model.source.creator);
      expect(credits).toContain(model.source.modelUrl);
      expect(credits).toContain(model.source.licenseUrl);
      expect(credits).toContain(model.relativeFile);
      expect(credits).toContain(model.relativeLicenseFile);
      expect(page).toContain(model.source.modelUrl.replaceAll('&', '&amp;'));
      expect(page).toContain(model.source.licenseUrl);
      expect(page).toContain(model.relativeFile);
      for (const change of model.modifications)
        expect(credits).toContain(change.replace(/[[\]<>|]/gu, (character) => `\\${character}`));
      if (model.source.disclosure) expect(credits).toContain(model.source.disclosure);
    }
  });
});
