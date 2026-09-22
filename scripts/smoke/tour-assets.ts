import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Page } from '@playwright/test';
import {
  assertModelBytes,
  MODEL_COLLECTIONS,
  parseModelManifest,
  verifyModelInventory,
  verifyCreditFiles,
  type InventoryModel,
} from '../authored/inventory.js';

export function assertTourAssets(packageRoot: string): void {
  const root = join(packageRoot, 'dist/demo/tour/models');
  verifyModelInventory(root);
  verifyCreditFiles(root);
  for (const file of ['CREDITS.md', 'coverage.json', 'coverage.md']) {
    assert.ok(readFileSync(join(root, file)).length > 0, `Missing 3D asset notice: ${file}`);
  }
}

export async function smokeTourAssets(page: Page, tourRoot: string) {
  const models: InventoryModel[] = [];
  for (const collection of MODEL_COLLECTIONS) {
    const directory = collection ? `${collection}/` : '';
    const response = await page.request.get(`${tourRoot}models/${directory}manifest.json`);
    assert.equal(response.status(), 200, `${directory}manifest.json: preview route`);
    const value: unknown = await response.json();
    models.push(...parseModelManifest(value, collection));
  }
  const files = new Set<string>();
  for (const model of models) {
    if (files.has(model.relativeFile)) continue;
    files.add(model.relativeFile);
    const response = await page.request.get(`${tourRoot}models/${model.relativeFile}`);
    assert.equal(response.status(), 200, `${model.relativeFile}: preview route`);
    assert.equal(response.headers()['content-type'], 'model/gltf-binary');
    assertModelBytes(await response.body(), model);
  }
  for (const file of new Set(models.map((model) => model.relativeLicenseFile))) {
    const license = await page.request.get(`${tourRoot}models/${file}`);
    assert.equal(license.status(), 200, `${file}: preview route`);
    assert.ok((await license.text()).trim().length > 0);
  }
  return models;
}
