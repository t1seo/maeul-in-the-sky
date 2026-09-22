import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { getBounds } from '@gltf-transform/functions';
import { expect, it } from 'vitest';
import { z } from 'zod';

const directory = resolve('docs/demo/tour/models/village');
const manifest = z.object({
  version: z.literal(1),
  models: z
    .array(
      z.object({
        id: z.string(),
        file: z.string(),
        bytes: z.number(),
        sha256: z.string(),
        triangles: z.number(),
        primitives: z.number(),
        decodedTextures: z.number(),
        source: z.object({
          creator: z.string(),
          originalTitle: z.string(),
          modelUrl: z.url(),
          downloadUrl: z.url(),
          sha256: z.string(),
          license: z.enum(['CC0-1.0', 'CC-BY-3.0']),
          licenseUrl: z.url(),
          licenseFile: z.string(),
        }),
        modifications: z.array(z.string()).min(1),
      }),
    )
    .min(25),
});

it('ships self-contained licensed village models when the offline preparation finishes', async () => {
  // Given the published tour model directory.
  const manifestFile = resolve(directory, 'manifest.json');
  // When the prepared binary catalog is opened by a core glTF loader.
  expect(existsSync(manifestFile), 'prepared village manifest').toBe(true);
  const catalog = manifest.parse(JSON.parse(readFileSync(manifestFile, 'utf8')));
  const io = new NodeIO();
  for (const model of catalog.models) {
    const bytes = readFileSync(resolve(directory, model.file));
    const document = await io.readBinary(bytes);
    const primitives = document
      .getRoot()
      .listMeshes()
      .flatMap((mesh) => mesh.listPrimitives());
    const scene = document.getRoot().getDefaultScene();
    // Then the payload is bounded, attributable, visible and requires no runtime decoder or CDN.
    expect(bytes.length).toBe(model.bytes);
    expect(bytes.length).toBeLessThanOrEqual(1024 * 1024);
    expect(createHash('sha256').update(bytes).digest('hex')).toBe(model.sha256);
    expect(existsSync(resolve(directory, model.source.licenseFile))).toBe(true);
    expect(model.source.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(document.getRoot().listExtensionsRequired()).toEqual([]);
    expect(document.getRoot().listAnimations()).toEqual([]);
    expect(primitives.length).toBe(model.primitives);
    expect(primitives.length).toBeLessThanOrEqual(3);
    expect(
      primitives.reduce((sum, primitive) => sum + (primitive.getIndices()?.getCount() ?? 0) / 3, 0),
    ).toBe(model.triangles);
    expect(scene).not.toBeNull();
    if (!scene) continue;
    const bounds = getBounds(scene);
    expect([...bounds.min, ...bounds.max].every(Number.isFinite)).toBe(true);
    expect(bounds.max[1] - bounds.min[1]).toBeGreaterThan(0.001);
    for (const texture of document.getRoot().listTextures()) {
      expect(texture.getImage()?.length).toBeGreaterThan(0);
      expect(texture.getSize()?.every((size) => size <= 1024)).toBe(true);
    }
  }
});
