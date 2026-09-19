export type Vec3 = { readonly x: number; readonly y: number; readonly z: number };
export type WorldBounds = { readonly min: Vec3; readonly max: Vec3 };
export type WorldRange = { readonly from: string; readonly to: string };
export type WorldSeason = 'spring' | 'summer' | 'autumn' | 'winter';
export type WorldRegionKind = 'nature' | 'town' | 'city';

export type WorldIsland = {
  readonly id: string;
  readonly monthKeys: readonly string[];
  readonly center: Vec3;
  readonly bounds: WorldBounds;
  readonly regionIds: readonly string[];
};

export type WorldRegion = {
  readonly id: string;
  readonly islandId: string;
  readonly monthKey: string;
  readonly kind: WorldRegionKind;
  readonly boundary: readonly Vec3[];
  readonly tileIds: readonly string[];
};

export type WorldTile = {
  readonly id: string;
  readonly islandId: string;
  readonly regionId: string;
  readonly position: Vec3;
  readonly size: number;
  readonly surface: 'grass' | 'rock' | 'sand' | 'water' | 'path' | 'field';
  readonly source: 'day' | 'scenery';
  readonly date?: string;
  readonly activityHeight: number;
};

export type WorldWaterway = {
  readonly id: string;
  readonly islandId: string;
  readonly kind: 'river' | 'pond' | 'waterfall';
  readonly points: readonly Vec3[];
  readonly width: number;
};

export type WorldTerrain = {
  readonly tiles: readonly WorldTile[];
  readonly waterways: readonly WorldWaterway[];
  readonly waterLevel: number;
};

export type ModelPart = {
  readonly primitive: 'box' | 'cylinder' | 'cone' | 'sphere' | 'roof';
  readonly position: Vec3;
  readonly rotation: Vec3;
  readonly size: Vec3;
  readonly color: string;
  readonly roughness: number;
  readonly opacity: number;
};

export type ModelRecipe = {
  readonly key: string;
  readonly version: 1;
  readonly parts: readonly ModelPart[];
};

export type WorldModelFamily =
  | 'conifer'
  | 'broadleaf'
  | 'bamboo'
  | 'willow'
  | 'grove'
  | 'meadow'
  | 'reeds'
  | 'rocks'
  | 'pond'
  | 'hanok'
  | 'choga'
  | 'house'
  | 'barn'
  | 'market'
  | 'tower'
  | 'library'
  | 'pavilion'
  | 'orchard'
  | 'rice-terrace'
  | 'station'
  | 'dock'
  | 'courtyard'
  | 'pier'
  | 'stair'
  | 'train'
  | 'ferry'
  | 'deer'
  | 'resident'
  | 'lanterns'
  | 'harvest'
  | 'blossoms'
  | 'snow-lights'
  | 'monument'
  | 'pagoda';

export type WorldEntity = {
  readonly id: string;
  readonly kind:
    | 'asset'
    | 'scenery'
    | 'station'
    | 'dock'
    | 'courtyard'
    | 'pier'
    | 'stair'
    | 'festival'
    | 'repository'
    | 'release'
    | 'wonder';
  readonly islandId: string;
  readonly regionId: string;
  readonly position: Vec3;
  readonly yaw: number;
  readonly scale: Vec3;
  readonly modelKey: string;
  readonly variant: number;
  readonly visibleFrom: string;
  readonly date?: string;
  readonly catalogId?: string;
  readonly repoId?: string;
  readonly releaseId?: string;
  readonly parentId?: string;
  readonly label?: string;
};

export type WorldRouteNode = {
  readonly id: string;
  readonly position: Vec3;
  readonly islandId: string;
  readonly role: 'junction' | 'station' | 'dock';
  readonly entityId?: string;
};

export type WorldRoute = {
  readonly id: string;
  readonly kind: 'walk' | 'rail' | 'water';
  readonly nodeIds: readonly string[];
  readonly points: readonly Vec3[];
  readonly length: number;
  readonly visibleFrom: string;
  readonly loop: boolean;
};

export type WorldActor = {
  readonly id: string;
  readonly kind: 'train' | 'ferry' | 'wildlife' | 'resident';
  readonly modelKey: string;
  readonly routeId: string;
  readonly speed: number;
  readonly phase: number;
  readonly visibleFrom: string;
};

export type WorldActorSample = {
  readonly actorId: string;
  readonly position: Vec3;
  readonly yaw: number;
};
