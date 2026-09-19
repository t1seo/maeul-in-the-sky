import { resolveRenderSettings } from '../../core/settings/resolve.js';
import type { WorldInput, WorldScene } from './types.js';
import { defaultWorldSettings } from './defaults.js';

const snapshot = {
  schemaVersion: 1,
  kind: 'maeul-snapshot',
  username: 'world-fixture',
  year: 2024,
  weeks: [
    {
      firstDay: '2024-02-25',
      days: [
        { date: '2024-02-28', count: 5, level: 1 },
        { date: '2024-02-29', count: 0, level: 0 },
      ],
    },
  ],
  settings: resolveRenderSettings({ style: 'korean', motion: 'off' }),
  source: { kind: 'sample' },
} satisfies WorldInput['snapshot'];

export const TINY_WORLD_INPUT: WorldInput = {
  snapshot,
  settings: defaultWorldSettings(snapshot),
  repositories: [],
  range: { from: '2024-02-28', to: '2024-02-29' },
};

export const TINY_WORLD_SCENE: WorldScene = {
  schemaVersion: 1,
  generatorVersion: 1,
  modelVersion: 1,
  worldId: 'world:world-fixture:2024:fixture',
  sourceDigest: 'fixture-v1',
  username: 'world-fixture',
  year: 2024,
  range: TINY_WORLD_INPUT.range ?? { from: '2024-02-28', to: '2024-02-29' },
  settings: TINY_WORLD_INPUT.settings,
  days: [
    {
      id: 'day:2024-02-28',
      date: '2024-02-28',
      monthKey: '2024-02',
      tileId: 'tile:2024-02-28',
      kind: 'observed',
      count: 5,
      rewardTier: 2,
      consistency: { activeDays: 1, observedDays: 1, tier: 0, complete: false },
    },
    {
      id: 'day:2024-02-29',
      date: '2024-02-29',
      monthKey: '2024-02',
      tileId: 'tile:2024-02-29',
      kind: 'observed',
      count: 0,
      rewardTier: 0,
      consistency: { activeDays: 1, observedDays: 2, tier: 0, complete: false },
    },
  ],
  islands: [
    {
      id: 'island:2024-02',
      monthKeys: ['2024-02'],
      center: { x: 0, y: 0, z: 0 },
      bounds: { min: { x: -2, y: -1, z: -2 }, max: { x: 2, y: 3, z: 2 } },
      regionIds: ['region:2024-02:nature'],
    },
  ],
  regions: [
    {
      id: 'region:2024-02:nature',
      islandId: 'island:2024-02',
      monthKey: '2024-02',
      kind: 'nature',
      boundary: [
        { x: -2, y: 0, z: -2 },
        { x: 2, y: 0, z: -2 },
        { x: 2, y: 0, z: 2 },
        { x: -2, y: 0, z: 2 },
      ],
      tileIds: ['tile:2024-02-28', 'tile:2024-02-29'],
    },
  ],
  terrain: {
    waterLevel: 0,
    waterways: [],
    tiles: [
      {
        id: 'tile:2024-02-28',
        islandId: 'island:2024-02',
        regionId: 'region:2024-02:nature',
        position: { x: 0, y: 0.4, z: 0 },
        size: 1,
        surface: 'grass',
        source: 'day',
        date: '2024-02-28',
        activityHeight: 0.1,
      },
      {
        id: 'tile:2024-02-29',
        islandId: 'island:2024-02',
        regionId: 'region:2024-02:nature',
        position: { x: 1, y: 0.4, z: 0 },
        size: 1,
        surface: 'grass',
        source: 'day',
        date: '2024-02-29',
        activityHeight: 0,
      },
    ],
  },
  entities: [
    {
      id: 'asset:2024-02-28',
      kind: 'asset',
      islandId: 'island:2024-02',
      regionId: 'region:2024-02:nature',
      position: { x: 0, y: 0.5, z: 0 },
      yaw: 0,
      scale: { x: 1, y: 1, z: 1 },
      modelKey: 'tree',
      variant: 0,
      visibleFrom: '2024-02-28',
      date: '2024-02-28',
      catalogId: 'pine',
    },
  ],
  routeNodes: [],
  routes: [],
  actors: [],
  events: [],
  discoveries: [
    {
      id: 'discovery:2024-02-28',
      entityId: 'asset:2024-02-28',
      catalogId: 'pine',
      title: 'A first grove',
      description: 'Five observed contributions grew this dated grove.',
      availableFrom: '2024-02-28',
    },
  ],
  modelRecipes: [
    {
      key: 'tree',
      version: 1,
      parts: [
        {
          primitive: 'cylinder',
          position: { x: 0, y: 0.25, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          size: { x: 0.1, y: 0.5, z: 0.1 },
          color: '#79553d',
          roughness: 0.9,
          opacity: 1,
        },
        {
          primitive: 'cone',
          position: { x: 0, y: 0.7, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          size: { x: 0.7, y: 1, z: 0.7 },
          color: '#477650',
          roughness: 0.9,
          opacity: 1,
        },
      ],
    },
  ],
  bounds: { min: { x: -2, y: -1, z: -2 }, max: { x: 2, y: 3, z: 2 } },
};
