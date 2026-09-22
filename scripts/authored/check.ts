import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { format } from 'prettier';
import { authoredAsset } from '../../src/tour/authored/catalog.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { coverageMarkdown, createCoverage, verifyCoverage } from './coverage.js';
import { creditsHtml, creditsMarkdown } from './credits.js';
import {
  AuthoredInventoryError,
  assertModelBytes,
  verifyModelInventory,
  verifyCreditFiles,
} from './inventory.js';
import { requestedAssetBudget, verifyRequestedAssetBudget } from './inventory-budget.js';

export async function checkAuthoredAssets(root = resolve('docs/demo/tour'), write = false) {
  const modelRoot = resolve(root, 'models');
  const models = verifyModelInventory(modelRoot);
  const sampleBudget = await requestedAssetBudget(
    parseTourSnapshot(sampleSnapshot()),
    models,
    modelRoot,
  );
  verifyRequestedAssetBudget(sampleBudget);
  const coverage = createCoverage(authoredAsset);
  verifyCoverage(coverage, models);
  const references = new Map(
    coverage.catalog
      .flatMap((entry) => entry.models)
      .map((model) => [`${model.file}:${model.node ?? ''}`, model]),
  );
  for (const reference of references.values()) {
    const model = models.find((entry) => entry.relativeFile === reference.file);
    if (!model) throw new AuthoredInventoryError(reference.file, 'Missing referenced model');
    assertModelBytes(readFileSync(resolve(modelRoot, reference.file)), {
      ...model,
      ...(reference.node ? { node: reference.node } : {}),
    });
  }
  const files = new Map([
    ['models/coverage.json', `${JSON.stringify(coverage, null, 2)}\n`],
    ['models/coverage.md', coverageMarkdown(coverage)],
    ['models/CREDITS.md', creditsMarkdown(models)],
    ['credits.html', await format(creditsHtml(models), { parser: 'html' })],
  ]);
  for (const [file, contents] of files) {
    const target = resolve(root, file);
    if (write) writeFileSync(target, contents);
    else if (readFileSync(target, 'utf8') !== contents)
      throw new AuthoredInventoryError(
        file,
        'Generated asset documentation is stale; run npm run prepare:authored',
      );
  }
  verifyCreditFiles(modelRoot);
  const counts = Object.fromEntries(
    ['authored', 'hybrid', 'retained'].map((status) => [
      status,
      coverage.catalog.filter((entry) => entry.status === status).length,
    ]),
  );
  return {
    models: models.length,
    files: new Set(models.map((model) => model.relativeFile)).size,
    catalog: coverage.catalog.length,
    counts,
    sampleBudget,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(
    JSON.stringify(
      await checkAuthoredAssets(resolve('docs/demo/tour'), process.argv.includes('--write')),
    ),
  );
}
