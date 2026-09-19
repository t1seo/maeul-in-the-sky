import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { parseWorldDocument } from '../../src/world/data/document.js';
import { captureWithBrowser } from './browser.js';
import { readProfileInput, sha256 } from './input.js';
import { assertDistinctProfilePaths, PROFILE_FILES, type ProfileOptions } from './options.js';
import { assertCanonicalWorld, assertPngBytes } from './proof.js';
import { publishCapture } from './publication.js';

export async function renderProfile(options: ProfileOptions, signal: AbortSignal) {
  const input = await readProfileInput(options.input);
  signal.throwIfAborted();
  await mkdir(options.outputDir, { recursive: true });
  const outputDir = await realpath(options.outputDir);
  const paths = {
    world: join(outputDir, PROFILE_FILES.world),
    light: join(outputDir, PROFILE_FILES.light),
    dark: join(outputDir, PROFILE_FILES.dark),
  };
  let evidence: string | undefined;
  if (options.evidence) {
    await mkdir(dirname(options.evidence), { recursive: true });
    evidence = resolve(await realpath(dirname(options.evidence)), basename(options.evidence));
  }
  const destinations = [...Object.values(paths), ...(evidence ? [evidence] : [])];
  assertDistinctProfilePaths(input.canonicalPath, destinations);
  const stage = await mkdtemp(join(outputDir, '.maeul-profile-stage-'));
  try {
    const proof = await captureWithBrowser(input, options, stage, signal);
    const files = Object.values(PROFILE_FILES).map((name) => ({
      source: join(stage, name),
      destination: join(outputDir, name),
    }));
    if (evidence) {
      const source = join(stage, 'capture-evidence.json');
      await writeFile(source, `${JSON.stringify(proof, null, 2)}\n`, { flag: 'wx' });
      files.push({ source, destination: evidence });
    }
    await publishCapture(files, async () => {
      signal.throwIfAborted();
      const worldBytes = await readFile(join(stage, PROFILE_FILES.world));
      const world = parseWorldDocument(worldBytes.toString('utf8'));
      assertCanonicalWorld(world, input.snapshot, input.scene);
      if (sha256(worldBytes) !== proof.light.worldSha256)
        throw new Error('The staged canonical world changed after browser capture.');
      for (const theme of ['light', 'dark'] as const) {
        const bytes = await readFile(join(stage, PROFILE_FILES[theme]));
        assertPngBytes(bytes);
        if (sha256(bytes) !== proof[theme].pngSha256)
          throw new Error('A staged PNG changed after its pixel validation.');
      }
    });
    return { paths, ...(evidence ? { evidence } : {}), proof };
  } finally {
    await rm(stage, { recursive: true, force: true });
  }
}
