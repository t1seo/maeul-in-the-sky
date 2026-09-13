import { describe, expect, it } from 'vitest';
import { createTerrainGenerator } from '../src/generate.js';
import { parseSnapshot } from '../src/core/settings/parse.js';
import { harness, snapshot } from './cli/fixtures.js';

describe('extended terrain generation', () => {
  it('C13-input infers snapshot identity, preserves source, and never fetches', async () => {
    const test = harness();
    const input = snapshot();
    const result = await createTerrainGenerator(test.dependencies)({
      input,
      outputDir: 'out',
      writeSnapshot: true,
    });
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(result.snapshotPath).toBe('out/maeul-in-the-sky.snapshot.json');
    const written = parseSnapshot(test.files.get(result.snapshotPath ?? ''));
    expect(written).toEqual(input);
  });
  it('resolves explicit settings over configuration over defaults', async () => {
    const test = harness();
    const input = snapshot();
    const config = {
      schemaVersion: 1 as const,
      kind: 'maeul-settings' as const,
      username: input.username,
      settings: {
        ...input.settings,
        preset: 'nature' as const,
        density: 2,
        hemisphere: 'south' as const,
        layout: 'card' as const,
        motion: 'off' as const,
      },
    };
    await createTerrainGenerator(test.dependencies)({ input, config, density: 8, style: 'korean' });
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        density: 8,
        hemisphere: 'south',
        width: 420,
        height: 360,
        layout: 'card',
        motion: 'off',
        style: 'korean',
      }),
    );
  });
  it('renders PNG from a fresh static scene and uses binary writes separately', async () => {
    const test = harness();
    const result = await createTerrainGenerator(test.dependencies)({
      input: snapshot(),
      motion: 'full',
      format: 'both',
      scale: '3',
    });
    expect(test.render.mock.calls.map(([, options]) => options.motion)).toEqual(['full', 'off']);
    expect(test.dependencies.writeFile).toHaveBeenCalledTimes(2);
    expect(test.dependencies.writeBinaryFile).toHaveBeenCalledTimes(2);
    expect(test.dependencies.renderPng).toHaveBeenCalledWith(expect.any(String), {
      mode: 'dark',
      scale: 3,
    });
    expect(result.darkPngPath).toBe('maeul-in-the-sky-dark.png');
  });
  it('returns empty legacy SVG paths for PNG-only output without writing phantom SVGs', async () => {
    const test = harness();
    const result = await createTerrainGenerator(test.dependencies)({
      input: snapshot(),
      format: 'png',
    });
    expect(result).toMatchObject({
      darkPath: '',
      lightPath: '',
      darkPngPath: 'maeul-in-the-sky-dark.png',
    });
    expect(test.dependencies.writeFile).not.toHaveBeenCalled();
  });
  it.each([
    { username: 'someoneelse' },
    { year: 2024 },
    { years: '2024,2025' },
    { normalization: 'shared' },
  ])('rejects inconsistent input %j before network or writes', async (options) => {
    const test = harness();
    await expect(
      createTerrainGenerator(test.dependencies)({ input: snapshot(), ...options }),
    ).rejects.toThrow();
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.dependencies.makeDirectory).not.toHaveBeenCalled();
  });
});
