import assert from 'node:assert/strict';
import { cpus } from 'node:os';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { benchmarkFixtures, BENCHMARK_OPTIONS } from '../qa/fixtures.js';
import { renderTerrain } from '../../src/themes/terrain/index.js';
import { svgContract } from './integrity.js';
import { measure, pixelDelta, raster, sha256, sizes } from './measure.js';
import {
  precomputeWaterBrightness,
  type BrightnessRepresentation,
} from './brightness-transform.js';

const fixture =
  '<svg><polygon points="0,0 1,0 1,1" fill="#7585a0" opacity="0.3" style="filter:brightness(1.3)"/></svg>';
const candidate = precomputeWaterBrightness(fixture, 'fractional');

assert.equal(candidate.changes.length, 1);
assert.equal(
  candidate.svg,
  '<svg><polygon points="0,0 1,0 1,1" fill="rgb(152.1,172.9,208)" opacity="0.3"/></svg>',
);

const OUTPUT = '.orca/maeul-improvements/evidence/brightness';
const REPRESENTATIONS = ['integer', 'fractional'] as const;

type ColorMode = 'dark' | 'light';
type Motion = 'full' | 'off';
type Specimen = {
  readonly name: string;
  readonly mode: ColorMode;
  readonly motion: Motion;
  readonly svg: string;
};

function structuralContract(before: string, after: string) {
  const source = svgContract(before);
  const target = svgContract(after);
  const fields = ['viewBox', 'ids', 'references', 'protectedNodes', 'elements'] as const;
  return {
    preserved: fields.every(
      (field) => JSON.stringify(source[field]) === JSON.stringify(target[field]),
    ),
    inputMissingReferences: source.missingReferences,
    outputMissingReferences: target.missingReferences,
    inputDuplicateIds: source.duplicateIds,
    outputDuplicateIds: target.duplicateIds,
  };
}

function specimens(): readonly Specimen[] {
  const rendered: Specimen[] = [];
  for (const benchmark of benchmarkFixtures()) {
    const terrain = renderTerrain(benchmark.data, { ...BENCHMARK_OPTIONS, motion: 'off' });
    for (const mode of ['dark', 'light'] as const) {
      rendered.push({
        name: `${benchmark.name}-${mode}-static`,
        mode,
        motion: 'off',
        svg: terrain[mode],
      });
    }
  }
  const mixed = benchmarkFixtures().find((entry) => entry.name === 'mixed');
  if (!mixed) throw new TypeError('Mixed benchmark fixture is unavailable');
  const animated = renderTerrain(mixed.data, { ...BENCHMARK_OPTIONS, motion: 'full' });
  rendered.push({ name: 'mixed-dark-animated', mode: 'dark', motion: 'full', svg: animated.dark });
  return rendered;
}

function generationTimings() {
  return benchmarkFixtures().map((benchmark) => {
    const options = { ...BENCHMARK_OPTIONS, motion: 'off' } as const;
    const reference = measure(() => renderTerrain(benchmark.data, options), 2, 12);
    const withTransform = measure(
      () => {
        const terrain = renderTerrain(benchmark.data, options);
        precomputeWaterBrightness(terrain.dark, 'fractional');
        precomputeWaterBrightness(terrain.light, 'fractional');
      },
      2,
      12,
    );
    return { name: benchmark.name, reference, withTransform };
  });
}

function assertScopedChanges(
  source: string,
  transformed: ReturnType<typeof precomputeWaterBrightness>,
): void {
  assert.ok(transformed.changes.length > 0, 'Candidate must change at least one water surface');
  assert.equal(source.includes('style="filter:brightness(1.3)"'), true);
  assert.equal(transformed.svg.includes('style="filter:brightness(1.3)"'), false);
  for (const change of transformed.changes) {
    assert.equal(change.sourceTag.includes(`fill="${change.sourceFill}"`), true);
    assert.equal(change.sourceTag.includes('opacity="0.3"'), true);
    assert.equal(change.sourceTag.includes('style="filter:brightness(1.3)"'), true);
    assert.equal(change.targetTag.includes(`fill="${change.targetFill}"`), true);
    assert.equal(change.targetTag.includes('opacity="0.3"'), true);
    assert.equal(change.targetTag.includes('style='), false);
  }
}

async function measureSpecimen(specimen: Specimen, representation: BrightnessRepresentation) {
  const transformed = precomputeWaterBrightness(specimen.svg, representation);
  assertScopedChanges(specimen.svg, transformed);
  const referenceRaster = raster(specimen.svg, specimen.mode);
  const candidateRaster = raster(transformed.svg, specimen.mode);
  const base = `${OUTPUT}/${specimen.name}`;
  await Promise.all([
    writeFile(`${base}-reference.svg`, specimen.svg),
    writeFile(`${base}-${representation}.svg`, transformed.svg),
    writeFile(`${base}-reference.png`, referenceRaster.asPng()),
    writeFile(`${base}-${representation}.png`, candidateRaster.asPng()),
  ]);
  return {
    name: specimen.name,
    mode: specimen.mode,
    motion: specimen.motion,
    representation,
    changedSurfaces: transformed.changes.length,
    uniqueSourceFills: new Set(transformed.changes.map((change) => change.sourceFill)).size,
    input: sizes(specimen.svg),
    output: sizes(transformed.svg),
    transform: measure(() => precomputeWaterBrightness(specimen.svg, representation), 5, 30),
    resvgReference: measure(() => raster(specimen.svg, specimen.mode), 2, 10),
    resvgCandidate: measure(() => raster(transformed.svg, specimen.mode), 2, 10),
    resvgPixels: pixelDelta(referenceRaster.pixels, candidateRaster.pixels),
    contract: structuralContract(specimen.svg, transformed.svg),
    exactScopeValidated: true,
    sampleChange: transformed.changes[0],
  };
}

async function main(): Promise<void> {
  await mkdir(OUTPUT, { recursive: true });
  const sourceBefore = sha256(await readFile('src/themes/terrain/scene/block-shape.ts'));
  const rows = [];
  for (const specimen of specimens()) {
    for (const representation of REPRESENTATIONS) {
      rows.push(await measureSpecimen(specimen, representation));
    }
  }
  const sourceAfter = sha256(await readFile('src/themes/terrain/scene/block-shape.ts'));
  assert.equal(sourceAfter, sourceBefore, 'Relevant production source changed during measurement');
  const result = {
    context: {
      measuredAt: new Date().toISOString(),
      node: process.version,
      cpu: cpus()[0]?.model,
      gitHead: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
      sourcePath: 'src/themes/terrain/scene/block-shape.ts',
      sourceHash: sourceBefore,
      corpus: 'empty/mixed/full, dark/light, motion off; mixed-dark motion full',
      scope:
        'Lexical XML start-tag scanner; only polygon fill values and the exact filter:brightness(1.3) style are changed.',
    },
    generation: generationTimings(),
    rows,
  };
  await writeFile(`${OUTPUT}/results.json`, `${JSON.stringify(result, null, 2)}\n`);
  console.log(JSON.stringify(result, null, 2));
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack : String(error));
  process.exitCode = 1;
});
