import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { createTourAsset } from '../../src/tour/assets/catalog.js';
import { TOUR_COLORS as C } from '../../src/tour/assets/palette.js';
import { natureAsset } from '../../src/tour/authored/nature.js';
import type { TourPlacement } from '../../src/tour/types.js';

function placement(catalogId: string): TourPlacement {
  return {
    source: {
      id: `wetland:${catalogId}`,
      catalogId,
      anchorDate: '2026-06-18',
      week: 18,
      day: 4,
      cx: 0,
      cy: 0,
      footprint: { x: 0, y: 0, width: 1, height: 1 },
      drawOrder: 18,
      variant: 1,
      animated: false,
    },
    position: { x: 72, y: 0, z: 16 },
    season: 'summer',
    kind: 'asset',
  };
}

const MATCHES = [
  ['willow', 'willow.glb'],
  ['palm', 'palm.glb'],
  ['reeds', 'cattail.glb'],
  ['cattail', 'cattail.glb'],
  ['reedMarsh', 'cattail.glb'],
  ['lily', 'lilypad.glb'],
  ['pondLily', 'lilypad.glb'],
] as const;

describe('authored wetland species', () => {
  it.each(MATCHES)('uses a real species-specific model for %s', (id, file) => {
    // Given a source species shown as a large primitive in the first integrated tour.
    const source = placement(id);
    const fallback = createTourAsset(id, 1, 'summer');
    // When the extended authored mapping resolves its model.
    const result = natureAsset(source, fallback);
    // Then the exact species and established collider are preserved.
    expect(result?.parts.some((part) => part.file === `nature/${file}`)).toBe(true);
    expect(result?.collider ?? fallback.collider).toEqual(fallback.collider);
    expect(result?.parts.every((part) => part.height > 0 && part.maxSpan > 0)).toBe(true);
  });

  it.each(['lotusPond', 'willowPond', 'tidePools'])(
    'replaces %s plants while retaining the actual basin and water',
    (id) => {
      // Given the original water surface and its pond-specific offset.
      const fallback = createTourAsset(id, 1, 'summer');
      const water = fallback.recipe.parts.filter((part) => part.color === C.water);
      // When foliage, shore reeds and stones receive external meshes.
      const result = natureAsset(placement(id), fallback);
      // Then water is unchanged and large primitive plants have been removed.
      expect(result?.retainedParts).toEqual(expect.arrayContaining(water));
      expect(
        result?.retainedParts.every((part) => part.color === C.water || part.color === C.stoneDark),
      ).toBe(true);
      expect(result?.parts.some((part) => part.file === 'nature/lilypad.glb')).toBe(true);
      expect(result?.parts.some((part) => part.file === 'nature/cattail.glb')).toBe(true);
      if (id === 'willowPond')
        expect(result?.parts.some((part) => part.file === 'nature/willow.glb')).toBe(true);
    },
  );

  it('does not relabel marine kelp as freshwater cattails', () => {
    // Given a visually similar but biologically distinct marine plant.
    const source = placement('kelp');
    // When freshwater models are available.
    const result = natureAsset(source, createTourAsset('kelp', 1, 'summer'));
    // Then the species-specific procedural model remains available.
    expect(result).toBeNull();
  });

  it('retains leafy bamboo thickets without requesting an unsuitable cut-stem model', () => {
    // Given the original thicket with leaves attached above its bamboo stems.
    const fallback = createTourAsset('bambooThicket', 1, 'summer');
    const originalParts = structuredClone(fallback.recipe.parts);
    const leaves = fallback.recipe.parts.filter(
      (part) =>
        part.primitive === 'sphere' && (part.color === C.leaf || part.color === C.leafLight),
    );
    // When the reviewed external bamboo lacks the original leafy silhouette.
    const result = natureAsset(placement('bambooThicket'), fallback);
    // Then the complete original recipe remains and no external model is requested.
    expect(leaves).toHaveLength(12);
    expect(leaves.every((part) => part.position.y > 0)).toBe(true);
    expect(result).toBeNull();
    expect(fallback.recipe.parts).toEqual(originalParts);
  });

  it('does not ship the rejected cut-stem bamboo model', () => {
    // Given the reproducible nature inventory after the visual review.
    const manifest = z
      .object({ models: z.array(z.object({ id: z.string() })) })
      .parse(
        JSON.parse(readFileSync(resolve('docs/demo/tour/models/nature/manifest.json'), 'utf8')),
      );
    // When inspecting the published models and their provenance records.
    const bambooExists = existsSync(resolve('docs/demo/tour/models/nature/bamboo.glb'));
    // Then unused bamboo geometry and its misleading replacement claim are absent.
    expect(bambooExists).toBe(false);
    expect(manifest.models.some((model) => model.id === 'bamboo')).toBe(false);
  });

  it('ships all four extra species within the remaining first-load payload budget', async () => {
    // Given the four original authored models selected after the Chrome visual review.
    const names = ['willow', 'palm', 'cattail', 'lilypad'];
    const manifest = z
      .object({
        models: z.array(
          z.object({
            id: z.string(),
            file: z.string(),
            bytes: z.number(),
            sha256: z.string(),
            source: z.object({
              originalTitle: z.string(),
              creator: z.string(),
              modelUrl: z.url(),
              license: z.string(),
              licenseFile: z.string(),
            }),
          }),
        ),
      })
      .parse(
        JSON.parse(readFileSync(resolve('docs/demo/tour/models/nature/manifest.json'), 'utf8')),
      );
    let total = 0;
    // When each shipped GLB is loaded with only core glTF support.
    for (const name of names) {
      const bytes = readFileSync(resolve('docs/demo/tour/models/nature', `${name}.glb`));
      const root = (await new NodeIO().readBinary(bytes)).getRoot();
      total += bytes.length;
      // Then standard lit materials and local geometry need no extra decoder or texture downloads.
      expect(bytes.length).toBeLessThan(1024 * 1024);
      expect(root.listExtensionsUsed()).toHaveLength(0);
      expect(root.listMeshes().length).toBeGreaterThan(0);
      const record = manifest.models.find((model) => model.id === name);
      if (!record) throw new Error(`${name} is missing its source notice`);
      expect(record.file).toBe(`${name}.glb`);
      expect(record.bytes).toBe(bytes.length);
      expect(record.sha256).toBe(createHash('sha256').update(bytes).digest('hex'));
      expect(
        readFileSync(resolve('docs/demo/tour/models/nature', record.source.licenseFile)).length,
      ).toBeGreaterThan(100);
      if (name === 'cattail')
        expect(record.source).toMatchObject({
          originalTitle: 'Cattail',
          creator: 'Poly by Google',
          license: 'CC-BY-3.0',
          modelUrl: 'https://poly.pizza/m/9uT74BMpRrl',
        });
    }
    expect(total).toBeLessThan(550 * 1024);
  });
});
