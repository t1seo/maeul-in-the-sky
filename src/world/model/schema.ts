import { z } from 'zod';
import { worldSettingsSchema } from './input.js';
import { MAX_WORLD_DAYS } from './dates.js';
import {
  boundsSchema,
  entitySchema,
  islandSchema,
  modelRecipeSchema,
  rangeSchema,
  regionSchema,
  tileSchema,
  waterwaySchema,
  worldIdSchema,
} from './schema-geometry.js';
import {
  actorSchema,
  daySchema,
  discoverySchema,
  eventSchema,
  nodeSchema,
  routeSchema,
} from './schema-lifecycle.js';

export const worldSceneSchema = z.strictObject({
  schemaVersion: z.literal(1),
  generatorVersion: z.literal(1),
  modelVersion: z.literal(1),
  worldId: worldIdSchema,
  sourceDigest: z
    .string()
    .min(1)
    .max(128)
    .regex(/^[A-Za-z0-9-]+$/),
  username: z
    .string()
    .min(1)
    .max(39)
    .regex(/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i),
  year: z.number().int().min(1).max(9999),
  range: rangeSchema,
  settings: worldSettingsSchema,
  days: z.array(daySchema).max(MAX_WORLD_DAYS),
  islands: z.array(islandSchema).min(1).max(30),
  regions: z.array(regionSchema).min(1).max(90),
  terrain: z.strictObject({
    tiles: z.array(tileSchema).min(1).max(8192),
    waterways: z.array(waterwaySchema).max(128),
    waterLevel: z.number().finite().min(-100).max(100),
  }),
  entities: z.array(entitySchema).max(8192),
  routeNodes: z.array(nodeSchema).max(1024),
  routes: z.array(routeSchema).max(96),
  actors: z.array(actorSchema).max(128),
  events: z.array(eventSchema).max(4096),
  discoveries: z.array(discoverySchema).max(8192),
  modelRecipes: z.array(modelRecipeSchema).max(256),
  bounds: boundsSchema,
});
