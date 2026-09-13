import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import { parseSnapshot } from '../../src/core/settings/parse.js';
import { parseArchive } from '../../src/core/archive/parse.js';
import { assertPng, cleanEnvironment, run, writeNetworkStub } from './runtime.js';

export function smokeAction(packageRoot: string, node24: string, fixture: string) {
  assert.equal(
    existsSync(join(packageRoot, 'node_modules')),
    false,
    'Action must run before npm install',
  );
  const stub = writeNetworkStub(packageRoot, fixture);
  const output = join(packageRoot, 'action-output');
  const env = {
    ...cleanEnvironment(),
    INPUT_INPUT: fixture,
    INPUT_OUTPUT_DIR: output,
    INPUT_FORMAT: 'both',
    INPUT_MOTION: 'off',
    INPUT_LAYOUT: 'card',
    INPUT_WRITE_SNAPSHOT: 'true',
    SMOKE_NO_NETWORK: '1',
  };
  run(node24, ['--import', stub, 'dist/action.cjs'], packageRoot, env);
  assertPng(join(output, 'maeul-in-the-sky-dark.png'), 840, 720);
  assertPng(join(output, 'maeul-in-the-sky-light.png'), 840, 720);
  assert.ok(readdirSync(output).some((file) => file.endsWith('.json')));
  const online = {
    ...cleanEnvironment(),
    INPUT_USERNAME: 'smoke-user',
    INPUT_YEAR: '2025',
    INPUT_GITHUB_TOKEN: 'smoke-canary-not-a-secret',
    INPUT_OUTPUT_DIR: join(packageRoot, 'action-online'),
    INPUT_MOTION: 'off',
  };
  run(node24, ['--import', stub, 'dist/action.cjs'], packageRoot, online);
  assert.ok(
    readFileSync(join(packageRoot, 'action-online/maeul-in-the-sky-dark.svg'), 'utf8').includes(
      '<svg',
    ),
  );
  const invalid = run(node24, ['dist/action.cjs'], packageRoot, cleanEnvironment(), 1);
  assert.match(`${invalid.stdout}\n${invalid.stderr}`, /username|input|snapshot/i);
  console.log(
    'PASS Action Node 24: no node_modules, no-auth snapshot + WASM/font PNG + stubbed GitHub',
  );
}

export function smokeCli(packageRoot: string, node20: string, fixture: string) {
  const manifest = z
    .object({ version: z.string() })
    .parse(JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')));
  const cli = join(packageRoot, 'dist/index.js');
  assert.equal(
    readFileSync(cli, 'utf8')
      .split('\n')
      .filter((line) => line === '#!/usr/bin/env node').length,
    1,
  );
  assert.equal(run(node20, [cli, '--version'], packageRoot).stdout.trim(), manifest.version);
  assert.match(run(node20, [cli, '--help'], packageRoot).stdout, /preview|input/);
  assert.match(
    run(
      node20,
      [cli, '--user', 'smoke-user', '--year', 'invalid'],
      packageRoot,
      cleanEnvironment(),
      1,
    ).stderr,
    /year/i,
  );
  const output = join(packageRoot, 'cli-output');
  const stub = writeNetworkStub(packageRoot, fixture);
  run(
    node20,
    [
      '--import',
      stub,
      cli,
      '--input',
      fixture,
      '--format',
      'both',
      '--motion',
      'off',
      '--layout',
      'card',
      '--write-snapshot',
      '--output',
      output,
    ],
    packageRoot,
    { ...cleanEnvironment(), SMOKE_NO_NETWORK: '1' },
  );
  assertPng(join(output, 'maeul-in-the-sky-dark.png'), 840, 720);
  assertPng(join(output, 'maeul-in-the-sky-light.png'), 840, 720);
  const snapshotFile = readdirSync(output).find((file) => file.endsWith('.json'));
  assert.ok(snapshotFile);
  assert.deepEqual(
    parseSnapshot(readFileSync(join(output, snapshotFile), 'utf8')).weeks,
    parseSnapshot(readFileSync(fixture, 'utf8')).weeks,
  );
  const archiveOutput = join(packageRoot, 'cli-archive');
  run(
    node20,
    [
      '--import',
      stub,
      cli,
      '--user',
      'smoke-user',
      '--years',
      '2024,2025',
      '--normalization',
      'shared',
      '--motion',
      'off',
      '--output',
      archiveOutput,
    ],
    packageRoot,
    { ...cleanEnvironment(), GITHUB_TOKEN: 'smoke-canary-not-a-secret' },
  );
  const archiveFile = readdirSync(archiveOutput).find(
    (file) => file.includes('archive') && file.endsWith('.json'),
  );
  assert.ok(archiveFile, 'Archive output manifest missing');
  const archive = parseArchive(readFileSync(join(archiveOutput, archiveFile), 'utf8'));
  assert.equal(archive.snapshots.length, 2);
  assert.deepEqual(archive.comparison.years, [2024, 2025]);
  assert.ok(
    readdirSync(archiveOutput).some((file) => file.includes('comparison') && file.endsWith('.svg')),
  );
  console.log('PASS CLI Node 20: version/help/errors, snapshot PNG roundtrip and shared archive');
}

export function smokeModules(packageRoot: string, node20: string, fixture: string) {
  for (const extension of ['mjs', 'cjs'] as const) {
    const script = join(packageRoot, `consume.${extension}`);
    const load =
      extension === 'mjs'
        ? "import * as api from 'maeul-in-the-sky';"
        : "const api = require('maeul-in-the-sky');";
    writeFileSync(
      script,
      `${load}
${extension === 'mjs' ? "import { readFileSync } from 'node:fs'; import assert from 'node:assert/strict';" : "const { readFileSync } = require('node:fs'); const assert = require('node:assert/strict');"}
async function main() {
  const snapshot = api.parseSnapshot(readFileSync(${JSON.stringify(fixture)}, 'utf8'));
  const data = api.snapshotToContributionData(snapshot);
  const output = api.renderTerrain(data, { ...snapshot.settings, motion: 'off', width: 840, height: 240 });
  assert.equal(output.metadata.stats.total, data.weeks.flatMap(week => week.days).reduce((sum, day) => sum + day.count, 0));
  assert.deepEqual(api.parseSnapshot(api.serializeSnapshot(snapshot)).weeks, snapshot.weeks);
  const png = await api.renderPng(output.dark, { mode: 'dark', scale: 1 });
  assert.equal(Buffer.from(png).subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  console.log('PASS ${extension} conditional export: render, snapshot, WASM PNG');
}
main().catch(error => { console.error(error); process.exitCode = 1; });\n`,
    );
    run(node20, [script], packageRoot);
  }
  console.log('PASS Node 20 ESM/CJS conditional exports execute rendering and portable PNG');
}
