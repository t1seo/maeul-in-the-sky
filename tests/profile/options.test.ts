import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseProfileOptions } from '../../scripts/profile/options.js';

describe('the profile capture CLI contract', () => {
  it('requires a caller snapshot and resolves all paths before any browser is started', () => {
    expect(
      parseProfileOptions(['--input', 'snapshot.json', '--output-dir', 'images']),
    ).toMatchObject({
      input: resolve('snapshot.json'),
      outputDir: resolve('images'),
    });
    expect(() => parseProfileOptions([])).toThrow('--input');
    expect(() => parseProfileOptions(['--input', 's.json', '--token', 'secret'])).toThrow();
  });

  it('refuses an input path that publication would overwrite', () => {
    expect(() => parseProfileOptions(['--input', 'maeul-in-the-sky-world.json'])).toThrow(
      'overwrite',
    );
    expect(() => parseProfileOptions(['--input', 's.json', '--evidence', 's.json'])).toThrow(
      'overwrite',
    );
  });
});
