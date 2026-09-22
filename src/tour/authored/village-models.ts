import type { TourAsset } from '../types.js';
import type { AuthoredPart } from './types.js';

type VillageModel = {
  readonly file: string;
  readonly height: number;
  readonly span: number;
  readonly yaw?: number;
  readonly collider?: TourAsset['collider'];
};

const MODELS = {
  house: { file: 'house', height: 3.4, span: 3.5, collider: { halfX: 0.84, halfZ: 0.92 } },
  houseB: { file: 'house-b', height: 3.25, span: 3.6, collider: { halfX: 1.08, halfZ: 1.44 } },
  houseWinter: {
    file: 'house-snow',
    height: 3.4,
    span: 3.5,
    collider: { halfX: 0.84, halfZ: 0.92 },
  },
  houseBWinter: {
    file: 'house-b-snow',
    height: 3.25,
    span: 3.6,
    collider: { halfX: 1.08, halfZ: 1.44 },
  },
  barn: { file: 'barn', height: 2.7, span: 3.6, collider: { halfX: 1.66, halfZ: 1.81 } },
  barnWinter: { file: 'barn-snow', height: 2.7, span: 3.6, collider: { halfX: 1.66, halfZ: 1.81 } },
  warehouse: { file: 'warehouse', height: 2.7, span: 3.4, collider: { halfX: 1.65, halfZ: 1.72 } },
  inn: { file: 'inn', height: 3.1, span: 3.8, collider: { halfX: 1.69, halfZ: 1.67 } },
  tavern: { file: 'inn', height: 3.1, span: 3.8, collider: { halfX: 1.69, halfZ: 1.67 } },
  blacksmith: { file: 'blacksmith', height: 2.9, span: 3.8, collider: { halfX: 1.68, halfZ: 1.5 } },
  stable: { file: 'stable', height: 2.7, span: 4, collider: { halfX: 1.9, halfZ: 1.36 } },
  silo: { file: 'silo', height: 3.1, span: 1.55, collider: { halfX: 0.64, halfZ: 0.58 } },
  windmill: { file: 'windmill', height: 4.3, span: 3.4, collider: { halfX: 1.4, halfZ: 1.18 } },
  windmillGrand: {
    file: 'windmill',
    height: 5.6,
    span: 4.2,
    collider: { halfX: 1.96, halfZ: 1.08 },
  },
  tower: { file: 'bell-tower', height: 4.4, span: 2.2, collider: { halfX: 0.72, halfZ: 0.83 } },
  market: { file: 'market', height: 2.2, span: 2.6, collider: null },
  well: { file: 'well', height: 1.5, span: 1.4 },
  barrel: { file: 'barrel', height: 0.95, span: 0.8 },
  fence: { file: 'fence', height: 1.05, span: 2.55 },
  haybale: { file: 'hay', height: 0.9, span: 0.75 },
  campfire: { file: 'campfire', height: 0.35, span: 1.3, collider: null },
  tent: { file: 'tent', height: 1.8, span: 3.3, collider: { halfX: 0.83, halfZ: 1.59 } },
  torch: { file: 'torch', height: 2, span: 0.55, collider: null },
  iceCreamCart: { file: 'vendor-cart', height: 1.9, span: 2.2 },
  castle: { file: 'castle', height: 3.2, span: 5.2, collider: null },
  colosseum: { file: 'colosseum', height: 2, span: 5.7, collider: null },
  pagoda: { file: 'pagoda', height: 5.7, span: 3.4, collider: { halfX: 0.62, halfZ: 0.62 } },
  torii: { file: 'torii', height: 3.7, span: 4.4, yaw: Math.PI / 4, collider: null },
  cart: { file: 'cargo-cart', height: 1.05, span: 1.75 },
  wagon: { file: 'cargo-cart', height: 1.3, span: 2.2 },
  lantern: { file: 'lantern', height: 2.15, span: 0.4, collider: null },
  winterLantern: { file: 'lantern', height: 2.15, span: 0.4, collider: null },
  fountain: { file: 'fountain', height: 0.72, span: 2.7 },
  frozenFountain: { file: 'fountain', height: 0.72, span: 2.7 },
  hanok: { file: 'hanok', height: 2.5, span: 4.8, collider: { halfX: 1.87, halfZ: 1.09 } },
  hanokGate: { file: 'hanok-gate', height: 3.8, span: 4.9, collider: null },
  gatehouse: { file: 'hanok-gate', height: 3.8, span: 4.9, collider: null },
  church: { file: 'church', height: 3.6, span: 2.8, collider: { halfX: 1.14, halfZ: 1.28 } },
} as const satisfies Readonly<Record<string, VillageModel>>;

export const VILLAGE_MODELS: ReadonlyMap<string, VillageModel> = new Map(Object.entries(MODELS));

export function villagePart(
  file: string,
  height: number,
  maxSpan: number,
  options: Omit<AuthoredPart, 'file' | 'height' | 'maxSpan'> = {},
): AuthoredPart {
  return { file: `village/${file}.glb`, height, maxSpan, ...options };
}
