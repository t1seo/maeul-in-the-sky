import { execFileSync, spawn } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parseBenchmarkArgs } from './options.js';
import { sha256 } from './provenance.js';

const REVISION = 'c6d60487e50347fd84b770b57618d181acd874de';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const args = parseBenchmarkArgs(process.argv.slice(2));
if (args.baseline || args.check)
  throw new TypeError('Historical capture does not compare the changing worktree');
const output = resolve(args.output);
const temporary = await mkdtemp(join(tmpdir(), 'maeul-historical-'));
const manifest: { path: string; sha256: string }[] = [];
const copied = new Set<string>();
const copyHistorical = async (path: string): Promise<void> => {
  if (copied.has(path)) return;
  copied.add(path);
  const content = execFileSync('git', ['show', `${REVISION}:${path}`], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  const destination = join(temporary, path);
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination, content);
  manifest.push({ path, sha256: sha256(content) });
  for (const imported of ts.preProcessFile(content).importedFiles) {
    if (!imported.fileName.startsWith('.')) continue;
    const dependency = join(dirname(path), imported.fileName.replace(/\.js$/, '.ts'));
    await copyHistorical(dependency);
  }
};
const run = (argv: string[]) =>
  new Promise<void>((resolveExit, reject) => {
    const child = spawn(process.execPath, argv, {
      cwd: temporary,
      stdio: 'inherit',
      env: { ...process.env, MAEUL_BENCHMARK_REVISION: REVISION },
    });
    child.once('error', reject);
    child.once('exit', (code, signal) =>
      code === 0
        ? resolveExit()
        : reject(new Error(`Historical benchmark exited ${code ?? signal}`)),
    );
  });
try {
  await copyHistorical('src/themes/terrain/index.ts');
  await copyHistorical('tests/fixtures/contribution-data.ts');
  await writeFile(join(temporary, 'package.json'), '{"type":"module"}\n');
  await symlink(join(root, 'node_modules'), join(temporary, 'node_modules'), 'dir');
  await mkdir(join(temporary, 'scripts/qa'), { recursive: true });
  await mkdir(join(temporary, 'scripts/benchmark'), { recursive: true });
  await writeFile(
    join(temporary, 'scripts/qa/fixtures.ts'),
    await readFile(join(root, 'scripts/qa/fixtures.ts')),
  );
  for (const entry of await readdir(join(root, 'scripts/benchmark'))) {
    if (entry.endsWith('.ts'))
      await writeFile(
        join(temporary, 'scripts/benchmark', entry),
        await readFile(join(root, 'scripts/benchmark', entry)),
      );
  }
  await mkdir(dirname(output), { recursive: true });
  await writeFile(
    `${output}.source.json`,
    `${JSON.stringify({ revision: REVISION, method: 'git show recursively follows historical relative imports; node_modules symlink only; no checkout/reset of shared tree', files: manifest.sort((a, b) => a.path.localeCompare(b.path)) }, null, 2)}\n`,
  );
  const loader = join(root, 'node_modules/tsx/dist/loader.mjs');
  const script = join(temporary, 'scripts/benchmark/render.ts');
  await run([
    '--import',
    loader,
    script,
    '--warmup',
    String(args.warmup),
    '--iterations',
    String(args.iterations),
    '--output',
    output,
  ]);
  const profileDirectory = join(dirname(output), `${basename(output, '.json')}-profile`);
  await mkdir(profileDirectory, { recursive: true });
  await run([
    '--cpu-prof',
    '--cpu-prof-dir',
    profileDirectory,
    '--cpu-prof-name',
    'historical.cpuprofile',
    '--import',
    loader,
    script,
    '--warmup',
    '2',
    '--iterations',
    '3',
    '--output',
    join(profileDirectory, 'profile-run.json'),
  ]);
  console.log(`CPU profile recorded separately from primary timing: ${profileDirectory}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
