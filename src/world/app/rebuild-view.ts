import { defaultWorldView } from '../model/index.js';
import type { WorldScene, WorldView } from '../model/types.js';

export function rebuildView(
  scene: WorldScene,
  view: WorldView,
  resetNavigation: boolean,
): WorldView {
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
  const focus = view.focus;
  let validFocus: boolean;
  switch (focus.kind) {
    case 'world':
      validFocus = true;
      break;
    case 'month':
      validFocus = scene.islands.some((island) => island.monthKeys.includes(focus.monthKey));
      break;
    case 'day':
      validFocus = days.has(focus.date);
      break;
    case 'entity':
      validFocus = entities.has(focus.entityId);
      break;
    case 'actor':
      validFocus = actors.has(focus.actorId);
      break;
    default:
      return focus satisfies never;
  }
  const reset = resetNavigation || !validFocus;
  return {
    ...view,
    selectedId: view.selectedId && selections.has(view.selectedId) ? view.selectedId : undefined,
    followActorId:
      !reset && view.followActorId && actors.has(view.followActorId)
        ? view.followActorId
        : undefined,
    focus: reset ? { kind: 'world' } : focus,
    camera: reset ? defaultWorldView(scene).camera : view.camera,
  };
}
