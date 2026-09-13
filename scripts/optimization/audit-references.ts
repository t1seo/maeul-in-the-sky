import { readFile, readdir, writeFile } from 'node:fs/promises';
import { svgContract } from './integrity.js';

const directory = process.argv[2] ?? 'evidence/svg-optimization/pine-control';
const files = await readdir(directory);
const rows = [];
for (const name of files.filter((file) => file.endsWith('-identity.svg'))) {
  const base = name.replace(/-identity\.svg$/, '');
  const original = svgContract(await readFile(`${directory}/${name}`, 'utf8'));
  const candidate = svgContract(await readFile(`${directory}/${base}-static-pine-use.svg`, 'utf8'));
  const newIds = candidate.ids.filter((id) => !original.ids.includes(id));
  const preserved =
    original.ids.every((id) => candidate.ids.includes(id)) &&
    original.references.every((id) => candidate.references.includes(id)) &&
    candidate.missingReferences.length === 0 &&
    candidate.duplicateIds === 0 &&
    original.viewBox === candidate.viewBox &&
    JSON.stringify(original.protectedNodes) === JSON.stringify(candidate.protectedNodes) &&
    JSON.stringify(original.protectedAttributes) ===
      JSON.stringify(
        candidate.protectedAttributes.filter(
          (attribute) => !attribute.startsWith('g:id=opt-pine-'),
        ),
      );
  const row = {
    base,
    preserved,
    newIds,
    addedReferences: candidate.references.length - original.references.length,
    originalElements: original.elements,
    candidateElements: candidate.elements,
  };
  rows.push(row);
  if (!preserved) throw new TypeError(`Static pine reference/semantic contract failed: ${base}`);
}
await writeFile(`${directory}/defs-reference-audit.json`, JSON.stringify(rows, null, 2));
console.log(JSON.stringify(rows));
