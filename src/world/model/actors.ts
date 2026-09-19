import { WorldModelError } from './errors.js';
import { distance } from './math.js';
import type { WorldActor, WorldActorSample, WorldRoute } from './types.js';

export function sampleActor(
  actor: WorldActor,
  route: WorldRoute,
  elapsedSeconds: number,
): WorldActorSample {
  if (
    actor.routeId !== route.id ||
    route.length <= 0 ||
    route.points.length < 2 ||
    !Number.isFinite(elapsedSeconds)
  ) {
    throw new WorldModelError(
      'INVALID_INPUT',
      'Actor sampling requires its own nonempty route and a finite time',
    );
  }
  const travel = Math.max(0, elapsedSeconds) * actor.speed + actor.phase * route.length;
  const period = route.length * (route.loop ? 1 : 2);
  const cycle = travel % period;
  const reverse = !route.loop && cycle > route.length;
  let remaining = reverse ? period - cycle : cycle;
  for (let index = 1; index < route.points.length; index += 1) {
    const from = route.points[index - 1];
    const to = route.points[index];
    const length = distance(from, to);
    if (remaining <= length || index === route.points.length - 1) {
      if (length <= 0)
        throw new WorldModelError('INVALID_WORLD', `Route ${route.id} contains an empty segment`);
      const raw = Math.max(0, Math.min(1, remaining / length));
      const fraction = raw > 1 - 1e-12 ? 1 : raw < 1e-12 ? 0 : raw;
      return {
        actorId: actor.id,
        position: {
          x: from.x + (to.x - from.x) * fraction,
          y: from.y + (to.y - from.y) * fraction,
          z: from.z + (to.z - from.z) * fraction,
        },
        yaw: Math.atan2(to.x - from.x, to.z - from.z) + (reverse ? Math.PI : 0),
      };
    }
    remaining -= length;
  }
  throw new WorldModelError('INVALID_WORLD', `Route ${route.id} has no usable segment`);
}
