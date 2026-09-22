import assert from 'node:assert/strict';
import { expect, type Page, type Request, type Response } from '@playwright/test';
import { assertModelBytes } from '../authored/inventory.js';
import { smokeTourAssets } from './tour-assets.js';
export { assertTourAssets } from './tour-assets.js';

export async function smokeTour(page: Page, previewUrl: string): Promise<void> {
  const root = `${previewUrl}/tour/`;
  const models = await smokeTourAssets(page, root);

  const responses = new Map<string, Response>();
  const external: string[] = [];
  const errors: string[] = [];
  const recordResponse = (response: Response): void => {
    const url = new URL(response.url());
    if (url.pathname.endsWith('.glb'))
      responses.set(url.pathname.split('/models/')[1] ?? '', response);
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
    assert.ok(
      [...responses.keys()].some((file) => file.startsWith('nature/')),
      'The real tour requests authored nature',
    );
    assert.ok(
      [...responses.keys()].some((file) => file.startsWith('village/')),
      'The real tour requests authored village models',
    );
    for (const [file, response] of responses) {
      const model = models.find((entry) => entry.relativeFile === file);
      assert.ok(model, `${file}: loaded models must have provenance`);
      assert.equal(response.status(), 200);
      assertModelBytes(await response.body(), model);
    }
    for (const file of ['cow.glb', 'squirrel.glb']) {
      const response = responses.get(file);
      const model = models.find((entry) => entry.relativeFile === file);
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
      page.getByRole('heading', { name: '3D asset credits', exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Poly by Google', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Quaternius', { exact: true }).first()).toBeVisible();
    assert.deepEqual(external, [], 'The packaged tour must load without a runtime CDN');
    assert.deepEqual(errors, []);
    console.log(
      `PASS packed tour: ${models.length} verified authored records, local model loading, walking and credits`,
    );
  } finally {
    page.off('response', recordResponse);
    page.off('request', recordRequest);
    page.off('pageerror', recordError);
  }
}
