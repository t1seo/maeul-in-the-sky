import { Frustum, Group, Matrix4, Sphere, type PerspectiveCamera } from 'three';
import type { TourModel } from '../types.js';
import { wildlifeSpecies } from './catalog.js';
import { createWildlifeActor, type WildlifeActor } from './actor.js';
import type { WildlifeLibrary } from './library.js';

export function createWildlifePopulation(model: TourModel, library?: WildlifeLibrary) {
  const root = new Group();
  const actors: WildlifeActor[] = [];
  const identities = new Map<string, readonly string[]>();
  const placements = new Set<string>();
  try {
    for (const placement of model.placements) {
      const species = wildlifeSpecies(placement.source.catalogId);
      const source = species ? library?.models.get(species) : undefined;
      if (!species || !source) continue;
      const actor = createWildlifeActor(source, species, placement);
      actors.push(actor);
      root.add(actor.root);
      placements.add(placement.source.id);
      for (const mesh of actor.meshes) identities.set(mesh.uuid, [placement.source.id]);
    }
  } catch (error) {
    for (const actor of actors) actor.dispose();
    throw error;
  }
  const frustum = new Frustum();
  const matrix = new Matrix4();
  const sphere = new Sphere();
  const lastUpdates = new WeakMap<WildlifeActor, number>();
  let visible = 0;
  let previousElapsed = -1;
  let disposed = false;
  return {
    root,
    identities,
    placements,
    update: (elapsed: number, camera: PerspectiveCamera): void => {
      if (disposed) return;
      const advancing = elapsed !== previousElapsed;
      previousElapsed = elapsed;
      camera.updateMatrixWorld();
      frustum.setFromProjectionMatrix(
        matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse),
      );
      visible = 0;
      for (const actor of actors) {
        sphere.center.copy(actor.root.position).y += actor.height / 2;
        sphere.radius = actor.height * 2;
        actor.root.visible = frustum.intersectsSphere(sphere);
        if (!actor.root.visible) continue;
        visible++;
        if (!advancing) continue;
        const distance = camera.position.distanceToSquared(actor.root.position);
        if (distance > 36 * 36 && elapsed - (lastUpdates.get(actor) ?? 0) < 1 / 8) continue;
        actor.update(elapsed);
        lastUpdates.set(actor, elapsed);
      }
    },
    inspect: () => ({
      count: actors.length,
      visible,
      species: [...new Set(actors.map((actor) => actor.species))],
    }),
    dispose: (): void => {
      if (disposed) return;
      disposed = true;
      for (const actor of actors) actor.dispose();
      root.clear();
    },
  };
}
