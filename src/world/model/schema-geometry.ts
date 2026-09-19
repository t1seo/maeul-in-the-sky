import { z } from 'zod';
import { worldDateSchema } from './dates.js';

export const worldIdSchema = z
  .string()
  .min(1)
  .max(256)
  .regex(/^[A-Za-z0-9][A-Za-z0-9:._-]*$/);
export const monthKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}$/)
  .refine((month) => worldDateSchema.safeParse(`${month}-01`).success);
const coordinate = z.number().finite().min(-1_000_000).max(1_000_000);
export const vec3Schema = z.strictObject({ x: coordinate, y: coordinate, z: coordinate });
export const boundsSchema = z
  .strictObject({ min: vec3Schema, max: vec3Schema })
  .refine(
    ({ min, max }) => min.x <= max.x && min.y <= max.y && min.z <= max.z,
    'Inverted world bounds',
  );
export const rangeSchema = z
  .strictObject({ from: worldDateSchema, to: worldDateSchema })
  .refine(({ from, to }) => from <= to, 'Inverted date range');
export const islandSchema = z.strictObject({
  id: worldIdSchema,
  monthKeys: z.array(monthKeySchema).min(1).max(30),
  center: vec3Schema,
  bounds: boundsSchema,
  regionIds: z.array(worldIdSchema).min(1).max(90),
});
export const regionSchema = z.strictObject({
  id: worldIdSchema,
  islandId: worldIdSchema,
  monthKey: monthKeySchema,
  kind: z.enum(['nature', 'town', 'city']),
  boundary: z.array(vec3Schema).min(3).max(128),
  tileIds: z.array(worldIdSchema).min(1).max(6000),
});
export const tileSchema = z.strictObject({
  id: worldIdSchema,
  islandId: worldIdSchema,
  regionId: worldIdSchema,
  position: vec3Schema,
  size: z.number().finite().positive().max(16),
  surface: z.enum(['grass', 'rock', 'sand', 'water', 'path', 'field']),
  source: z.enum(['day', 'scenery']),
  date: worldDateSchema.optional(),
  activityHeight: z.number().finite().min(0).max(1),
});
export const waterwaySchema = z.strictObject({
  id: worldIdSchema,
  islandId: worldIdSchema,
  kind: z.enum(['river', 'pond', 'waterfall']),
  points: z.array(vec3Schema).min(2).max(128),
  width: z.number().finite().positive().max(16),
});
const dimension = z.number().finite().positive().max(32);
const localCoordinate = z.number().finite().min(-32).max(32);
const localPosition = z.strictObject({
  x: localCoordinate,
  y: localCoordinate,
  z: localCoordinate,
});
export const modelRecipeSchema = z.strictObject({
  key: worldIdSchema,
  version: z.literal(1),
  parts: z
    .array(
      z.strictObject({
        primitive: z.enum(['box', 'cylinder', 'cone', 'sphere', 'roof']),
        position: localPosition,
        rotation: localPosition,
        size: z.strictObject({ x: dimension, y: dimension, z: dimension }),
        color: z.string().regex(/^#[A-Fa-f0-9]{6}$/),
        roughness: z.number().finite().min(0).max(1),
        opacity: z.number().finite().min(0).max(1),
      }),
    )
    .min(1)
    .max(256),
});
export const entitySchema = z.strictObject({
  id: worldIdSchema,
  kind: z.enum([
    'asset',
    'scenery',
    'station',
    'dock',
    'courtyard',
    'pier',
    'stair',
    'festival',
    'repository',
    'release',
    'wonder',
  ]),
  islandId: worldIdSchema,
  regionId: worldIdSchema,
  position: vec3Schema,
  yaw: z
    .number()
    .finite()
    .min(-Math.PI * 4)
    .max(Math.PI * 4),
  scale: z.strictObject({ x: dimension, y: dimension, z: dimension }),
  modelKey: worldIdSchema,
  variant: z.number().int().min(0).max(2),
  visibleFrom: worldDateSchema,
  date: worldDateSchema.optional(),
  catalogId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z][A-Za-z0-9-]*$/)
    .optional(),
  repoId: worldIdSchema.optional(),
  releaseId: worldIdSchema.optional(),
  parentId: worldIdSchema.optional(),
  label: z.string().min(1).max(500).optional(),
});
