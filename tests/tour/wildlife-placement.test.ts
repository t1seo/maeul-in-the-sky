import { readFile } from 'node:fs/promises';
import { afterEach, expect, it } from 'vitest';
import { Box3, Vector3 } from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { sampleSnapshot } from '../../src/demo/sample.js';
import { parseTourSnapshot } from '../../src/tour/model/snapshot.js';
import { createWildlifeActor } from '../../src/tour/wildlife/actor.js';
import { createWildlifePopulation } from '../../src/tour/wildlife/population.js';
import { disposeWildlifeModels } from '../../src/tour/wildlife/resources.js';

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0).reverse()) dispose();
});

async function fixture(catalogId: string, wide = false) {
  const data = new Uint8Array(await readFile('docs/demo/tour/models/cow.glb'));
  const gltf = await new GLTFLoader().parseAsync(data.buffer, '');
  cleanup.push(() => disposeWildlifeModels([gltf]));
  if (wide) gltf.scene.scale.x = 20;
  gltf.scene.updateMatrixWorld(true);
  const bounds = new Box3().setFromObject(gltf.scene, true);
  const model = parseTourSnapshot(sampleSnapshot());
  const anchor = model.placements[0];
  if (!anchor) throw new Error('Expected a dated sample placement');
  const placement = {
    ...anchor,
    source: { ...anchor.source, catalogId },
    position: { x: 12, y: 0, z: 4 },
  };
  return { model, placement, source: { gltf, bounds, height: bounds.getSize(new Vector3()).y } };
}

it('keeps all fish school members independently pickable as the original contribution', async () => {
  // Given one dated fish-school placement with a shared authored model.
  const { model, placement, source } = await fixture('fishSchool');
  const population = createWildlifePopulation(
    { ...model, placements: [placement] },
    {
      models: new Map([['fish', source]]),
      dispose: () => {},
    },
  );
  cleanup.push(population.dispose);
  // When the composition is instantiated.
  const positions = population.root.children.map((actor) => actor.position.toArray());
  // Then all three actors retain one contribution identity and distinct locations.
  expect(population.inspect().count).toBe(3);
  expect(new Set(positions.map((position) => position.join(','))).size).toBe(3);
  expect([...population.identities.values()]).toHaveLength(3);
  expect([...population.identities.values()].every((ids) => ids[0] === placement.source.id)).toBe(
    true,
  );
});

it('preserves the butterfly garden group above the source plant height', async () => {
  // Given the highest butterfly composition variant.
  const { model, placement, source } = await fixture('butterflyGarden');
  const population = createWildlifePopulation(
    { ...model, placements: [{ ...placement, source: { ...placement.source, variant: 2 } }] },
    {
      models: new Map([['butterfly', source]]),
      dispose: () => {},
    },
  );
  cleanup.push(population.dispose);
  // When all individuals are placed.
  const elevations = population.root.children.map(
    (actor) => new Box3().setFromObject(actor, true).min.y,
  );
  // Then the four butterflies keep their own flight heights rather than replacing the group with one.
  expect(elevations).toHaveLength(4);
  expect(Math.min(...elevations)).toBeGreaterThan(0.45);
});

it('limits a wide authored animal by horizontal span rather than height alone', async () => {
  // Given a broad source silhouette such as a whale or winged creature.
  const { placement, source } = await fixture('whale', true);
  const actor = createWildlifeActor(source, 'whale', placement);
  cleanup.push(actor.dispose);
  // When the world-space geometry is measured.
  const size = new Box3().setFromObject(actor.root, true).getSize(new Vector3());
  // Then it fits inside a four-meter calendar cell without distorting its proportions.
  expect(Math.hypot(size.x, size.z)).toBeLessThanOrEqual(3.4);
});

it('keeps an aquatic anchor at the surface throughout animation and frozen updates', async () => {
  // Given a fish at a fixed source waterline.
  const { placement, source } = await fixture('fish');
  const actor = createWildlifeActor(source, 'fish', placement);
  cleanup.push(actor.dispose);
  // When its pose clock advances, then receives the same paused time.
  actor.update(4);
  const anchor = actor.root.position.clone();
  const box = new Box3().setFromObject(actor.root, true);
  actor.update(4);
  // Then body motion cannot move the whole fish out of the water or advance a paused pose.
  expect(anchor.y).toBe(0);
  expect(actor.root.position).toEqual(anchor);
  expect(new Box3().setFromObject(actor.root, true)).toEqual(box);
  expect(box.min.y).toBeLessThan(0);
  expect(box.max.y).toBeGreaterThan(0);
});
