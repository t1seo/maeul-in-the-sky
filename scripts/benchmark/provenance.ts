import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { cpus, release, totalmem } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { z } from 'zod';

export const sha256 = (value: string | Uint8Array) =>
  createHash('sha256').update(value).digest('hex');
export function treeHash(root: string, paths: readonly string[]): string {
  const hash = createHash('sha256');
  const visit = (path: string) => {
    for (const entry of readdirSync(path, { withFileTypes: true }).sort((a, b) =>
      a.name.localeCompare(b.name),
    )) {
      const file = join(path, entry.name);
      if (entry.isDirectory()) visit(file);
      else if (entry.name.endsWith('.ts'))
        hash.update(relative(root, file)).update('\0').update(readFileSync(file)).update('\0');
    }
  };
  for (const path of paths) visit(join(root, path));
  return hash.digest('hex');
}
export function sourceProvenance(root: string) {
  const historical = Boolean(process.env.MAEUL_BENCHMARK_REVISION);
  const revision =
    process.env.MAEUL_BENCHMARK_REVISION ??
    execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const dirty = historical
    ? false
    : Boolean(
        execFileSync(
          'git',
          ['status', '--porcelain', '--', 'src', 'tests/fixtures/contribution-data.ts'],
          { cwd: root, encoding: 'utf8' },
        ).trim(),
      );
  return {
    revision,
    historical,
    dirty,
    sourceSha256: treeHash(root, ['src']),
    harnessSha256: treeHash(root, ['scripts/benchmark', 'scripts/qa']),
    changedDuringRun: false,
  };
}
export function environmentInfo(root: string) {
  const require = createRequire(join(root, 'package.json'));
  const dependencies = Object.fromEntries(
    ['tsx', 'typescript', 'simplex-noise', 'svgo', 'zod', '@resvg/resvg-js'].map((name) => {
      let folder = resolve(require.resolve(name), '..');
      for (;;) {
        try {
          const source = z
            .object({ name: z.string(), version: z.string() })
            .parse(JSON.parse(readFileSync(join(folder, 'package.json'), 'utf8')));
          if (source.name === name) return [name, source.version];
        } catch (error) {
          if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error;
        }
        const parent = resolve(folder, '..');
        if (parent === folder) throw new TypeError(`Cannot locate installed version for ${name}`);
        folder = parent;
      }
    }),
  );
  const identity = {
    node: process.version,
    v8: process.versions.v8,
    platform: process.platform,
    arch: process.arch,
    osRelease: release(),
    cpuModel: cpus()[0]?.model ?? 'unknown',
    logicalCpus: cpus().length,
    totalMemory: totalmem(),
  };
  return {
    ...identity,
    timingKey: sha256(JSON.stringify(identity)),
    dependencies,
    timingCaveat:
      'Shared host; no forced GC or process isolation between fixtures. Timing only gates matching runtime/OS/hardware; matching identity cannot prove equal load. Heap peaks are observations between renders, not true allocation peaks.',
  };
}
