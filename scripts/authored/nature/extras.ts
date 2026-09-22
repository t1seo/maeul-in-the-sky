import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { KHRMaterialsUnlit } from '@gltf-transform/extensions';
import { dedup, prune, unpartition } from '@gltf-transform/functions';
import { EXTRA_NATURE_SOURCES } from './extra-sources.js';
import { assertNatureBounds, measureNature, measureNatureNodes } from './measure.js';
import { digest, NatureAssetError, verifyNatureBytes } from './sources.js';

export async function buildNatureExtras(directory: string, output: string) {
  const kenneyLicense = await readFile(resolve(directory, 'kenney/License.txt'));
  verifyNatureBytes(kenneyLicense, {
    file: 'kenney/License.txt',
    bytes: 611,
    sha256: 'cb96b75e3560ac78d7a53ce6f083f4cdb5c53faea6141b62d63458dcfe1e4b9d',
  });
  verifyNatureBytes(await readFile(resolve(directory, 'kenney-nature.zip')), {
    file: 'kenney-nature.zip',
    bytes: 10537521,
    sha256: 'fa7974a0d342bfe63c38664ba9f8ec1a4aab8ea25f099bdc56870e33588c4d9d',
  });
  const verified = [];
  for (const source of EXTRA_NATURE_SOURCES) {
    const data = await readFile(resolve(directory, source.raw));
    verifyNatureBytes(data, { ...source, file: source.raw });
    verified.push({ source, data });
  }
  const io = new NodeIO().registerExtensions([KHRMaterialsUnlit]);
  const models = [];
  for (const { source, data } of verified) {
    const document = await io.readBinary(data);
    const before = measureNatureNodes(document).filter((node) => node.primitives > 0);
    for (const material of document.getRoot().listMaterials()) {
      material
        .setExtension('KHR_materials_unlit', null)
        .setMetallicFactor(0)
        .setRoughnessFactor(0.85);
    }
    for (const extension of document.getRoot().listExtensionsUsed()) extension.dispose();
    await document.transform(
      dedup(),
      prune({ keepAttributes: true, keepIndices: true }),
      unpartition(),
    );
    const binary = await io.writeBinary(document);
    const loaded = await io.readBinary(binary);
    const metrics = await measureNature(loaded);
    assertNatureBounds(
      before,
      metrics.nodes.filter((node) => node.primitives > 0),
    );
    if (binary.byteLength > 1024 * 1024 || loaded.getRoot().listExtensionsUsed().length) {
      throw new NatureAssetError(source.id, 'Additional species must be a bounded core GLB');
    }
    models.push({
      id: source.id,
      file: `${source.id}.glb`,
      bytes: binary.byteLength,
      sha256: digest(binary),
      source: { ...source.source, sha256: source.sha256, bytes: source.bytes, rawFile: source.raw },
      ...metrics,
      coordinates: {
        upAxis: '+Y',
        normalized: false,
        units:
          'Original authored geometry and transforms; runtime centers and grounds from actual world-space vertices.',
      },
      modifications: [
        'Repacked as self-contained core GLB; retained original vertices, normals, colors and authored transforms.',
        'Removed unlit extension where present and set roughness 0.85, metallic 0 for shared physical scene lighting.',
        'Removed unused empty nodes and deduplicated resources. Seasonal tints affect named plant materials at runtime.',
      ],
    });
    await mkdir(output, { recursive: true });
    await writeFile(resolve(output, `${source.id}.glb`), binary);
  }
  if (models.reduce((sum, model) => sum + model.bytes, 0) > 550 * 1024) {
    throw new NatureAssetError(
      'extra-species',
      'Additional models exceed their shared 550 KiB budget',
    );
  }
  await mkdir(resolve(output, 'licenses'), { recursive: true });
  await writeFile(resolve(output, 'licenses/Kenney-nature.txt'), kenneyLicense);
  await writeFile(
    resolve(output, 'licenses/CC-BY-3.0.txt'),
    await readFile(
      new URL('../../../docs/demo/tour/models/licenses/CC-BY-3.0.txt', import.meta.url),
    ),
  );
  return models;
}
