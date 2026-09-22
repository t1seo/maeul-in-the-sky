import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { assertPreservedBounds, measureWildlife } from './measure.js';
import { optimizeWildlife } from './optimize.js';
import { clipDuration } from './pose.js';
import { WILDLIFE_SOURCES, WildlifeAssetError } from './sources.js';

const rawDirectory = resolve(process.argv[2] ?? '.orca/living-forest/candidates');
const outputDirectory = resolve(process.argv[3] ?? 'docs/demo/tour/models');
const digest = (data: Uint8Array) => createHash('sha256').update(data).digest('hex');

async function prepare() {
  const io = new NodeIO();
  const verified = await Promise.all(
    WILDLIFE_SOURCES.map(async (source) => {
      const path = resolve(rawDirectory, source.raw);
      const data = await readFile(path);
      if (digest(data) !== source.sha256) {
        throw new WildlifeAssetError(
          source.id,
          'Source SHA-256 differs from the verified licensed original',
        );
      }
      return { source, path, bytes: data.length };
    }),
  );
  await mkdir(outputDirectory, { recursive: true });
  const models = [];
  for (const { source, path, bytes } of verified) {
    const document = await io.read(path);
    const original = measureWildlife(document, source.id);
    await optimizeWildlife(document, source.id);
    const binary = await io.writeBinary(document);
    const loaded = await io.readBinary(binary);
    const measurement = measureWildlife(loaded, source.id);
    assertPreservedBounds(source.id, original, measurement);
    const root = loaded.getRoot();
    const primitives = root.listMeshes().flatMap((mesh) => mesh.listPrimitives());
    if (
      binary.byteLength > 1024 * 1024 ||
      primitives.length !== 1 ||
      root.listMaterials().length !== 1
    ) {
      throw new WildlifeAssetError(
        source.id,
        'Optimized output exceeds payload or drawable budget',
      );
    }
    const { raw, ...provenance } = source;
    const model = {
      id: source.id,
      file: `${source.id}.glb`,
      source: { ...provenance, rawFile: raw, bytes },
      sha256: digest(binary),
      bytes: binary.byteLength,
      triangles: primitives.reduce(
        (sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3,
        0,
      ),
      bones: root.listSkins().reduce((sum, skin) => sum + skin.listJoints().length, 0),
      materials: root.listMaterials().length,
      meshes: root.listMeshes().length,
      rigged: root.listSkins().length > 0,
      clips: root
        .listAnimations()
        .map((animation) => ({ name: animation.getName(), duration: clipDuration(animation) })),
      coordinates: {
        upAxis: '+Y',
        forwardAxis: '+Z',
        normalized: false,
        units:
          'Original authored units; apply scene-wrapper centering, grounding and scale at runtime.',
        ...measurement,
      },
      modifications:
        source.id === 'squirrel'
          ? [
              'Repacked as one self-contained GLB; original texture, geometry, node transform and silhouette preserved.',
              'Unused data removed and duplicate resources deduplicated. No bones or animation invented.',
            ]
          : [
              'Retained only listed authored idle/eating clips; original animation names preserved.',
              'Multiplied original solid material base colors by authored vertex colors into linear COLOR_0.',
              'Combined primitives into one material and mesh, preserving geometry, normals, joints, skin weights and authored transforms.',
              'Removed unused data and duplicate resources; losslessly removed redundant animation keyframes.',
              'Verified bind and 17 sampled poses per retained clip against source bounds before writing.',
            ],
    };
    await writeFile(resolve(outputDirectory, model.file), binary);
    models.push(model);
    console.log(
      `${model.id}: ${model.bytes} bytes, ${model.triangles} triangles, ${model.bones} bones, ${model.clips.length} clips`,
    );
  }
  if (models.reduce((sum, model) => sum + model.bytes, 0) > 6 * 1024 * 1024) {
    throw new WildlifeAssetError('inventory', 'Combined model payload exceeds 6 MiB');
  }
  await writeFile(
    resolve(outputDirectory, 'manifest.json'),
    `${JSON.stringify({ version: 1, models }, null, 2)}\n`,
  );
}

try {
  await prepare();
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Wildlife preparation failed');
  process.exitCode = 1;
}
