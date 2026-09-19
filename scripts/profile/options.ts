import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

export const PROFILE_FILES = {
  world: 'maeul-in-the-sky-world.json',
  light: 'maeul-in-the-sky-world-light.png',
  dark: 'maeul-in-the-sky-world-dark.png',
} as const;

export type ProfileOptions = {
  readonly input: string;
  readonly outputDir: string;
  readonly assetRoot: string;
  readonly evidence?: string;
};

export function parseProfileOptions(args: readonly string[]): ProfileOptions {
  const { values } = parseArgs({
    args: [...args],
    options: {
      input: { type: 'string' },
      'output-dir': { type: 'string', default: '.' },
      'asset-root': { type: 'string' },
      evidence: { type: 'string' },
    },
    strict: true,
    allowPositionals: false,
  });
  if (!values.input?.trim()) throw new Error('Profile capture requires --input <snapshot.json>.');
  const input = resolve(values.input);
  const outputDir = resolve(values['output-dir']);
  const evidence = values.evidence ? resolve(values.evidence) : undefined;
  const outputs = Object.values(PROFILE_FILES).map((name) => resolve(outputDir, name));
  if (evidence) outputs.push(evidence);
  if (outputs.includes(input) || new Set(outputs).size !== outputs.length)
    throw new Error('Profile output paths would overwrite the input or another capture artifact.');
  return {
    input,
    outputDir,
    assetRoot: values['asset-root']
      ? resolve(values['asset-root'])
      : fileURLToPath(new URL('../../docs/demo/', import.meta.url)),
    ...(evidence ? { evidence } : {}),
  };
}
