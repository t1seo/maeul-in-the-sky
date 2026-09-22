import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, type Page, type Request, type Response } from '@playwright/test';
import { z } from 'zod';

const MODEL_FILES = [
  'squirrel.glb',
  'cow.glb',
  'deer.glb',
  'fox.glb',
  'horse.glb',
  'donkey.glb',
  'sheep.glb',
  'pig.glb',
] as const;
const manifestSchema = z.object({
  version: z.literal(1),
  models: z
    .array(
      z.object({
        file: z.enum(MODEL_FILES),
        bytes: z.number().int().positive(),
        sha256: z.string().regex(/^[a-f0-9]{64}$/u),
      }),
    )
    .length(MODEL_FILES.length),
});
type ModelRecord = z.infer<typeof manifestSchema>['models'][number];

function assertModelBytes(bytes: Buffer, model: ModelRecord): void {
  assert.equal(bytes.length, model.bytes, `${model.file}: packaged byte length`);
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'glTF', `${model.file}: GLB magic`);
  assert.equal(bytes.readUInt32LE(4), 2, `${model.file}: GLB version`);
  assert.equal(bytes.readUInt32LE(8), bytes.length, `${model.file}: GLB declared length`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), model.sha256, model.file);
}

export function assertTourAssets(packageRoot: string): void {
  const root = join(packageRoot, 'dist/demo/tour/models');
  const manifest = manifestSchema.parse(
    JSON.parse(readFileSync(join(root, 'manifest.json'), 'utf8')),
  );
  assert.deepEqual(new Set(manifest.models.map((model) => model.file)), new Set(MODEL_FILES));
  for (const model of manifest.models)
    assertModelBytes(readFileSync(join(root, model.file)), model);
  for (const file of [
    'CREDITS.md',
    'licenses/CC0-1.0.txt',
    'licenses/CC-BY-3.0.txt',
    'licenses/Quaternius-ultimate-pack.txt',
  ]) {
    assert.ok(readFileSync(join(root, file)).length > 0, `Missing wildlife notice: ${file}`);
  }
}

export async function smokeTour(page: Page, previewUrl: string): Promise<void> {
  const root = `${previewUrl}/tour/`;
  const manifestResponse = await page.request.get(`${root}models/manifest.json`);
  assert.equal(manifestResponse.status(), 200);
  const manifest = manifestSchema.parse(await manifestResponse.json());
  for (const model of manifest.models) {
    const response = await page.request.get(`${root}models/${model.file}`);
    assert.equal(response.status(), 200, `${model.file}: preview route`);
    assert.equal(response.headers()['content-type'], 'model/gltf-binary');
    assertModelBytes(await response.body(), model);
  }

  const responses = new Map<string, Response>();
  const external: string[] = [];
  const errors: string[] = [];
  const recordResponse = (response: Response): void => {
    const url = new URL(response.url());
    if (url.pathname.endsWith('.glb'))
      responses.set(url.pathname.split('/').at(-1) ?? '', response);
  };
  const recordRequest = (request: Request): void => {
    const url = new URL(request.url());
    if (url.protocol.startsWith('http') && url.origin !== new URL(previewUrl).origin)
      external.push(url.href);
  };
  const recordError = (error: Error): void => {
    errors.push(error.message);
  };
  page.on('response', recordResponse);
  page.on('request', recordRequest);
  page.on('pageerror', recordError);
  try {
    await page.goto(root);
    await expect(page.locator('#loading-screen')).toBeHidden({ timeout: 30_000 });
    await expect(page.locator('#source-tag')).toContainText('SAMPLE');
    await expect(page.locator('#village')).toBeVisible();
    for (const file of ['cow.glb', 'squirrel.glb']) {
      const response = responses.get(file);
      const model = manifest.models.find((entry) => entry.file === file);
      assert.ok(response, `${file}: the real tour must request the model`);
      assert.ok(model);
      assert.equal(response.status(), 200);
      assertModelBytes(await response.body(), model);
    }
    await page.getByRole('button', { name: 'Walk', exact: true }).click();
    await expect(page.locator('body')).toHaveAttribute('data-mode', 'walk');
    await page.getByRole('button', { name: 'Controls and help', exact: true }).click();
    await expect(page.locator('#help-panel a[href="./credits.html"]')).toBeVisible();
    await page.goto(`${root}credits.html`);
    await expect(
      page.getByRole('heading', { name: 'Wildlife credits', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Poly by Google', exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Quaternius', exact: true })).toBeVisible();
    assert.deepEqual(external, [], 'The packaged tour must load without a runtime CDN');
    assert.deepEqual(errors, []);
    console.log(
      'PASS packed tour: eight verified GLBs, real wildlife loading, walking and credits',
    );
  } finally {
    page.off('response', recordResponse);
    page.off('request', recordRequest);
    page.off('pageerror', recordError);
  }
}
