import { pixelRenderedFingerprint, pixelSourceFingerprint } from './fingerprint.js';
import { checkPixelOutput, writePixelOutput } from './output.js';
import { PixelCompileError } from './paints.js';
import { compilePixelSprite } from './sample.js';
import { pixelSources } from './sources.js';

const args = new Set(process.argv.slice(2));
if ([...args].some((arg) => arg !== '--check' && arg !== '--provisional')) {
  throw new PixelCompileError('Usage: npx tsx scripts/pixel/generate.ts [--check | --provisional]');
}
const sourceFingerprint = pixelSourceFingerprint();
const sources = pixelSources();
const renderedFingerprint = pixelRenderedFingerprint(sources);
if (args.has('--check')) {
  checkPixelOutput(sourceFingerprint, renderedFingerprint);
  console.log(`Pixel source and output fingerprints match (${sources.length} assets).`);
} else {
  const compiled = sources.map((source) => {
    try {
      return {
        id: source.id,
        group: source.group,
        sprites: Array.from({ length: source.variants }, (_, variant) =>
          compilePixelSprite((colors) => source.render(colors, variant), source.bounds),
        ),
      };
    } catch (error) {
      if (error instanceof PixelCompileError)
        throw new PixelCompileError(`${source.id}: ${error.detail}`);
      throw error;
    }
  });
  if (pixelSourceFingerprint() !== sourceFingerprint) {
    throw new PixelCompileError('Artwork changed while sampling; retry after edits settle');
  }
  await writePixelOutput(
    compiled,
    sourceFingerprint,
    renderedFingerprint,
    args.has('--provisional'),
  );
  console.log(
    `Generated ${compiled.length} pixel assets (${args.has('--provisional') ? 'provisional' : 'final'}).`,
  );
}
