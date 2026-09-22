import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Document } from '@gltf-transform/core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { optimizeWildlife } from '../../scripts/wildlife/optimize.js';

const IDS = ['squirrel', 'cow', 'deer', 'fox', 'horse', 'donkey', 'sheep', 'pig'] as const;
const DIRECTORY = resolve('docs/demo/tour/models');
const HASH = z.string().regex(/^[a-f\d]{64}$/);
const CLIP = z.object({ name: z.string(), duration: z.number().positive() });
const MODEL = z.object({
  id: z.enum(IDS),
  file: z.string(),
  sha256: HASH,
  bytes: z.number().int().positive(),
  triangles: z.number().int().positive(),
  bones: z.number().int().nonnegative(),
  materials: z.number().int().positive(),
  meshes: z.number().int().positive(),
  rigged: z.boolean(),
  clips: z.array(CLIP),
  source: z.object({
    creator: z.string().min(1),
    modelUrl: z.url(),
    downloadUrl: z.url(),
    license: z.enum(['CC0-1.0', 'CC-BY-3.0']),
    licenseUrl: z.url(),
    licenseFile: z.string(),
    sha256: HASH,
  }),
  modifications: z.array(z.string()).min(1),
});
const GLTF = z.object({
  asset: z.object({ version: z.literal('2.0') }),
  buffers: z.array(z.object({ byteLength: z.number().positive(), uri: z.string().optional() })),
  bufferViews: z.array(z.object({ buffer: z.number().int(), byteLength: z.number().positive() })),
  images: z
    .array(z.object({ bufferView: z.number().int(), uri: z.string().optional() }))
    .optional(),
  extensionsRequired: z.array(z.string()).optional(),
  accessors: z.array(z.object({ count: z.number().int().positive() })),
  meshes: z.array(
    z.object({
      primitives: z.array(
        z.object({
          attributes: z.record(z.string(), z.number().int()),
          indices: z.number().int(),
          material: z.number().int(),
          mode: z.number().int().optional(),
        }),
      ),
    }),
  ),
  materials: z.array(z.object({})),
  skins: z.array(z.object({ joints: z.array(z.number().int()).min(1) })).optional(),
  animations: z
    .array(
      z.object({
        name: z.string(),
        channels: z.array(z.object({})).min(1),
        samplers: z.array(z.object({})).min(1),
      }),
    )
    .optional(),
});

function readModel(id: string) {
  const binary = readFileSync(resolve(DIRECTORY, `${id}.glb`));
  const jsonLength = binary.readUInt32LE(12);
  const parsed: unknown = JSON.parse(binary.subarray(20, 20 + jsonLength).toString('utf8'));
  return { binary, gltf: GLTF.parse(parsed) };
}

function readManifest() {
  const parsed: unknown = JSON.parse(readFileSync(resolve(DIRECTORY, 'manifest.json'), 'utf8'));
  return z.object({ version: z.literal(1), models: z.array(MODEL) }).parse(parsed);
}

describe('vendored authored wildlife', () => {
  it('removes animation sampler data when excluding a combat clip', async () => {
    // Given independent idle and combat keyframes in the source graph.
    const document = new Document();
    const buffer = document.createBuffer();
    const node = document.createNode('animal');
    document.createScene().addChild(node);
    for (const [name, value] of [
      ['Idle', 1],
      ['Attack', 100],
    ] as const) {
      const input = document
        .createAccessor(`${name}-time`, buffer)
        .setType('SCALAR')
        .setArray(new Float32Array([0, value]));
      const output = document
        .createAccessor(`${name}-motion`, buffer)
        .setType('VEC3')
        .setArray(new Float32Array([0, 0, 0, 0, value, 0]));
      const sampler = document.createAnimationSampler().setInput(input).setOutput(output);
      const channel = document
        .createAnimationChannel()
        .setTargetNode(node)
        .setTargetPath('translation')
        .setSampler(sampler);
      document.createAnimation(name).addSampler(sampler).addChannel(channel);
    }
    // When the non-peaceful clip is removed from the shipped inventory.
    await optimizeWildlife(document, 'squirrel');
    // Then its detached samplers cannot retain unused binary payload.
    expect(
      document
        .getRoot()
        .listAnimations()
        .map((animation) => animation.getName()),
    ).toEqual(['Idle']);
    expect(
      document
        .getRoot()
        .listAccessors()
        .map((accessor) => accessor.getName())
        .sort(),
    ).toEqual(['Idle-motion', 'Idle-time']);
  });

  it.each(IDS)('ships %s as a self-contained GLB without external decoders', (id) => {
    // Given an animal requested by the public tour.
    const { binary, gltf } = readModel(id);
    // When its binary container and resource references are inspected.
    const binaryChunk = 20 + binary.readUInt32LE(12);
    // Then the model is valid, locally loadable, and bounded for the web.
    expect(binary.readUInt32LE(0)).toBe(0x46546c67);
    expect(binary.readUInt32LE(4)).toBe(2);
    expect(binary.readUInt32LE(8)).toBe(binary.length);
    expect(binary.readUInt32LE(16)).toBe(0x4e4f534a);
    expect(binary.readUInt32LE(binaryChunk + 4)).toBe(0x004e4942);
    expect(binaryChunk + 8 + binary.readUInt32LE(binaryChunk)).toBe(binary.length);
    expect(binary.length).toBeLessThanOrEqual(1024 * 1024);
    expect(gltf.buffers).toHaveLength(1);
    expect(gltf.buffers.every((buffer) => buffer.uri === undefined)).toBe(true);
    expect((gltf.images ?? []).every((image) => image.uri === undefined)).toBe(true);
    expect(gltf.extensionsRequired ?? []).toEqual([]);
    expect(gltf.bufferViews.every((view) => view.buffer === 0)).toBe(true);
  });

  it.each(IDS)('keeps %s to one drawable mesh with its required skin attributes', (id) => {
    // Given the optimized animal geometry.
    const { gltf } = readModel(id);
    // When its drawable primitives are inspected.
    const primitives = gltf.meshes.flatMap((mesh) => mesh.primitives);
    // Then the budget does not multiply draw calls or discard skeletal weights.
    expect(gltf.meshes).toHaveLength(1);
    expect(primitives).toHaveLength(1);
    expect(gltf.materials).toHaveLength(1);
    for (const primitive of primitives) {
      expect(primitive.mode ?? 4).toBe(4);
      expect(primitive.attributes['POSITION']).toBeTypeOf('number');
      expect(primitive.attributes['NORMAL']).toBeTypeOf('number');
      if (id === 'squirrel') {
        expect(primitive.attributes['TEXCOORD_0']).toBeTypeOf('number');
      } else {
        expect(primitive.attributes['JOINTS_0']).toBeTypeOf('number');
        expect(primitive.attributes['WEIGHTS_0']).toBeTypeOf('number');
        expect(primitive.attributes['COLOR_0']).toBeTypeOf('number');
      }
    }
    expect((gltf.skins ?? []).length).toBe(id === 'squirrel' ? 0 : 1);
  });

  it.each(IDS)('retains only peaceful authored animation for %s', (id) => {
    // Given a model with its original animation labels.
    const { gltf } = readModel(id);
    // When the available behaviors are listed.
    const names = (gltf.animations ?? []).map((animation) => animation.name);
    // Then a forest actor cannot accidentally play combat or jumping clips.
    if (id === 'squirrel') expect(names).toEqual([]);
    else {
      expect(names.length).toBeGreaterThan(0);
      expect(names.every((name) => /(?:^|\|)(?:Idle(?:_2|_Headlow)?|Eating)$/.test(name))).toBe(
        true,
      );
      expect(names.some((name) => /(?:^|\|)Idle$/.test(name))).toBe(true);
    }
  });

  it('records a complete licensed inventory within the total payload budget', () => {
    // Given the published attribution and inventory.
    const manifest = readManifest();
    const credits = readFileSync(resolve(DIRECTORY, 'CREDITS.md'), 'utf8');
    // When all licensed models and their license notices are enumerated.
    const species = manifest.models.map((model) => model.id).sort();
    // Then no requested species, authorship, license, or source digest is missing.
    expect(species).toEqual([...IDS].sort());
    expect(manifest.models.reduce((total, model) => total + model.bytes, 0)).toBeLessThanOrEqual(
      6 * 1024 * 1024,
    );
    expect(credits).toContain('Poly by Google');
    expect(credits).toContain('Quaternius');
    for (const model of manifest.models) {
      const license = readFileSync(resolve(DIRECTORY, model.source.licenseFile), 'utf8');
      expect(license.length).toBeGreaterThan(1000);
      expect(credits).toContain(model.source.modelUrl);
      expect(credits).toContain(model.source.licenseUrl);
      expect(model.source.license).toBe(model.id === 'squirrel' ? 'CC-BY-3.0' : 'CC0-1.0');
      expect(model.rigged).toBe(model.id !== 'squirrel');
    }
  });

  it.each(IDS)('matches %s bytes and model counts to its provenance manifest', (id) => {
    // Given the vendored artifact and its recorded derivation.
    const { binary, gltf } = readModel(id);
    const manifest = readManifest();
    // When the actual bytes and loaded primitive counts are measured.
    const record = manifest.models.find((model) => model.id === id);
    const triangles = gltf.meshes
      .flatMap((mesh) => mesh.primitives)
      .reduce((sum, primitive) => sum + gltf.accessors[primitive.indices].count / 3, 0);
    // Then altered models cannot silently retain a stale inventory or checksum.
    expect(record).toBeDefined();
    expect(record?.file).toBe(`${id}.glb`);
    expect(record?.sha256).toBe(createHash('sha256').update(binary).digest('hex'));
    expect(record?.bytes).toBe(binary.length);
    expect(record?.triangles).toBe(triangles);
    expect(record?.bones).toBe(
      (gltf.skins ?? []).reduce((sum, skin) => sum + skin.joints.length, 0),
    );
    expect(record?.meshes).toBe(gltf.meshes.length);
    expect(record?.materials).toBe(gltf.materials.length);
    expect(record?.clips.map((clip) => clip.name)).toEqual(
      (gltf.animations ?? []).map((animation) => animation.name),
    );
  });
});
