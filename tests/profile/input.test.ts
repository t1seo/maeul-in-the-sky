import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readProfileInput } from '../../scripts/profile/input.js';
import { parseProfileOptions } from '../../scripts/profile/options.js';
import { renderProfile } from '../../scripts/profile/run.js';
import { captureWithBrowser } from '../../scripts/profile/browser.js';
import { assertCanonicalWorld, assertThemeWorld } from '../../scripts/profile/proof.js';
import {
  createWorldDocument,
  parseWorldDocument,
  serializeWorldDocument,
} from '../../src/world/data/document.js';
import { importWorldData } from '../../src/world/data/imports.js';
import { buildWorld } from '../../src/world/model/build.js';
import { defaultWorldView } from '../../src/world/model/defaults.js';

vi.mock('../../scripts/profile/browser.js', () => ({ captureWithBrowser: vi.fn() }));
const directories: string[] = [];
afterEach(async () => {
  vi.clearAllMocks();
  await Promise.all(
    directories.splice(0).map((path) => rm(path, { recursive: true, force: true })),
  );
});

async function inputPath(text: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), 'maeul-profile-input-'));
  directories.push(root);
  const path = join(root, 'snapshot.json');
  await writeFile(path, text);
  return path;
}

describe('caller snapshot and canonical capture boundaries', () => {
  it.each(['{broken', '{"kind":"maeul-world","schemaVersion":1}', ' '.repeat(2 * 1024 * 1024 + 1)])(
    'rejects invalid input before starting a browser',
    async (text) => {
      const path = await inputPath(text);
      await expect(
        renderProfile(parseProfileOptions(['--input', path]), new AbortController().signal),
      ).rejects.toThrow();
      expect(captureWithBrowser).not.toHaveBeenCalled();
    },
  );

  it('retains the rolling 13-month records and accepts only a matching frozen daytime world', async () => {
    const path = await inputPath(
      await readFile('tests/fixtures/improvements/mixed-2025.json', 'utf8'),
    );
    const input = await readProfileInput(path);
    const expected = input.snapshot.weeks
      .flatMap((week) => week.days)
      .map(({ date, count }) => ({ date, count }));
    expect(new Set(input.scene.days.map((day) => day.monthKey)).size).toBe(13);
    expect(
      input.scene.days.flatMap((day) =>
        day.kind === 'observed' ? [{ date: day.date, count: day.count }] : [],
      ),
    ).toEqual(expected);
    const imported = importWorldData(input.snapshot).documents[0];
    if (!imported) throw new Error('Snapshot did not produce a world.');
    const rebuilt = buildWorld({
      snapshot: imported.sourceSnapshot,
      settings: { ...imported.scene.settings, layout: 'seasonal-circle' },
      range: imported.scene.range,
      repositories: imported.repositoryData,
    });
    const day = parseWorldDocument(
      serializeWorldDocument(
        createWorldDocument({
          scene: rebuilt,
          sourceSnapshot: input.snapshot,
          view: { ...defaultWorldView(input.scene), weather: 'clear', motion: 'off' },
        }),
      ),
    );
    assertCanonicalWorld(day, input.snapshot, input.scene);
    assertThemeWorld(day, { ...day, view: { ...day.view, lighting: 'night' } });
    expect(() =>
      assertCanonicalWorld(
        { ...day, view: { ...day.view, lighting: 'night' } },
        input.snapshot,
        input.scene,
      ),
    ).toThrow('daytime');
    expect(() =>
      assertCanonicalWorld(day, { ...input.snapshot, source: { kind: 'import' } }, input.scene),
    ).toThrow('snapshot');
    expect(() =>
      assertCanonicalWorld(day, input.snapshot, { ...input.scene, sourceDigest: 'changed' }),
    ).toThrow('sourceDigest');
    expect(() =>
      assertThemeWorld(day, {
        ...day,
        scene: { ...day.scene, sourceDigest: 'changed' },
        view: { ...day.view, lighting: 'night' },
      }),
    ).toThrow('source evidence');
  });

  it('cleans staging and leaves previous publications intact when browser capture fails', async () => {
    const path = await inputPath(
      await readFile('tests/fixtures/improvements/mixed-2025.json', 'utf8'),
    );
    const root = dirname(path);
    const world = join(root, 'maeul-in-the-sky-world.json');
    await writeFile(world, 'previous world');
    vi.mocked(captureWithBrowser).mockRejectedValueOnce(new Error('WebGL unavailable'));
    await expect(
      renderProfile(
        parseProfileOptions(['--input', path, '--output-dir', root]),
        new AbortController().signal,
      ),
    ).rejects.toThrow('WebGL unavailable');
    expect(await readFile(world, 'utf8')).toBe('previous world');
    expect((await readdir(root)).sort()).toEqual(['maeul-in-the-sky-world.json', 'snapshot.json']);
  });
});
