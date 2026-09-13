import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { chromium, type Browser } from '@playwright/test';
import { z } from 'zod';
import { startQaServer } from '../qa/server.js';
import { cleanEnvironment } from './runtime.js';

export async function smokeBrowser(packageRoot: string, fixture: string) {
  const manifest = z
    .object({
      exports: z.object({ './browser': z.object({ import: z.string().startsWith('./') }) }),
    })
    .parse(JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')));
  const importMap = JSON.stringify({
    imports: { 'maeul-in-the-sky/browser': manifest.exports['./browser'].import },
  });
  writeFileSync(
    join(packageRoot, 'browser-smoke.html'),
    `<!doctype html><meta charset="utf-8"><title>Package browser smoke</title>
<script type="importmap">${importMap}</script><main></main>`,
  );
  const server = await startQaServer({ root: packageRoot, port: 0 });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${server.url}/browser-smoke.html`);
    const result = await page.evaluate(
      async (text) => {
        const specifier = 'maeul-in-the-sky/browser';
        const api: typeof import('../../src/browser.js') = await import(specifier);
        const snapshot = api.parseSnapshot(text);
        const data = api.snapshotToContributionData(snapshot);
        const output = api.renderTerrain(data, {
          ...snapshot.settings,
          motion: 'off',
          width: 840,
          height: 240,
        });
        const root = document.querySelector('main');
        if (!root) throw new Error('Missing browser fixture root');
        root.innerHTML = output.dark;
        return {
          total: output.metadata.stats.total,
          expected: data.weeks
            .flatMap((week) => week.days)
            .reduce((sum, day) => sum + day.count, 0),
          days: output.metadata.dataDayCount,
          roundtrip:
            api.serializeSnapshot(api.parseSnapshot(api.serializeSnapshot(snapshot))) ===
            api.serializeSnapshot(snapshot),
          nodeGlobals: ['process', 'require', 'Buffer'].filter((name) => name in globalThis),
        };
      },
      readFileSync(fixture, 'utf8'),
    );
    assert.equal(result.total, result.expected);
    assert.ok(result.days > 0);
    assert.equal(result.roundtrip, true);
    assert.deepEqual(result.nodeGlobals, []);
    assert.equal(await page.locator('main > svg').isVisible(), true);
    assert.deepEqual(errors, []);
    assert.ok((await page.locator('main > svg').screenshot()).length > 1000);
    console.log('PASS Chromium: packed browser import, actual render and snapshot roundtrip');
  } finally {
    await Promise.all([browser?.close(), server.close()]);
  }
}

export async function smokePreview(packageRoot: string, node20: string) {
  const driver = join(packageRoot, 'preview-smoke.mjs');
  writeFileSync(
    driver,
    `import { startPreviewServer } from 'maeul-in-the-sky';
const server = await startPreviewServer({ port: 0, token: '' });
console.log(JSON.stringify({url: server.url}));
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => { void server.close(); });\n`,
  );
  const child = spawn(node20, [driver], {
    cwd: packageRoot,
    env: cleanEnvironment(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stderr = '';
  child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
    stderr += chunk;
  });
  let browser: Browser | undefined;
  try {
    browser = await chromium.launch();
    const url = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(
        () => reject(new Error(`Preview startup timed out: ${stderr}`)),
        15_000,
      );
      let stdout = '';
      child.stdout.setEncoding('utf8').on('data', (chunk: string) => {
        stdout += chunk;
        const match = stdout.match(/"url":"(http:\/\/127\.0\.0\.1:\d+)"/);
        if (match) {
          clearTimeout(timeout);
          resolve(match[1]);
        }
      });
      child.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
      child.once('exit', (code) => {
        clearTimeout(timeout);
        reject(new Error(`Preview exited ${code}: ${stderr}`));
      });
    });
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const missing: string[] = [];
    page.on('response', (response) => {
      if (response.status() >= 400) missing.push(response.url());
    });
    await page.goto(url);
    await page.locator('#settings-form').waitFor({ state: 'visible' });
    await page.locator('#live-terrain > svg').waitFor({ state: 'visible' });
    const health = await page.request.get(`${url}/api/health`);
    assert.equal(health.status(), 200);
    assert.deepEqual(await health.json(), { status: 'ok', capabilities: { github: false } });
    for (const preset of ['nature', 'balanced', 'civilization']) {
      for (const mode of ['dark', 'light']) {
        const asset = await page.request.get(`${url}/assets/preset-${preset}-${mode}.svg`);
        assert.equal(asset.status(), 200);
        assert.match(asset.headers()['content-type'] ?? '', /svg/);
      }
    }
    const noToken = await page.request.post(`${url}/api/preview`, {
      headers: { Origin: url },
      data: { username: 'octocat', year: 2025 },
    });
    assert.equal(noToken.status(), 503);
    assert.deepEqual(errors, []);
    assert.deepEqual(missing, []);
    console.log(
      'PASS packed local preview Node 20: browser UI, bundle/styles, six SVGs, health, no-token 503',
    );
  } finally {
    try {
      await browser?.close();
    } finally {
      if (child.exitCode === null) {
        child.kill('SIGTERM');
        await once(child, 'exit');
      }
    }
  }
}
