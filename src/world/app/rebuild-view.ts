import { defaultWorldView } from '../model/index.js';
import type { WorldScene, WorldView } from '../model/types.js';

export function rebuildView(scene: WorldScene, view: WorldView): WorldView {
  const days = new Set(scene.days.map((day) => day.date));
  const entities = new Set(scene.entities.map((entity) => entity.id));
  const actors = new Set(scene.actors.map((actor) => actor.id));
  const selections = new Set([
    ...days,
    ...entities,
    ...actors,
    ...scene.days.map((day) => day.id),
    ...scene.regions.map((region) => region.id),
  ]);
  return {
    ...view,
    selectedId: view.selectedId && selections.has(view.selectedId) ? view.selectedId : undefined,
    followActorId: undefined,
    focus: { kind: 'world' },
    camera: defaultWorldView(scene).camera,
  };
}
