import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

interface PackageManifest {
  version: string;
}

function runNode(args: string[], cwd: string, environment = process.env) {
  return spawnSync(process.execPath, args, {
    cwd,
    env: environment,
    encoding: 'utf8',
  });
}

const repositoryRoot = join(import.meta.dirname, '..');
const temporaryDirectory = mkdtempSync(join(tmpdir(), 'maeul-package-smoke-'));

try {
  execFileSync('npm', ['pack', '--ignore-scripts', '--pack-destination', temporaryDirectory], {
    cwd: repositoryRoot,
    stdio: 'pipe',
  });

  const archive = readdirSync(temporaryDirectory).find((file) => file.endsWith('.tgz'));
  assert.ok(archive, 'npm pack did not produce an archive');

  const unpackedDirectory = join(temporaryDirectory, 'unpacked');
  mkdirSync(unpackedDirectory);
  execFileSync('tar', ['-xzf', join(temporaryDirectory, archive), '-C', unpackedDirectory]);

  const packageRoot = join(unpackedDirectory, 'package');
  execFileSync(
    'npm',
    ['install', '--ignore-scripts', '--omit=dev', '--no-package-lock', '--no-audit'],
    { cwd: packageRoot, stdio: 'pipe' },
  );
  const manifest = JSON.parse(
    readFileSync(join(packageRoot, 'package.json'), 'utf8'),
  ) as PackageManifest;
  const cliPath = join(packageRoot, 'dist', 'index.js');
  const shebangCount = readFileSync(cliPath, 'utf8')
    .split('\n')
    .filter((line) => line === '#!/usr/bin/env node').length;
  assert.equal(shebangCount, 1, 'packaged CLI must contain exactly one shebang');

  const version = runNode([cliPath, '--version'], packageRoot);
  assert.equal(version.status, 0, version.stderr);
  assert.equal(version.stdout.trim(), manifest.version);

  const invalidYear = runNode([cliPath, '--user', 'smoke-user', '--year', 'invalid'], packageRoot);
  assert.equal(invalidYear.status, 1);
  assert.match(invalidYear.stderr, /Invalid year/);

  const esm = runNode(
    [
      '--input-type=module',
      '--eval',
      "import('./dist/lib.js').then((module) => { if (typeof module.generateTerrain !== 'function') process.exit(1); })",
    ],
    packageRoot,
  );
  assert.equal(esm.status, 0, esm.stderr);

  const cjs = runNode(
    [
      '--eval',
      "const module = require('./dist/lib.cjs'); if (typeof module.generateTerrain !== 'function') process.exit(1);",
    ],
    packageRoot,
  );
  assert.equal(cjs.status, 0, cjs.stderr);

  const actionEnvironment = { ...process.env };
  delete actionEnvironment.GITHUB_ACTOR;
  delete actionEnvironment.GITHUB_REPOSITORY_OWNER;
  delete actionEnvironment.INPUT_USERNAME;
  const action = runNode([join(packageRoot, 'dist', 'action.cjs')], packageRoot, actionEnvironment);
  assert.equal(action.status, 1);
  assert.match(
    `${action.stdout}\n${action.stderr}`,
    /GitHub username could not be resolved from the input or repository/,
  );

  console.log(`Package smoke passed for maeul-in-the-sky@${manifest.version}`);
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
