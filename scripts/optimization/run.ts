import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus, platform, arch } from 'node:os';
import { execFileSync } from 'node:child_process';
import { VERSION } from 'svgo';
import { initialCorpus, fileCorpus } from './corpus.js';
import { optimizeSvgArtifact, type Candidate } from './optimize.js';
import { compareContracts } from './integrity.js';
import { measure, pixelDelta, raster, sha256, sizes, fontFile } from './measure.js';
import { shareStaticPines } from './defs-use.js';

const label = process.argv[2] ?? 'initial';
const corpus =
  process.argv.length > 3 ? await fileCorpus(process.argv.slice(3)) : await initialCorpus();
const directory = `evidence/svg-optimization/${label}`;
await mkdir(directory, { recursive: true });
const rows = [];
const rejected = [];
for (const specimen of corpus) {
  const baseline = raster(specimen.svg, specimen.mode);
  await writeFile(`${directory}/${specimen.name}-identity.svg`, specimen.svg);
  await writeFile(`${directory}/${specimen.name}-identity.png`, baseline.asPng());
  for (const candidate of [
    ...([
      'identity',
      'svgo-numeric',
      'svgo-path',
      'geometry',
      'geometry-path',
    ] satisfies Candidate[]),
    'static-pine-use',
  ] as const) {
    const transform = () =>
      candidate === 'static-pine-use'
        ? shareStaticPines(specimen.svg)
        : optimizeSvgArtifact(specimen.svg, candidate);
    let svg: string;
    try {
      svg = transform();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      rejected.push({
        name: specimen.name,
        candidate,
        error: error.message,
        input: sizes(specimen.svg),
      });
      console.log(JSON.stringify(rejected.at(-1)));
      continue;
    }
    const rendered = raster(svg, specimen.mode);
    const contract = compareContracts(specimen.svg, svg);
    const row = {
      name: specimen.name,
      candidate,
      provenance: specimen.provenance,
      input: sizes(specimen.svg),
      output: sizes(svg),
      transform: measure(transform, 2, 5),
      raster: measure(() => raster(svg, specimen.mode), 1, 3),
      pixels: pixelDelta(baseline.pixels, rendered.pixels),
      contract,
    };
    rows.push(row);
    await writeFile(`${directory}/${specimen.name}-${candidate}.svg`, svg);
    await writeFile(`${directory}/${specimen.name}-${candidate}.png`, rendered.asPng());
    console.log(
      JSON.stringify({
        name: row.name,
        candidate,
        raw: row.output.rawBytes,
        gzip: row.output.gzipBytes,
        transformMs: row.transform.medianMs,
        rasterMs: row.raster.medianMs,
        delta: row.pixels.meanAbsoluteChannelDelta,
        contract: contract.preserved,
      }),
    );
  }
}
const sourcePaths = [
  'scripts/optimization/optimize.ts',
  'scripts/optimization/integrity.ts',
  'scripts/optimization/measure.ts',
  'scripts/optimization/run.ts',
  'scripts/optimization/path-numbers.ts',
  'scripts/optimization/defs-use.ts',
  fontFile,
];
const sourceHashes = Object.fromEntries(
  await Promise.all(sourcePaths.map(async (path) => [path, sha256(await readFile(path))])),
);
await writeFile(
  `${directory}/results.json`,
  JSON.stringify(
    {
      context: {
        label,
        node: process.version,
        platform: platform(),
        arch: arch(),
        cpu: cpus()[0]?.model,
        svgo: VERSION,
        gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
        measuredAt: new Date().toISOString(),
        gzip: 'node:zlib gzipSync defaults; no network, fetch, disk writes or startup included in transform timing',
        sourceHashes,
      },
      rows,
      rejected,
    },
    null,
    2,
  ),
);
