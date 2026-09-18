import { describe, expect, it, vi } from 'vitest';
import { readActionRequest, runAction } from '../../src/cli/action.js';
import { executeGeneration } from '../../src/generate/operation.js';
import { harness, snapshot } from './fixtures.js';

function actionHarness(inputs: Readonly<Record<string, string>>) {
  const test = harness();
  test.files.set('snapshot.json', JSON.stringify(snapshot()));
  test.files.set(
    'settings.json',
    JSON.stringify({
      schemaVersion: 1,
      kind: 'maeul-settings',
      username: 'configured-user',
      settings: {},
    }),
  );
  const generate = vi.fn((request: Parameters<typeof executeGeneration>[0]) =>
    executeGeneration(request, test.dependencies),
  );
  const action = {
    getInput: (name: string) => inputs[name] ?? '',
    info: vi.fn(),
    setOutput: vi.fn(),
    setFailed: vi.fn(),
    env: { GITHUB_REPOSITORY_OWNER: 'owner', GITHUB_ACTOR: 'actor' },
    generate,
  };
  return { ...test, action, generate };
}

describe('Action adapter', () => {
  it('keeps repository owner fallback and legacy SVG outputs', async () => {
    const test = actionHarness({ github_token: 'secret' });
    await runAction(test.action);
    expect(test.fetchContributions).toHaveBeenCalledWith('owner', undefined, 'secret');
    expect(test.action.setOutput).toHaveBeenCalledWith(
      'dark_svg_path',
      'maeul-in-the-sky-dark.svg',
    );
    expect(test.action.setFailed).not.toHaveBeenCalled();
  });
  it('uses input identity and exposes PNG/snapshot output paths', async () => {
    const test = actionHarness({
      input: 'snapshot.json',
      format: 'png',
      write_snapshot: 'true',
      layout: 'card',
      village_style: 'korean',
      art_style: 'pixel',
      layout_seed: 'action-seed',
    });
    await runAction(test.action);
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.render).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'testuser' }),
      expect.anything(),
    );
    expect(test.action.setFailed).not.toHaveBeenCalled();
    expect(test.action.setOutput).toHaveBeenCalledWith(
      'dark_png_path',
      'maeul-in-the-sky-dark.png',
    );
    expect(test.action.setOutput).toHaveBeenCalledWith(
      'snapshot_path',
      'maeul-in-the-sky.snapshot.json',
    );
    expect(test.action.setOutput).not.toHaveBeenCalledWith('dark_svg_path', '');
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ layoutSeed: 'action-seed', artStyle: 'pixel', style: 'korean' }),
    );
  });
  it('uses config identity before repository-owner fallback', async () => {
    // Given
    const test = actionHarness({ config: 'settings.json', github_token: 'token-canary' });

    // When
    await runAction(test.action);

    // Then
    expect(test.fetchContributions).toHaveBeenCalledWith(
      'configured-user',
      undefined,
      'token-canary',
    );
    expect(test.fetchContributions).not.toHaveBeenCalledWith(
      'owner',
      expect.anything(),
      expect.anything(),
    );
    expect(test.action.setFailed).not.toHaveBeenCalled();
  });
  it('emits archive outputs for years and fails explicitly on invalid options', async () => {
    const valid = actionHarness({ years: '2024,2025', normalization: 'shared' });
    await runAction(valid.action);
    expect(valid.action.setOutput).toHaveBeenCalledWith('archive_path', 'archive.json');
    const invalid = actionHarness({ year: '2025', years: '2024,2025' });
    await runAction(invalid.action);
    expect(invalid.action.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('cannot be combined'),
    );
    expect(invalid.action.setOutput).not.toHaveBeenCalled();
  });
  it('leaves omitted render options unresolved and respects false snapshot input', () => {
    const test = actionHarness({ write_snapshot: 'false' });
    expect(readActionRequest(test.action)).toMatchObject({
      preset: undefined,
      hemisphere: undefined,
      writeSnapshot: false,
    });
  });
  it.each(['yes', '1', 'TRUE'])('rejects invalid write_snapshot value %s', async (value) => {
    // Given
    const test = actionHarness({ write_snapshot: value });

    // When
    await runAction(test.action);

    // Then
    expect(test.action.setFailed).toHaveBeenCalledWith(expect.stringContaining('write_snapshot'));
    expect(test.generate).not.toHaveBeenCalled();
  });
});
