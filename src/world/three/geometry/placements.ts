import { Color, Euler, Matrix4, Quaternion, Vector3 } from 'three';
import type { ModelPart, Vec3, WorldScene } from '../../model/types.js';
import type { SeasonalDetail } from './seasonal.js';

export type PartPlacement = {
  readonly id: string;
  readonly matrix: Matrix4;
  readonly color: Color;
  readonly seasonal: boolean;
  readonly regionId: string;
  readonly position: Vec3;
  readonly size: number;
  readonly essential: boolean;
  readonly detail?: SeasonalDetail;
};
export type BatchDraft = {
  readonly part: ModelPart;
  readonly recipeKey: string;
  readonly actor: boolean;
  readonly placements: PartPlacement[];
  readonly glow: boolean;
  readonly detail?: SeasonalDetail;
};

export function transform(position: Vec3, rotation: Vec3, size: Vec3): Matrix4 {
  return new Matrix4().compose(
    new Vector3(position.x, position.y, position.z),
    new Quaternion().setFromEuler(new Euler(rotation.x, rotation.y, rotation.z)),
    new Vector3(size.x, size.y, size.z),
  );
}

export function recipePlacements(
  scene: WorldScene,
  primitiveKey: (part: ModelPart, recipeKey: string) => string,
): ReadonlyMap<string, BatchDraft> {
  const recipes = new Map(scene.modelRecipes.map((recipe) => [recipe.key, recipe]));
  const drafts = new Map<string, BatchDraft>();
  const add = (
    id: string,
    recipeKey: string,
    position: Vec3,
    yaw: number,
    scale: Vec3,
    actor: boolean,
    regionId: string,
  ): void => {
    const recipe = recipes.get(recipeKey);
    if (!recipe) return;
    const matrix = transform(position, { x: 0, y: yaw, z: 0 }, scale);
    const sizes = recipe.parts.map((part) => {
      const [a, b] = [part.size.x * scale.x, part.size.y * scale.y, part.size.z * scale.z].sort(
        (a, b) => b - a,
      );
      return Math.sqrt(a * b);
    });
    const essential = [...sizes].sort((a, b) => b - a)[Math.min(2, sizes.length - 1)] ?? 0;
    for (const [index, part] of recipe.parts.entries()) {
      const key = `${actor}:${primitiveKey(part, recipeKey)}:${part.roughness}:${part.opacity}`;
      const color = new Color(part.color);
      const hsl = color.getHSL({ h: 0, s: 0, l: 0 });
      const glow =
        part.primitive === 'box' &&
        part.roughness <= 0.5 &&
        hsl.h > 0.05 &&
        hsl.h < 0.18 &&
        hsl.s > 0.35;
      const seasonal =
        (part.primitive === 'sphere' || part.primitive === 'cone') &&
        hsl.h > 0.18 &&
        hsl.h < 0.48 &&
        hsl.s > 0.15;
      const draft = drafts.get(`${key}:${glow}`) ?? {
        part,
        recipeKey,
        actor,
        placements: [],
        glow,
      };
      const placement = {
        id,
        matrix: matrix.clone().multiply(transform(part.position, part.rotation, part.size)),
        color,
        regionId,
        seasonal,
        position,
        size: sizes[index],
        essential: sizes[index] >= essential,
      };
      draft.placements.push(placement);
      drafts.set(`${key}:${glow}`, draft);
      const details: SeasonalDetail[] = [];
      if (seasonal || part.primitive === 'roof') details.push('snow');
      if (seasonal && part.primitive === 'sphere' && part.size.x > 0.15) details.push('flowers');
      for (const detail of details) {
        const detailKey = `${actor}:${primitiveKey(part, recipeKey)}:${detail}`;
        const detailDraft = drafts.get(detailKey) ?? {
          part,
          recipeKey,
          actor,
          placements: [],
          glow: false,
          detail,
        };
        detailDraft.placements.push({
          ...placement,
          seasonal: false,
          detail,
          color: new Color(detail === 'snow' ? '#e9f0e7' : '#f0b1c0'),
        });
        drafts.set(detailKey, detailDraft);
      }
    }
  };
  for (const entity of scene.entities)
    add(
      entity.id,
      entity.modelKey,
      entity.position,
      entity.yaw,
      entity.scale,
      false,
      entity.regionId,
    );
  for (const actor of scene.actors)
    add(actor.id, actor.modelKey, { x: 0, y: 0, z: 0 }, 0, { x: 1, y: 1, z: 1 }, true, '');
  return drafts;
}
