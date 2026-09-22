import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { getBounds } from '@gltf-transform/functions';
import sharp from 'sharp';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { NATURE_NODES, naturePart } from '../../src/tour/authored/nature-models.js';
import { measureNature } from '../../scripts/authored/nature/measure.js';
import {
  NatureAssetError,
  NATURE_SOURCE,
  verifyNatureBytes,
} from '../../scripts/authored/nature/sources.js';

const DIRECTORY = resolve('docs/demo/tour/models/nature');
const SHA = z.string().regex(/^[a-f\d]{64}$/);
const MANIFEST = z.object({
  version: z.literal(1),
  models: z
    .tuple([
      z.object({
        id: z.literal('nature-collection'),
        file: z.literal('nature-collection.glb'),
        bytes: z.number().positive(),
        sha256: SHA,
        source: z.object({
          creator: z.literal('Quaternius'),
          license: z.literal('CC0-1.0'),
          licenseFile: z.string(),
          sha256: SHA,
        }),
        nodes: z
          .array(
            z.object({
              name: z.enum(NATURE_NODES),
              bounds: z.object({
                min: z.tuple([z.number(), z.number(), z.number()]),
                max: z.tuple([z.number(), z.number(), z.number()]),
              }),
            }),
          )
          .length(18),
        triangles: z.number(),
        vertices: z.number(),
        primitives: z.number(),
        materials: z.number(),
        imageBytes: z.number(),
        decodedRgbaBytes: z.number(),
      }),
    ])
    .rest(z.unknown()),
});
const binary = () => readFileSync(resolve(DIRECTORY, 'nature-collection.glb'));
const artifact = () => new NodeIO().readBinary(binary());

describe('vendored nature collection', () => {
  it('ships all eighteen authored silhouettes in a bounded self-contained core GLB', async () => {
    // Given the nature artifact requested by real tour placements.
    const data = binary();
    // When the official glTF reader parses its embedded resources.
    const document = await new NodeIO().readBinary(data);
    const { json } = await new NodeIO().binaryToJSON(data);
    // Then the full family is local, decoder-free and within its reviewed four MiB ceiling.
    expect(data.length).toBeLessThan(4 * 1024 * 1024);
    expect(
      document
        .getRoot()
        .listNodes()
        .map((node) => node.getName()),
    ).toEqual(NATURE_NODES);
    expect(document.getRoot().listExtensionsUsed()).toEqual([]);
    expect(
      document
        .getRoot()
        .listTextures()
        .every((texture) => texture.getImage()?.length),
    ).toBe(true);
    expect(
      json.images?.every((image) => image.bufferView !== undefined && image.uri === undefined),
    ).toBe(true);
    expect(json.buffers).toHaveLength(1);
    expect(json.buffers?.[0].uri).toBeUndefined();
  });

  it('matches the published manifest hash, measured geometry and texture budget', async () => {
    // Given the committed collection and its redistribution manifest.
    const record = MANIFEST.parse(
      JSON.parse(readFileSync(resolve(DIRECTORY, 'manifest.json'), 'utf8')),
    ).models[0];
    // When actual vertex buffers and embedded images are measured.
    const actual = await measureNature(await artifact());
    // Then provenance and payload records describe these exact bytes.
    expect(record.bytes).toBe(binary().length);
    expect(record.sha256).toBe(createHash('sha256').update(binary()).digest('hex'));
    expect(record.source.sha256).toBe(NATURE_SOURCE.sha256);
    expect(record.nodes).toEqual(actual.nodes.map(({ name, bounds }) => ({ name, bounds })));
    expect(actual).toMatchObject({
      triangles: 33734,
      vertices: 47901,
      primitives: 26,
      materials: 12,
    });
    for (const key of [
      'triangles',
      'vertices',
      'primitives',
      'materials',
      'imageBytes',
      'decodedRgbaBytes',
    ] as const) {
      expect(record[key]).toBe(actual[key]);
    }
    expect(actual.textures).toHaveLength(14);
    expect(actual.decodedRgbaBytes).toBeLessThan(15 * 1024 * 1024);
    expect(actual.textures.every(({ width, height }) => Math.max(width, height) <= 512)).toBe(true);
  });

  it('retains cutout leaves and flowers with opaque bark normal maps', async () => {
    // Given the authored material groups used by wind and shadow rendering.
    const materials = (await artifact()).getRoot().listMaterials();
    const masks = materials.filter(
      (material) => material.getAlphaMode() === 'MASK' && !material.getName().startsWith('Bark'),
    );
    // When their alpha maps are decoded rather than inferred from filenames.
    expect(masks).toHaveLength(5);
    for (const material of masks) {
      const texture = material.getBaseColorTexture();
      const image = texture?.getImage();
      if (!image) throw new Error(`${material.getName()} is missing its image`);
      const stats = await sharp(image).ensureAlpha().stats();
      // Then both transparent edges and visible plant pixels survive the repack.
      expect(texture?.getMimeType()).toBe('image/png');
      expect(stats.channels[3].min).toBe(0);
      expect(stats.channels[3].max).toBe(255);
      expect(material.getAlphaCutoff()).toBeCloseTo(0.2, 6);
      expect(material.getDoubleSided()).toBe(true);
    }
    const barks = materials.filter((material) => material.getName().startsWith('Bark'));
    expect(barks).toHaveLength(3);
    expect(
      barks.every((material) => material.getNormalTexture()?.getMimeType() === 'image/jpeg'),
    ).toBe(true);
  });

  it('keeps seasonal tint scoped to real leaf groups, away from bark and flower petals', async () => {
    // Given every named node referenced by the production mapping helper.
    const nodes = (await artifact()).getRoot().listNodes();
    // When the explicitly tintable materials are joined with their real meshes.
    for (const name of NATURE_NODES) {
      const node = nodes.find((candidate) => candidate.getName() === name);
      const materials =
        node
          ?.getMesh()
          ?.listPrimitives()
          .map((primitive) => primitive.getMaterial()?.getName()) ?? [];
      const foliage = naturePart(name, 1, 1).foliageMaterials ?? [];
      // Then no tint target is invented or accidentally includes the trunk or flowers.
      expect(foliage.every((material) => materials.includes(material))).toBe(true);
      expect(
        foliage.some((material) => material.startsWith('Bark') || material === 'Flowers'),
      ).toBe(false);
    }
  });

  it('repairs stale fern accessor bounds while preserving its actual authored vertices', async () => {
    // Given the source fern whose exported min/max was about 3.2 times too large.
    const document = await artifact();
    const fern = document
      .getRoot()
      .listNodes()
      .find((node) => node.getName() === 'Fern_1');
    if (!fern) throw new Error('Fern model is missing');
    // When bounds are calculated from actual vertex data for runtime normalization.
    const bounds = getBounds(fern);
    // Then its grounded size uses the original 2.827m-wide geometry.
    expect(bounds.max[0] - bounds.min[0]).toBeCloseTo(2.826933861, 6);
    expect(bounds.max[1] - bounds.min[1]).toBeCloseTo(0.84024325, 6);
    for (const primitive of fern.getMesh()?.listPrimitives() ?? []) {
      expect(primitive.getAttribute('POSITION')?.getMin([])).toEqual(bounds.min);
      expect(primitive.getAttribute('POSITION')?.getMax([])).toEqual(bounds.max);
    }
  });

  it('ships the exact creator license and complete CC0 legal text', () => {
    // Given the source archive's pinned license bytes.
    const license = readFileSync(resolve(DIRECTORY, 'licenses/Quaternius-nature-standard.txt'));
    // When the source verifier checks the redistributed notice.
    verifyNatureBytes(license, {
      file: 'License_Standard.txt',
      bytes: 852,
      sha256: '120710e542c3ebaf83856c4eb55b4a1e680593b39302eba7fdc5d942dfe78c58',
    });
    // Then both source-specific permission and complete legal terms accompany the model.
    expect(license.toString()).toContain('CC0');
    expect(readFileSync(resolve(DIRECTORY, 'licenses/CC0-1.0.txt'), 'utf8')).toContain('Affirmer');
  });

  it('refuses modified source bytes before any model conversion', () => {
    // Given a byte sequence with the same length as a pinned licensed source.
    const original = Buffer.from('source');
    const pin = {
      file: 'test-source.gltf',
      bytes: original.length,
      sha256: createHash('sha256').update(original).digest('hex'),
    };
    // When a single byte changes or the payload is truncated.
    const tampered = Buffer.from('sourcx');
    // Then neither alteration can be silently repackaged with trusted provenance.
    expect(() => verifyNatureBytes(original, pin)).not.toThrow();
    expect(() => verifyNatureBytes(tampered, pin)).toThrow(NatureAssetError);
    expect(() => verifyNatureBytes(tampered.subarray(1), pin)).toThrow(NatureAssetError);
  });
});
