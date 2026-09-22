import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { KHRMeshQuantization, KHRTextureTransform } from '@gltf-transform/extensions';
import { getBounds } from '@gltf-transform/functions';
import { optimizeVillage } from './optimize.js';
import { VillagePreparationError, villageSourcesSchema } from './schema.js';

const here = dirname(fileURLToPath(import.meta.url));
const cache = resolve(process.argv[2] ?? '.orca/tour-assets/research/buildings-candidates');
const output = resolve('docs/demo/tour/models/village');
const sources = villageSourcesSchema.parse(
  JSON.parse(await readFile(resolve(here, 'sources.json'), 'utf8')),
);
const io = new NodeIO().registerExtensions([KHRMeshQuantization, KHRTextureTransform]);
const models = [];
await mkdir(output, { recursive: true });

for (const model of sources.models) {
  for (const input of [{ file: model.input, sha256: model.source.sha256 }, ...model.resources]) {
    const bytes = await readFile(resolve(cache, input.file));
    const hash = createHash('sha256').update(bytes).digest('hex');
    if (hash !== input.sha256)
      throw new VillagePreparationError(model.id, `Source hash mismatch: ${input.file}`);
  }
  const document = await io.read(resolve(cache, model.input));
  const modifications = await optimizeVillage(document, model);
  const scene = document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0];
  if (!scene) throw new VillagePreparationError(model.id, 'Missing scene');
  document.getRoot().setDefaultScene(scene);
  const binary = await io.writeBinary(document);
  if (binary.length > 1024 * 1024)
    throw new VillagePreparationError(model.id, `Exceeds 1 MiB: ${binary.length}`);
  const bounds = getBounds(scene);
  const primitives = document
    .getRoot()
    .listMeshes()
    .flatMap((mesh) => mesh.listPrimitives());
  const triangles = primitives.reduce(
    (sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3,
    0,
  );
  const decodedTextures = document
    .getRoot()
    .listTextures()
    .reduce((sum, texture) => {
      const [width, height] = texture.getSize() ?? [0, 0];
      return sum + width * height * 4;
    }, 0);
  const file = `${model.id}.glb`;
  await writeFile(resolve(output, file), binary);
  models.push({
    id: model.id,
    file,
    bytes: binary.length,
    sha256: createHash('sha256').update(binary).digest('hex'),
    source: model.source,
    modifications,
    triangles,
    primitives: primitives.length,
    decodedTextures,
    bounds,
    size: bounds.max.map((value, axis) => value - bounds.min[axis]),
  });
  console.log(
    `${model.id}: ${binary.length} bytes; ${triangles} triangles; ${primitives.length} primitives`,
  );
}
await writeFile(
  resolve(output, 'manifest.json'),
  `${JSON.stringify({ version: 1, models }, null, 2)}\n`,
);
