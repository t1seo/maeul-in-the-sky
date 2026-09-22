import { Raycaster, Vector3 } from 'three';
import { expect, it } from 'vitest';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { GeometryResources } from '../../src/world/three/geometry/resources.js';
import { createTourAsset } from '../../src/tour/assets/index.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { populateVillage } from '../../src/tour/render/populate.js';
import { wildlifeSpecies } from '../../src/tour/wildlife/catalog.js';
import { requestedWildlife } from '../../src/tour/wildlife/library.js';

function robinModel(variant: number) {
  const model = parseTourSnapshot(sampleSnapshot());
  const anchor = model.placements[0];
  if (!anchor) throw new Error('Expected a dated source placement');
  const placement = {
    ...anchor,
    source: { ...anchor.source, catalogId: 'robinBird', variant },
    position: { x: 0, y: 0, z: 0 },
  };
  return { ...model, placements: [placement], cells: [], paths: [] };
}

it('keeps the art-reviewed robin exception out of external model downloads', () => {
  // Given the original robin contribution without an acceptable licensed replacement.
  const model = robinModel(0);
  // When its external download inventory is selected.
  const requested = requestedWildlife(model);
  // Then neither the rejected Robin nor a different species is downloaded for it.
  expect(wildlifeSpecies('robinBird')).toBeNull();
  expect(requested).toEqual([]);
  expect(existsSync('docs/demo/tour/models/robin.glb')).toBe(false);
});

it.each([0, 1, 2])(
  'preserves the original robin recipe and dated picking for variant %i',
  (variant) => {
    // Given an unchanged source recipe and the normal tour population path.
    const model = robinModel(variant);
    const placement = model.placements[0];
    const asset = createTourAsset('robinBird', variant, placement.season);
    const resources = new GeometryResources();
    const village = populateVillage(model, resources, undefined, {
      models: new Map(),
      dispose: () => {},
    });
    try {
      // When the actual instanced geometry is picked through the robin's breast.
      village.root.updateMatrixWorld(true);
      const hit = new Raycaster(
        new Vector3(0, 0.153 * asset.scale, 4),
        new Vector3(0, 0, -1),
      ).intersectObject(village.root, true)[0];
      const identity = hit
        ? village.identities.get(hit.object.uuid)?.[hit.instanceId ?? 0]
        : undefined;
      // Then every original part is present and selecting it retains the original contribution date.
      expect(asset.recipe.parts.length).toBeGreaterThan(10);
      expect(village.animals.inspect().count).toBe(0);
      expect([...village.identities.values()].flat()).toHaveLength(asset.recipe.parts.length);
      expect(identity).toBe(placement.source.id);
      expect(
        model.placements.find((entry) => entry.source.id === identity)?.source.anchorDate,
      ).toBe(placement.source.anchorDate);
    } finally {
      resources.dispose();
    }
  },
);
import { existsSync } from 'node:fs';
