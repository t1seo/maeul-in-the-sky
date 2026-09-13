import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export function cleanEnvironment(): NodeJS.ProcessEnv {
  return Object.fromEntries(
    Object.entries(process.env).filter(
      ([key]) =>
        !key.startsWith('INPUT_') &&
        !key.startsWith('GITHUB_') &&
        !['GH_TOKEN', 'NODE_OPTIONS', 'NODE_PATH'].includes(key),
    ),
  );
}

export function nodeRuntime(major: 20 | 24): string {
  const override = process.env[`MAEUL_SMOKE_NODE${major}`];
  const binary =
    override ??
    (Number(process.versions.node.split('.')[0]) === major
      ? process.execPath
      : execFileSync(
          'npx',
          [
            '--yes',
            `--package=node@${major === 20 ? '20.19.0' : '24'}`,
            'node',
            '-p',
            'process.execPath',
          ],
          { encoding: 'utf8' },
        ).trim());
  const version = execFileSync(binary, ['--version'], { encoding: 'utf8' }).trim();
  assert.match(version, new RegExp(`^v${major}\\.`));
  console.log(`Runtime ${major}: ${version}`);
  return binary;
}

export function run(
  binary: string,
  args: readonly string[],
  cwd: string,
  env = cleanEnvironment(),
  expected = 0,
) {
  const result = spawnSync(binary, [...args], { cwd, env, encoding: 'utf8', timeout: 120_000 });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, expected, `${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result;
}

export function assertPng(path: string, width: number, height: number) {
  const bytes = readFileSync(path);
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), height);
  assert.ok(bytes.length > 1000, 'PNG should contain a rendered scene');
}

export function writeNetworkStub(directory: string, snapshotPath: string): string {
  const path = join(directory, 'github-stub.mjs');
  writeFileSync(
    path,
    `import { readFileSync, appendFileSync } from 'node:fs';
const snapshot = JSON.parse(readFileSync(${JSON.stringify(snapshotPath)}, 'utf8'));
globalThis.fetch = async (url, options) => {
  if (process.env.SMOKE_NO_NETWORK === '1') throw new Error('Snapshot execution attempted network');
  if (String(url) !== 'https://api.github.com/graphql') throw new Error('Unexpected network endpoint');
  const body = JSON.parse(options.body);
  const year = Number(body.variables.from.slice(0, 4));
  const weeks = snapshot.weeks.map(week => ({ contributionDays: week.days.map(day => ({
    date: String(year) + day.date.slice(4), contributionCount: day.count,
    contributionLevel: ['NONE', 'FIRST_QUARTILE', 'SECOND_QUARTILE', 'THIRD_QUARTILE', 'FOURTH_QUARTILE'][day.level]
  })) }));
  if (process.env.SMOKE_REQUEST_LOG) appendFileSync(process.env.SMOKE_REQUEST_LOG, JSON.stringify({year}) + '\\n');
  return new Response(JSON.stringify({ data: { user: { contributionsCollection: { contributionCalendar: {
    totalContributions: 999999, weeks
  } } } } }), { status: 200, headers: { 'content-type': 'application/json' } });
};\n`,
  );
  return path;
}
