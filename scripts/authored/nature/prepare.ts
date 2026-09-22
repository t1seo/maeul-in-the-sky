import { resolve } from 'node:path';
import { buildNature } from './build.js';

const directory = resolve(
  process.argv[2] ?? '../.orca/tour-assets/research/nature-candidates/quaternius',
);
const output = resolve(process.argv[3] ?? 'docs/demo/tour/models/nature');
const archive = resolve(process.argv[4] ?? resolve(directory, '../quaternius-nature.zip'));

try {
  const model = await buildNature(directory, output, archive);
  console.log(
    `${model.id}: ${model.bytes} bytes, ${model.triangles} triangles, ${model.primitives} primitives, ${model.materials} materials, ${model.decodedRgbaBytes} decoded RGBA bytes`,
  );
  console.log(`SHA-256 ${model.sha256}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Nature preparation failed');
  process.exitCode = 1;
}
