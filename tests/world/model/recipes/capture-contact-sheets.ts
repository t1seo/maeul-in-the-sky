import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { chromium } from '@playwright/test';
import { build } from 'esbuild';

const evidence = '.orca/world-expansion/evidence/recipes';
await build({
  entryPoints: ['tests/world/model/recipes/contact-sheet.ts'],
  bundle: true,
  format: 'esm',
  outfile: `${evidence}/contact-sheet.js`,
});
const html = await readFile('tests/world/model/recipes/contact-sheet.html');
const script = await readFile(`${evidence}/contact-sheet.js`);
const browser = await chromium.launch({ headless: true });
const server = createServer((request, response) => {
  const javascript = request.url === '/contact-sheet.js';
  response.writeHead(200, { 'content-type': javascript ? 'text/javascript' : 'text/html' });
  response.end(javascript ? script : html);
});
try {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address();
  assert(address && typeof address !== 'string');
  const page = await browser.newPage({
    viewport: { width: 1080, height: 850 },
    deviceScaleFactor: 1,
  });
  const errors: string[] = [];
  const results: {
    readonly group: string;
    readonly angle: string;
    readonly path: string;
    readonly models: string | undefined;
    readonly webgl: string | undefined;
  }[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const group of ['nature', 'buildings', 'life']) {
    for (const angle of ['front', 'rear']) {
      await page.goto(`http://127.0.0.1:${address.port}/?group=${group}&angle=${angle}`);
      await page.locator('html[data-ready="true"]').waitFor();
      const metadata = await page
        .locator('html')
        .evaluate((element) => ({ models: element.dataset.models, webgl: element.dataset.webgl }));
      const path = `${evidence}/${group}-${angle}.png`;
      await page.screenshot({ path, fullPage: true });
      results.push({ group, angle, path, ...metadata });
    }
  }
  await writeFile(`${evidence}/browser-qa.json`, JSON.stringify({ results, errors }, null, 2));
  assert.equal(results.length, 6);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log(JSON.stringify({ results, errors }, null, 2));
} finally {
  await browser.close();
  await new Promise<void>((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve())),
  );
}
