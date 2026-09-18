import { createServer } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import { createCliProgram } from '../../src/cli/program.js';
import { executeGeneration } from '../../src/generate/operation.js';
import { harness, snapshot } from './fixtures.js';

function programHarness(
  env: Readonly<Record<string, string | undefined>> = {
    GITHUB_TOKEN: 'ambient-github-token-canary',
  },
) {
  const test = harness();
  test.files.set('snapshot.json', JSON.stringify(snapshot()));
  const generate = vi.fn((request: Parameters<typeof executeGeneration>[0]) =>
    executeGeneration(request, test.dependencies),
  );
  const server = createServer();
  const close = vi.fn(async () => {
    server.emit('close');
  });
  const address = { host: '127.0.0.1', port: 4318, url: 'http://127.0.0.1:4318' };
  const preview = vi.fn(async () => ({ ...address, server, close, listen: async () => address }));
  const log = vi.fn();
  const program = createCliProgram('1.0.0', {
    generate,
    preview,
    env,
    log,
  });
  program.exitOverride();
  return { ...test, generate, preview, log, program, close };
}

describe('CLI command adapter', () => {
  it('gives an explicit token precedence over the ambient GitHub token', async () => {
    // Given
    const test = programHarness();

    // When
    await test.program.parseAsync(['--user', 'testuser', '--token', 'explicit-cli-token-canary'], {
      from: 'user',
    });

    // Then
    expect(test.fetchContributions).toHaveBeenCalledWith(
      'testuser',
      undefined,
      'explicit-cli-token-canary',
    );
    expect(test.generate.mock.calls[0]?.[0].preset).toBeUndefined();
    expect(test.generate.mock.calls[0]?.[0].hemisphere).toBeUndefined();
    expect(test.log).toHaveBeenCalledWith('Written: maeul-in-the-sky-dark.svg');
  });
  it('uses the ambient GitHub token when no explicit token is provided', async () => {
    // Given
    const test = programHarness();

    // When
    await test.program.parseAsync(['--user', 'testuser'], { from: 'user' });

    // Then
    expect(test.fetchContributions).toHaveBeenCalledWith(
      'testuser',
      undefined,
      'ambient-github-token-canary',
    );
  });
  it('forwards every additive single-render option without requiring --user for snapshots', async () => {
    const test = programHarness();
    await test.program.parseAsync(
      [
        '--input',
        'snapshot.json',
        '--motion',
        'off',
        '--layout',
        'card',
        '--style',
        'korean',
        '--art-style',
        'pixel',
        '--normalization',
        'fixed',
        '--max-count',
        '15',
        '--layout-seed',
        'seed',
        '--format',
        'both',
        '--scale',
        '3',
        '--write-snapshot',
        '--output',
        'out',
      ],
      { from: 'user' },
    );
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.render).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        motion: 'off',
        layout: 'card',
        style: 'korean',
        artStyle: 'pixel',
        layoutSeed: 'seed',
        normalization: { kind: 'fixed', maxCount: 15 },
      }),
    );
  });
  it('starts preview without generation flags and forwards only its port', async () => {
    const test = programHarness();
    await test.program.parseAsync(['preview', '--port', '4444'], { from: 'user' });
    expect(test.preview).toHaveBeenCalledWith({ port: 4444 });
    expect(test.generate).not.toHaveBeenCalled();
    await test.close();
  });
  it('rejects conflicting year flags before output or fetch', async () => {
    const test = programHarness();
    await expect(
      test.program.parseAsync(['--user', 'testuser', '--year', '2025', '--years', '2024,2025'], {
        from: 'user',
      }),
    ).rejects.toThrow('cannot be combined');
    expect(test.fetchContributions).not.toHaveBeenCalled();
    expect(test.files.size).toBe(1);
  });
  it('does not log empty SVG paths for PNG-only generation', async () => {
    const test = programHarness();
    await test.program.parseAsync(['--input', 'snapshot.json', '--format', 'png'], {
      from: 'user',
    });
    expect(test.log).not.toHaveBeenCalledWith('Written: ');
    expect(test.log).toHaveBeenCalledWith('Written: maeul-in-the-sky-dark.png');
  });
  it('rejects an explicitly empty option instead of restoring a default', async () => {
    const test = programHarness();
    await expect(
      test.program.parseAsync(['--input', 'snapshot.json', '--motion', ''], { from: 'user' }),
    ).rejects.toThrow('motion');
    expect(test.generate).not.toHaveBeenCalled();
  });
});
