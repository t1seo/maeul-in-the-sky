import { createHash } from 'node:crypto';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function authoredPackageFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'maeul-authored-inventory-'));
  const models = join(directory, 'dist/demo/tour/models');
  const bytes = await readFile('docs/demo/tour/models/squirrel.glb');
  const license = await readFile('docs/demo/tour/models/licenses/CC0-1.0.txt');
  const model = {
    id: 'fixture',
    file: 'fixture.glb',
    bytes: bytes.length,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    source: {
      creator: 'Fixture creator',
      modelUrl: 'https://example.com/original-model',
      downloadUrl: 'https://example.com/original-model.glb',
      license: 'CC0-1.0',
      licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
      licenseFile: 'licenses/CC0-1.0.txt',
      sha256: createHash('sha256').update(bytes).digest('hex'),
    },
    modifications: ['Repacked as a self-contained GLB.'],
  };
  for (const folder of ['', 'nature', 'village']) {
    const root = join(models, folder);
    await mkdir(join(root, 'licenses'), { recursive: true });
    await writeFile(join(root, model.file), bytes);
    await writeFile(join(root, model.source.licenseFile), license);
    await writeFile(join(root, 'manifest.json'), JSON.stringify({ version: 1, models: [model] }));
  }
  await writeFile(join(models, 'CREDITS.md'), '# 3D asset credits\nFixture creator\n');
  await writeFile(join(models, 'coverage.json'), JSON.stringify({ version: 1, catalog: [] }));
  await writeFile(join(models, 'coverage.md'), '# Tour asset coverage\n');
  return { directory, models, model, close: () => rm(directory, { recursive: true, force: true }) };
}

export function fixtureGlb(document: unknown): Buffer {
  const content = Buffer.from(JSON.stringify(document));
  const json = Buffer.alloc(Math.ceil(content.length / 4) * 4, ' ');
  content.copy(json);
  const result = Buffer.alloc(20 + json.length + 12);
  result.writeUInt32LE(0x46546c67, 0);
  result.writeUInt32LE(2, 4);
  result.writeUInt32LE(result.length, 8);
  result.writeUInt32LE(json.length, 12);
  result.writeUInt32LE(0x4e4f534a, 16);
  json.copy(result, 20);
  result.writeUInt32LE(4, 20 + json.length);
  result.writeUInt32LE(0x004e4942, 24 + json.length);
  return result;
}
