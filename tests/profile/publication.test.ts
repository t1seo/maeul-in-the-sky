import { mkdir, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { publishCapture } from '../../scripts/profile/publication.js';

const directories: string[] = [];
afterEach(async () => {
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'maeul-profile-test-'));
  directories.push(root);
  const files = ['world.json', 'light.png', 'dark.png'].map((name) => ({
    source: join(root, `new-${name}`),
    destination: join(root, name),
  }));
  for (const file of files) {
    await writeFile(file.source, 'new');
    await writeFile(file.destination, 'old');
  }
  return { root, files };
}

describe('all-or-rollback profile publication', () => {
  it('validates the complete staged set before replacing any existing file', async () => {
    const { files } = await fixture();
    await expect(
      publishCapture(files, async () => {
        throw new Error('dark capture is blank');
      }),
    ).rejects.toThrow('dark capture is blank');
    expect(await Promise.all(files.map((file) => readFile(file.destination, 'utf8')))).toEqual([
      'old',
      'old',
      'old',
    ]);
  });

  it('restores every existing file if a later replacement fails', async () => {
    const { files } = await fixture();
    let replacements = 0;
    await expect(
      publishCapture(
        files,
        async () => {},
        async (source, destination) => {
          if (String(source).endsWith('/next') && ++replacements === 2)
            throw new Error('disk failure');
          await rename(source, destination);
        },
      ),
    ).rejects.toThrow('disk failure');
    expect(await Promise.all(files.map((file) => readFile(file.destination, 'utf8')))).toEqual([
      'old',
      'old',
      'old',
    ]);
  });

  it('removes newly published files on rollback without disturbing unrelated assets', async () => {
    const { root, files } = await fixture();
    const first = files[0];
    if (!first) throw new Error('fixture missing');
    await rm(first.destination);
    await writeFile(join(root, 'snapshot.json'), 'retained');
    let replacements = 0;
    await expect(
      publishCapture(
        files,
        async () => {},
        async (source, destination) => {
          if (String(source).endsWith('/next') && ++replacements === 2)
            throw new Error('disk failure');
          await rename(source, destination);
        },
      ),
    ).rejects.toThrow('disk failure');
    await expect(readFile(first.destination)).rejects.toMatchObject({ code: 'ENOENT' });
    expect(await readFile(join(root, 'snapshot.json'), 'utf8')).toBe('retained');
  });

  it('publishes all validated files, including evidence in another directory', async () => {
    const { root, files } = await fixture();
    const evidence = {
      source: join(root, 'new-world.json'),
      destination: join(root, 'proof', 'evidence.json'),
    };
    await publishCapture([...files, evidence], async () => {});
    expect(await Promise.all(files.map((file) => readFile(file.destination, 'utf8')))).toEqual([
      'new',
      'new',
      'new',
    ]);
    expect(await readFile(evidence.destination, 'utf8')).toBe('new');
  });

  it.each(['directory', 'symlink'] as const)(
    'rejects a %s destination before changing any artifact',
    async (kind) => {
      const { files } = await fixture();
      const last = files.at(-1);
      if (!last) throw new Error('fixture missing');
      await rm(last.destination);
      if (kind === 'directory') await mkdir(last.destination);
      else await symlink(last.source, last.destination);
      await expect(publishCapture(files, async () => {})).rejects.toThrow('regular files');
      expect(await readFile(files[0].destination, 'utf8')).toBe('old');
      expect(await readFile(files[1].destination, 'utf8')).toBe('old');
    },
  );
});
