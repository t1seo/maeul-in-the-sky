import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { z } from 'zod';

const execute = promisify(execFile);
const temporary = await mkdtemp(join(tmpdir(), 'maeul-preview-package-'));
const evidence = resolve('.orca/maeul-improvements/evidence/T09/package');
await mkdir(evidence, { recursive: true });
try {
  const packed = await execute(
    'npm',
    ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
    { maxBuffer: 8 * 1024 * 1024 },
  );
  const archive = z
    .array(z.object({ filename: z.string() }))
    .min(1)
    .parse(JSON.parse(packed.stdout))[0];
  assert.ok(archive);
  const installed = join(temporary, 'installed');
  await mkdir(installed);
  const installation = await execute(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--prefix',
      installed,
      join(temporary, archive.filename),
    ],
    { maxBuffer: 8 * 1024 * 1024 },
  );
  await writeFile(join(evidence, 'install.log'), installation.stdout + installation.stderr);
  const outcomes: unknown[] = [];
  for (const mode of ['module', 'commonjs'] as const) {
    const load =
      mode === 'module'
        ? "import { startPreviewServer } from 'maeul-in-the-sky';"
        : "const { startPreviewServer } = require('maeul-in-the-sky');";
    const source = `${load}
      (async () => {
        const server = await startPreviewServer({ port: 0, token: '' });
        try {
          const paths = ['/', '/app/main.js', '/assets/preset-balanced-dark.svg', '/api/health'];
          const receipts = [];
          for (const path of paths) {
            const response = await fetch(server.url + path);
            const text = await response.text();
            if (response.status !== 200 || !text.length) throw new Error(path + ': ' + response.status);
            receipts.push({ path, status: response.status, bytes: text.length, type: response.headers.get('content-type') });
          }
          process.stdout.write(JSON.stringify({ mode: '${mode}', receipts }));
        } finally { await server.close(); }
      })().catch(error => { process.stderr.write(error.message); process.exitCode = 1; });
    `;
    const result = await execute(process.execPath, [`--input-type=${mode}`, '-e', source], {
      cwd: installed,
      timeout: 30000,
    });
    const parsed: unknown = JSON.parse(result.stdout);
    outcomes.push(parsed);
  }
  await writeFile(
    join(evidence, 'result.json'),
    JSON.stringify({ passed: true, archive: archive.filename, outcomes }, null, 2),
  );
  console.log(
    JSON.stringify({
      passed: true,
      formats: ['esm', 'cjs'],
      assetRoot: 'installed dist/demo',
      evidence,
    }),
  );
} finally {
  await rm(temporary, { recursive: true, force: true });
  await writeFile(
    join(evidence, 'cleanup.txt'),
    'Installed package, archive and temporary directory removed; both child servers closed before exit.\n',
  );
}
