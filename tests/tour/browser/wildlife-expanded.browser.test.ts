import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { Box3, MeshStandardMaterial, Vector3 } from 'three';
import { sampleSnapshot } from '../../../src/demo/sample.js';
import { parseTourSnapshot } from '../../../src/tour/model/snapshot.js';
import { createWildlifeActor, type WildlifeActor } from '../../../src/tour/wildlife/actor.js';
import { createWildlifePopulation } from '../../../src/tour/wildlife/population.js';
import { loadWildlifeLibrary, type WildlifeLibrary } from '../../../src/tour/wildlife/library.js';
import type { WildlifeSpecies } from '../../../src/tour/wildlife/catalog.js';
import { wildlifeBaseUrl } from './fixture.js';

const SPECIES = [
  'rabbit',
  'goat',
  'bird',
  'chicken',
  'owl',
  'seagull',
  'heron',
  'whale',
  'frog',
  'shellfish',
  'fish',
  'turtle',
  'crab',
  'jellyfish',
  'butterfly',
  'spider',
] as const;
const model = parseTourSnapshot(sampleSnapshot());
let library: WildlifeLibrary | null = null;
const cleanup: (() => void)[] = [];
beforeAll(async () => {
  library = await loadWildlifeLibrary(SPECIES, wildlifeBaseUrl, new AbortController().signal);
});
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});
afterAll(() => library?.dispose());

function placement(catalogId: string) {
  const anchor = model.placements[0];
  if (!anchor) throw new Error('Expected the sample calendar anchor');
  return {
    ...anchor,
    source: { ...anchor.source, catalogId, variant: 2 },
    position: { x: 0, y: 0, z: 0 },
  };
}

function actorFor(species: WildlifeSpecies): WildlifeActor {
  const source = library?.models.get(species);
  if (!source) throw new Error(`Expected real ${species} GLB`);
  const actor = createWildlifeActor(source, species, placement(species));
  cleanup.push(actor.dispose);
  return actor;
}

it.each(SPECIES)('loads the genuine %s materials, silhouette, and habitat in Chrome', (species) => {
  // Given a decoded self-contained authored model, including its original texture.
  const actor = actorFor(species);
  const bounds = new Box3().setFromObject(actor.root, true);
  const size = bounds.getSize(new Vector3());
  // When the complete actor is measured and inspected.
  const materials = actor.meshes.flatMap((mesh) =>
    Array.isArray(mesh.material) ? mesh.material : [mesh.material],
  );
  // Then the model remains bounded, lit, shadowed, and on its intended surface.
  expect(actor.meshes.length).toBeGreaterThan(0);
  expect(actor.meshes.every((mesh) => mesh.castShadow && mesh.receiveShadow)).toBe(true);
  expect(materials.every((material) => material instanceof MeshStandardMaterial)).toBe(true);
  expect(size.length()).toBeGreaterThan(0.01);
  expect(Math.hypot(size.x, size.z)).toBeLessThan(4.6);
  if (['fish', 'whale', 'jellyfish'].includes(species)) {
    expect(bounds.min.y).toBeLessThan(0);
    expect(bounds.max.y).toBeGreaterThan(0);
    expect(actor.root.position.y).toBe(0);
  } else if (species === 'butterfly') {
    expect(bounds.min.y).toBeGreaterThan(0.45);
  } else {
    expect(bounds.min.y).toBeGreaterThan(-0.05);
    expect(bounds.min.y).toBeLessThan(0.1);
  }
  for (const material of materials) {
    if (!(material instanceof MeshStandardMaterial)) continue;
    if (material.map) expect(material.map.source.data).toBeInstanceOf(ImageBitmap);
    if (['shellfish', 'turtle', 'butterfly'].includes(species))
      expect(material.flatShading).toBe(true);
  }
});

it.each([
  ['fishSchool', 3],
  ['butterflyGarden', 4],
] as const)('preserves every %s member and its contribution identity', (catalogId, count) => {
  // Given one original composition with multiple external actors.
  if (!library) throw new Error('Expected the authored library');
  const source = placement(catalogId);
  const population = createWildlifePopulation({ ...model, placements: [source] }, library);
  cleanup.push(population.dispose);
  // When each model primitive is mapped back to its contribution.
  const sourceIds = [...population.identities.values()].flat();
  // Then all actors remain independently visible without inventing dates.
  expect(population.inspect().count).toBe(count);
  expect(sourceIds.length).toBeGreaterThanOrEqual(count);
  expect(new Set(sourceIds)).toEqual(new Set([source.source.id]));
  expect(
    new Set(population.root.children.map((actor) => actor.position.toArray().join(','))).size,
  ).toBe(count);
});
