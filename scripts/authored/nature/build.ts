import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Document, NodeIO } from '@gltf-transform/core';
import { dedup, mergeDocuments, prune, unpartition } from '@gltf-transform/functions';
import sharp from 'sharp';
import { NATURE_NODES } from '../../../src/tour/authored/nature-models.js';
import { assertNatureBounds, measureNature, measureNatureNodes } from './measure.js';
import { digest, NATURE_SOURCE, NatureAssetError, verifyNatureSources } from './sources.js';
import { prepareNatureTextures } from './textures.js';
import { buildNatureExtras } from './extras.js';

export async function buildNature(directory: string, output: string, archiveFile: string) {
  await verifyNatureSources(directory, archiveFile);
  const io = new NodeIO();
  const document = new Document();
  const scene = document.createScene('Nature Collection');
  document.getRoot().setDefaultScene(scene);
  for (const name of NATURE_NODES) {
    const source = await io.read(resolve(directory, 'glTF', `${name}.gltf`));
    const roots = source.getRoot().listNodes();
    if (roots.length !== 1 || roots[0].getName() !== name) {
      throw new NatureAssetError(name, 'Expected exactly one matching named root');
    }
    mergeDocuments(document, source);
  }
  for (const sourceScene of document.getRoot().listScenes()) {
    if (sourceScene === scene) continue;
    for (const node of sourceScene.listChildren()) scene.addChild(node);
    sourceScene.dispose();
  }
  const original = measureNatureNodes(document);
  await document.transform(
    dedup(),
    prune({ keepLeaves: true, keepAttributes: true, keepIndices: true }),
    unpartition(),
  );
  await prepareNatureTextures(document);
  const binary = await io.writeBinary(document);
  const loaded = await io.readBinary(binary);
  const metrics = await measureNature(loaded);
  assertNatureBounds(original, metrics.nodes);
  if (
    binary.byteLength > 4 * 1024 * 1024 ||
    metrics.materials !== 12 ||
    metrics.primitives !== 26
  ) {
    throw new NatureAssetError(
      'collection',
      'Collection exceeds the reviewed payload or drawable budget',
    );
  }
  if (loaded.getRoot().listExtensionsUsed().length > 0) {
    throw new NatureAssetError('collection', 'Only decoder-free core glTF is permitted');
  }
  const model = {
    id: 'nature-collection',
    file: 'nature-collection.glb',
    bytes: binary.byteLength,
    sha256: digest(binary),
    source: NATURE_SOURCE,
    ...metrics,
    coordinates: {
      upAxis: '+Y',
      normalized: false,
      units:
        'Original authored units. Runtime centers and grounds each named root from actual vertices, then uniformly fits height and maxSpan.',
    },
    modifications: [
      'Selected 18 Standard models, retaining original geometry, normals, UVs, named materials and alpha policies.',
      'Merged into one self-contained GLB and deduplicated shared textures and materials.',
      'Resized texture longest edges to 512px with sharp. Opaque colors use JPEG quality 85; normal maps use JPEG quality 95; both use 4:4:4 chroma. Images with alpha remain PNG.',
      'Recomputed accessor bounds from original vertex buffers, correcting stale Fern_1 source bounds without changing vertices.',
      'No Draco, Meshopt, KTX2, WebP or external decoder dependencies. Seasonal and blossom tinting applies only to explicitly named foliage at runtime.',
    ],
    preparation: { gltfTransform: '4.5.0', sharp: sharp.versions.sharp, vips: sharp.versions.vips },
  };
  const sourceLicense = await readFile(resolve(directory, 'License_Standard.txt'));
  const cc0 = await readFile(
    new URL('../../../docs/demo/tour/models/licenses/CC0-1.0.txt', import.meta.url),
  );
  await mkdir(resolve(output, 'licenses'), { recursive: true });
  await writeFile(resolve(output, model.file), binary);
  await writeFile(resolve(output, 'licenses/Quaternius-nature-standard.txt'), sourceLicense);
  await writeFile(resolve(output, 'licenses/CC0-1.0.txt'), cc0);
  const extras = await buildNatureExtras(resolve(directory, '..'), output);
  await writeFile(
    resolve(output, 'manifest.json'),
    `${JSON.stringify({ version: 1, models: [model, ...extras] }, null, 2)}\n`,
  );
  console.log(
    `Additional species: ${extras.reduce((sum, extra) => sum + extra.bytes, 0)} bytes in ${extras.length} GLBs`,
  );
  return model;
}
