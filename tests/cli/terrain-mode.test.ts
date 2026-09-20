import { describe, expect, it, vi } from 'vitest';
import { createCliProgram } from '../../src/cli/program.js';
import { readActionRequest, runAction } from '../../src/cli/action.js';
import { executeGeneration } from '../../src/generate/operation.js';
import { createTerrainGenerator } from '../../src/generate.js';
import { startPreviewServer } from '../../src/preview/server.js';
import { harness, snapshot } from './fixtures.js';

describe('geographic generation adapters', () => {
  it('forwards explicit geography through the actual CLI parser and generation pipeline', async () => {
    // Given
    const test = harness();
    test.files.set('input.json', JSON.stringify(snapshot()));
    const program = createCliProgram('test', {
      generate: (request) => executeGeneration(request, test.dependencies),
      preview: startPreviewServer,
      env: {},
      log: () => undefined,
    }).exitOverride();
    // When
    await program.parseAsync(
      ['--input', 'input.json', '--terrain-mode', 'landscape', '--landscape-layout', 'valley'],
      { from: 'user' },
    );
    // Then
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        terrainMode: 'landscape',
        landscapeLayout: 'valley',
        width: 1200,
        height: 840,
      }),
    );
    expect(test.fetchContributions).not.toHaveBeenCalled();
  });

  it('treats a geography-only request as advanced generation', async () => {
    // Given
    const test = harness();
    const request = {
      username: 'octocat',
      terrainMode: 'landscape',
      landscapeLayout: 'archipelago',
    };
    // When
    await createTerrainGenerator(test.dependencies)(request);
    // Then
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        terrainMode: 'landscape',
        landscapeLayout: 'archipelago',
        width: 1200,
        height: 840,
      }),
    );
  });

  it('uses geography settings loaded from a snapshot for PNG and SVG output', async () => {
    // Given
    const test = harness();
    test.files.set(
      'input.json',
      JSON.stringify({
        ...snapshot(),
        settings: { terrainMode: 'landscape', landscapeLayout: 'island', layout: 'card' },
      }),
    );
    // When
    await createTerrainGenerator(test.dependencies)({ input: 'input.json', format: 'both' });
    // Then
    expect(test.render).toHaveBeenCalledTimes(2);
    for (const call of test.render.mock.calls)
      expect(call[1]).toMatchObject({
        terrainMode: 'landscape',
        landscapeLayout: 'island',
        width: 840,
        height: 840,
      });
    expect(test.render.mock.calls[1]?.[1].motion).toBe('off');
  });

  it('forwards both geography Action inputs while preserving omitted settings', async () => {
    // Given
    const test = harness();
    const inputs: Readonly<Record<string, string>> = {
      terrain_mode: 'landscape',
      landscape_layout: 'valley',
      layout: 'card',
    };
    const action = {
      getInput: (name: string) => inputs[name] ?? '',
      info: vi.fn(),
      setOutput: vi.fn(),
      setFailed: vi.fn(),
      env: { GITHUB_REPOSITORY_OWNER: 'octocat' },
      generate: (request: Parameters<typeof executeGeneration>[0]) =>
        executeGeneration(request, test.dependencies),
    };
    // When
    await runAction(action);
    // Then
    expect(readActionRequest(action)).toMatchObject({
      terrainMode: 'landscape',
      landscapeLayout: 'valley',
    });
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        terrainMode: 'landscape',
        landscapeLayout: 'valley',
        width: 840,
        height: 840,
      }),
    );
    expect(action.setFailed).not.toHaveBeenCalled();
  });

  it.each([
    { terrainMode: 'hex' },
    { terrainMode: '' },
    { landscapeLayout: '' },
    { landscapeLayout: 'banner' },
  ])('rejects invalid geography inputs before fetching or writing: %j', async (options) => {
    // Given
    const test = harness();
    const request = { username: 'octocat', ...options };
    // When / Then
    await expect(createTerrainGenerator(test.dependencies)(request)).rejects.toThrow(
      /terrainMode|landscapeLayout/,
    );
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.files.size).toBe(0);
  });
});
