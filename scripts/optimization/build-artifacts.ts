import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { optimizeGeneratedArtifact } from './artifact.js';
import { measure, sizes } from './measure.js';

const output = 'evidence/svg-optimization/recipe';
await mkdir(output, { recursive: true });
const rows = [];
for (const path of process.argv.slice(2)) {
  const source = await readFile(path, 'utf8');
  const artifact = optimizeGeneratedArtifact(source);
  await writeFile(`${output}/${basename(path)}`, artifact);
  rows.push({
    source: path,
    before: sizes(source),
    after: sizes(artifact),
    guardedRecipe: measure(() => optimizeGeneratedArtifact(source), 2, 5),
  });
}
if (!rows.length) throw new RangeError('Pass one or more generated SVG paths');
await writeFile(`${output}/results.json`, JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows));
