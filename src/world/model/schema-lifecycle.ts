import { z } from 'zod';
import { worldDateSchema } from './dates.js';
import { monthKeySchema, vec3Schema, worldIdSchema } from './schema-geometry.js';

const dayCommon = {
  id: worldIdSchema,
  date: worldDateSchema,
  tileId: worldIdSchema,
  monthKey: monthKeySchema,
};
export const daySchema = z.discriminatedUnion('kind', [
  z.strictObject({ ...dayCommon, kind: z.literal('missing') }),
  z.strictObject({
    ...dayCommon,
    kind: z.literal('observed'),
    count: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
    rewardTier: z.union([
      z.literal(0),
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    consistency: z.strictObject({
      activeDays: z.number().int().min(0).max(28),
      observedDays: z.number().int().min(0).max(28),
      tier: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]),
      complete: z.boolean(),
    }),
  }),
]);
export const nodeSchema = z.strictObject({
  id: worldIdSchema,
  position: vec3Schema,
  islandId: worldIdSchema,
  role: z.enum(['junction', 'station', 'dock']),
  entityId: worldIdSchema.optional(),
});
export const routeSchema = z.strictObject({
  id: worldIdSchema,
  kind: z.enum(['walk', 'rail', 'water']),
  nodeIds: z.array(worldIdSchema).min(2).max(256),
  points: z.array(vec3Schema).min(2).max(256),
  length: z.number().finite().positive().max(10000),
  visibleFrom: worldDateSchema,
  loop: z.boolean(),
});
export const actorSchema = z.strictObject({
  id: worldIdSchema,
  kind: z.enum(['train', 'ferry', 'wildlife', 'resident']),
  modelKey: worldIdSchema,
  routeId: worldIdSchema,
  speed: z.number().finite().positive().max(100),
  phase: z.number().finite().min(0).max(1),
  visibleFrom: worldDateSchema,
});
export const eventSchema = z.strictObject({
  id: worldIdSchema,
  kind: z.enum([
    'market',
    'harvest',
    'lanterns',
    'blossoms',
    'snow-lights',
    'release',
    'milestone',
  ]),
  anchorId: worldIdSchema,
  startsOn: worldDateSchema,
  endsOn: worldDateSchema.optional(),
  evidence: z.strictObject({
    kind: z.enum(['consistency', 'contributions', 'release']),
    activeDays: z.number().int().min(0).max(28).optional(),
    observedDays: z.number().int().min(0).max(28).optional(),
    total: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER).optional(),
    repoId: worldIdSchema.optional(),
    releaseId: worldIdSchema.optional(),
  }),
});
export const discoverySchema = z.strictObject({
  id: worldIdSchema,
  entityId: worldIdSchema,
  catalogId: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[A-Za-z][A-Za-z0-9-]*$/)
    .optional(),
  title: z.string().min(1).max(500),
  description: z.string().min(1).max(2000),
  availableFrom: worldDateSchema,
});
