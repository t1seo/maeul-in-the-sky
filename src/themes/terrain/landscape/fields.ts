import type { VillageStyle } from '../../../core/render-options.js';
import { groundDistance, groundLine, groundPolygon, riverDistance } from './settlement-geometry.js';
import { sampleLandscape } from './sampling.js';
import type {
  LandscapeField,
  LandscapeModel,
  LandscapePoint,
  LandscapeSite,
  LandscapeSprite,
  LandscapeTown,
} from './types.js';
import { isLandscapeBuilding } from './sprite-size.js';

function field(
  model: LandscapeModel,
  center: LandscapeSite,
  id: string,
  angle: number,
  crop: LandscapeField['crop'],
  scale: number,
): LandscapeField | undefined {
  const rotate = (x: number, z: number): readonly [number, number] => [
    (x * Math.cos(angle) - z * Math.sin(angle)) * scale,
    (x * Math.sin(angle) + z * Math.cos(angle)) * scale,
  ];
  const points = groundPolygon(model, center, [
    rotate(-2.1, -1.35),
    rotate(2.2, -1.2),
    rotate(2.05, 1.4),
    rotate(-1.95, 1.25),
  ]);
  if (
    points.length < 4 ||
    points.some(
      (point) =>
        Math.abs(point.elevation - center.elevation) > 0.55 || riverDistance(model, point) < 0.35,
    )
  )
    return undefined;
  const rows: (readonly LandscapePoint[])[] = [];
  for (let row = 0; row < 6; row++) {
    const z = -0.95 + row * 0.38;
    const [ax, az] = rotate(-1.7, z),
      [bx, bz] = rotate(1.7, z);
    const a = sampleLandscape(model, center.x + ax, center.z + az),
      b = sampleLandscape(model, center.x + bx, center.z + bz);
    if (!a || !b) return undefined;
    const line = groundLine(model, a, b);
    if (!line.length) return undefined;
    rows.push(line);
  }
  return { id, points, crop, rows };
}

export function planLandscapeFields(
  model: LandscapeModel,
  towns: readonly LandscapeTown[],
  sprites: readonly LandscapeSprite[],
  style: VillageStyle,
): readonly LandscapeField[] {
  const result: LandscapeField[] = [];
  const centers: LandscapePoint[] = [];
  const protectedSprites = sprites.filter(
    (sprite) => sprite.kind === 'wonder' || isLandscapeBuilding(sprite.catalogId),
  );
  for (const [index, town] of towns.entries()) {
    let count = 0;
    for (let candidate = 0; candidate < 42 && count < 4; candidate++) {
      const radius = candidate < 14 ? 9.7 : candidate < 28 ? 7 : 5.5;
      const scale = candidate < 14 ? 1 : 0.65;
      const angle = ((candidate % 14) * Math.PI * 2) / 14 + index * 0.37;
      const center = sampleLandscape(
        model,
        town.center.x + Math.cos(angle) * radius,
        town.center.z + Math.sin(angle) * radius,
      );
      if (
        !center ||
        center.component !== town.center.component ||
        center.slope > 0.7 ||
        center.elevation < 0.3 ||
        riverDistance(model, center) < 2 ||
        centers.some((other) => groundDistance(center, other) < 3.8)
      )
        continue;
      if (
        towns.some((other) => groundDistance(other.center, center) < 4.5) ||
        protectedSprites.some((sprite) => groundDistance(sprite.position, center) < 3.3)
      )
        continue;
      const crop = style === 'korean' ? 'rice' : count % 3 === 2 ? 'vegetable' : 'wheat';
      const item = field(model, center, `field:${town.id}:${count}`, angle * 0.35, crop, scale);
      if (item) {
        result.push(item);
        centers.push(center);
        count++;
      }
    }
  }
  return result;
}
