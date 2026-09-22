import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { assertPreservedBounds, measureWildlife } from './measure.js';
import { optimizeWildlife } from './optimize.js';
import { wildlifePaletteChanges } from './palette.js';
import { clipDuration } from './pose.js';
import { WILDLIFE_SOURCES, WildlifeAssetError } from './sources.js';

const rawDirectory = resolve(process.argv[2] ?? '.orca/tour-assets/animals/raw');
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
    const drawableLimit = source.id === 'butterfly' || source.id === 'shellfish' ? 2 : 1;
    if (
      binary.byteLength > 1024 * 1024 ||
      root.listMeshes().length !== 1 ||
      primitives.length > drawableLimit ||
      root.listMaterials().length > drawableLimit
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
      textures: root.listTextures().map((texture) => ({
        dimensions: texture.getSize(),
        bytes: texture.getImage()?.byteLength ?? 0,
        mimeType: texture.getMimeType(),
      })),
      clips: root
        .listAnimations()
        .map((animation) => ({ name: animation.getName(), duration: clipDuration(animation) })),
      coordinates: {
        upAxis: '+Y',
        forwardAxis: 'originalTitle' in source ? 'Authored orientation retained' : '+Z',
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
              ...wildlifePaletteChanges(source.id),
              'Retained only listed authored idle/eating/swimming clips; original animation names preserved. Unrigged models remain unrigged.',
              'Multiplied original solid material base colors by authored vertex colors into linear COLOR_0.',
              'Combined compatible solid primitives, preserving geometry, normals, joints, skin weights and authored transforms. Textured surfaces retain their UVs and separate materials.',
              'Embedded textures over 512 pixels were resized to fit 512 pixels with PNG encoding; original texture coordinates and colors preserved.',
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
  if (models.reduce((sum, model) => sum + model.bytes, 0) > 12 * 1024 * 1024) {
    throw new WildlifeAssetError('inventory', 'Combined model payload exceeds 12 MiB');
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
