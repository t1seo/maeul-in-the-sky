import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkPixelOutput } from '../../scripts/pixel/output.js';
import {
  PIXEL_ROOT,
  pixelRenderedFingerprint,
  pixelSourceFingerprint,
} from '../../scripts/pixel/fingerprint.js';
import { pixelSources } from '../../scripts/pixel/sources.js';

const fingerprint = createHash('sha256').update('source').digest('hex');
const rendered = createHash('sha256').update('rendered').digest('hex');

function fixture(run: (directory: string) => void): void {
  const lane = resolve(PIXEL_ROOT, '.orca/asset-overhaul/lanes/pixel');
  mkdirSync(lane, { recursive: true });
  const directory = mkdtempSync(resolve(lane, 'fingerprint-test-'));
  const code = 'export const sprites = [];\n';
  writeFileSync(resolve(directory, 'pine.ts'), code);
  writeFileSync(
    resolve(directory, 'manifest.json'),
    JSON.stringify({
      sourceFingerprint: fingerprint,
      renderedFingerprint: rendered,
      provisional: false,
      files: { 'pine.ts': createHash('sha256').update(code).digest('hex') },
    }),
  );
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

describe('compiled pixel provenance', () => {
  it('ships final generated data matching the current source and renderer fingerprints', () => {
    expect(() =>
      checkPixelOutput(pixelSourceFingerprint(), pixelRenderedFingerprint(pixelSources())),
    ).not.toThrow();
  });

  it('accepts matching sources and rejects source or rendered geometry drift', () =>
    fixture((directory) => {
      expect(() => checkPixelOutput(fingerprint, rendered, directory)).not.toThrow();
      expect(() => checkPixelOutput('changed source', rendered, directory)).toThrow(
        'Source fingerprint drift',
      );
      expect(() => checkPixelOutput(fingerprint, 'changed geometry', directory)).toThrow(
        'Source fingerprint drift',
      );
    }));

  it('rejects hand-edited generated modules', () =>
    fixture((directory) => {
      writeFileSync(resolve(directory, 'pine.ts'), 'export const sprites = [1];\n');
      expect(() => checkPixelOutput(fingerprint, rendered, directory)).toThrow(
        'Generated output drift: pine.ts',
      );
    }));
});
