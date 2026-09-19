import { z } from 'zod';
import { contributionDateSchema } from '../../core/settings/snapshot-schema.js';
import type { WorldScene, WorldView } from '../model/types.js';
import { WorldDataError } from './errors.js';

const vector = z
  .object({ x: z.number().finite(), y: z.number().finite(), z: z.number().finite() })
  .strict();
const focus = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('world') }).strict(),
  z.object({ kind: z.literal('month'), monthKey: z.string() }).strict(),
  z.object({ kind: z.literal('day'), date: contributionDateSchema }).strict(),
  z.object({ kind: z.literal('entity'), entityId: z.string() }).strict(),
  z.object({ kind: z.literal('actor'), actorId: z.string() }).strict(),
]);
const viewSchema = z
  .object({
    cursorDate: contributionDateSchema,
    seasonOverride: z.enum(['calendar', 'spring', 'summer', 'autumn', 'winter']),
    lighting: z.enum(['day', 'sunset', 'night']),
    weather: z.enum(['seasonal', 'clear', 'rain', 'snow']),
    motion: z.enum(['full', 'subtle', 'off']),
    quality: z.enum(['low', 'high']),
    selectedId: z.string().optional(),
    followActorId: z.string().optional(),
    focus,
    camera: z
      .object({ position: vector, target: vector, zoom: z.number().finite().positive() })
      .strict(),
    elapsedSeconds: z.number().finite().nonnegative(),
  })
  .strict();

export function parseWorldView(input: unknown, scene: WorldScene): WorldView {
  const result = viewSchema.safeParse(input);
  if (!result.success)
    throw new WorldDataError('invalid_input', 'The saved camera or world view is invalid.');
  const view = result.data;
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
  let validFocus: boolean;
  switch (view.focus.kind) {
    case 'world':
      validFocus = true;
      break;
    case 'month':
      validFocus = scene.islands.some((island) =>
        island.monthKeys.includes(view.focus.kind === 'month' ? view.focus.monthKey : ''),
      );
      break;
    case 'day':
      validFocus = days.has(view.focus.date);
      break;
    case 'entity':
      validFocus = entities.has(view.focus.entityId);
      break;
    case 'actor':
      validFocus = actors.has(view.focus.actorId);
      break;
    default:
      return view.focus satisfies never;
  }
  if (
    !validFocus ||
    view.cursorDate < scene.range.from ||
    view.cursorDate > scene.range.to ||
    (view.selectedId !== undefined && !selections.has(view.selectedId)) ||
    (view.followActorId !== undefined && !actors.has(view.followActorId))
  )
    throw new WorldDataError(
      'invalid_input',
      'The saved view refers to a place or date outside this world.',
    );
  return view;
}
