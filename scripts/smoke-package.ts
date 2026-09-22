import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { smokeAction, smokeCli, smokeModules } from './smoke/adapters.js';
import { smokeBrowser, smokePreview } from './smoke/browser.js';
import { nodeRuntime } from './smoke/runtime.js';

const repositoryRoot = resolve(import.meta.dirname, '..');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'maeul-package-smoke-'));
try {
  const node20 = nodeRuntime(20);
  const node24 = nodeRuntime(24);
  execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', temporaryDirectory], {
    cwd: repositoryRoot,
    stdio: 'pipe',
  });
  const archive = readdirSync(temporaryDirectory).find((file) => file.endsWith('.tgz'));
  assert.ok(archive, 'npm pack did not produce an archive');
  const unpacked = join(temporaryDirectory, 'unpacked');
  mkdirSync(unpacked);
  execFileSync('tar', ['-xzf', join(temporaryDirectory, archive), '-C', unpacked]);
  const packageRoot = join(unpacked, 'package');
  const fixture = join(repositoryRoot, 'tests/fixtures/improvements/partial-2025.json');
  for (const path of [
    'dist/resvg.wasm',
    'dist/fonts/NotoSansKR.ttf',
    'dist/fonts/OFL.txt',
    'dist/demo/app/main.js',
    'dist/demo/versions/classic/browser.js',
    'dist/demo/versions/classic/metadata.json',
    'dist/demo/world/index.html',
    'dist/demo/world/app/main.js',
    'dist/demo/world/licenses/three-MIT.txt',
    'dist/demo/world/licenses/ky-MIT.txt',
    'dist/demo/tour/index.html',
    'dist/demo/tour/tour.css',
    'dist/demo/tour/app/main.js',
  ]) {
    assert.ok(statSync(join(packageRoot, path)).size > 0, `Missing runtime asset: ${path}`);
  }
  smokeAction(packageRoot, node24, fixture);
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--omit=dev', '--no-package-lock', '--no-audit'],
    {
      cwd: packageRoot,
      stdio: 'pipe',
    },
  );
  smokeCli(packageRoot, node20, fixture);
  smokeModules(packageRoot, node20, fixture);
  await smokeBrowser(packageRoot, fixture);
  await smokePreview(packageRoot, node20);
  console.log('Package smoke passed: every public adapter executed from the npm archive.');
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
