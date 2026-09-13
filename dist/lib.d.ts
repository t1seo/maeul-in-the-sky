import { Server } from 'node:http';

declare const VILLAGE_PRESETS: {
  readonly nature: {
    readonly displayName: 'Nature';
    readonly description: 'Fewer buildings, with more forests and open terrain';
    readonly density: 2;
  };
  readonly balanced: {
    readonly displayName: 'Balanced';
    readonly description: 'A mix of nature, farms, villages, and cities';
    readonly density: 5;
  };
  readonly civilization: {
    readonly displayName: 'Civilization';
    readonly description: 'More buildings across everyday contribution levels';
    readonly density: 9;
  };
};
type VillagePreset = keyof typeof VILLAGE_PRESETS;
declare const DEFAULT_VILLAGE_PRESET: VillagePreset;
declare function isVillagePreset(value: string): value is VillagePreset;

type MotionMode = 'full' | 'subtle' | 'off';
type TerrainLayout = 'banner' | 'card';
type VillageStyle$1 = 'classic' | 'korean';
type Hemisphere = 'north' | 'south';
type NormalizationOptions =
  | {
      readonly kind: 'relative';
    }
  | {
      readonly kind: 'fixed';
      readonly maxCount: number;
    };
type ResolvedRenderSettings = {
  readonly preset: VillagePreset;
  readonly density: number;
  readonly title: string;
  readonly hemisphere: Hemisphere;
  readonly motion: MotionMode;
  readonly layout: TerrainLayout;
  readonly style: VillageStyle$1;
  readonly normalization: NormalizationOptions;
  readonly layoutSeed?: string;
};
type RenderSettingsInput = Omit<Partial<ResolvedRenderSettings>, 'style'> & {
  readonly style?: VillageStyle$1;
  readonly villageStyle?: VillageStyle$1;
};
type NormalizationSummary = {
  readonly kind: 'relative' | 'fixed';
  readonly maxCount: number;
  readonly source: 'relative-p90' | 'explicit-fixed' | 'shared-p90';
};

/** A single day's contribution data */
interface ContributionDay {
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Raw contribution count */
  count: number;
  /** GitHub's intensity level (0 = none, 4 = max) */
  level: 0 | 1 | 2 | 3 | 4;
}
/** Available contribution days in one Sunday–Saturday calendar week */
interface ContributionWeek {
  /** Available days, sorted by date; edge weeks may be partial */
  days: ContributionDay[];
  /** ISO date of the calendar week's Sunday */
  firstDay: string;
}
/** Computed statistics from contribution data */
interface ContributionStats {
  /** Total contributions in the requested range */
  total: number;
  /** Longest consecutive contribution streak (days) */
  longestStreak: number;
  /** Current active streak (days, 0 if broken) */
  currentStreak: number;
  /** Most active day of the week (e.g., "Wednesday") */
  mostActiveDay: string;
  /** Number of days with at least one contribution */
  activeDays: number;
  /** Most active calendar month in YYYY-MM format, or empty when inactive */
  busiestMonth: string;
  /** First available contribution date in YYYY-MM-DD format */
  fromDate: string;
  /** Last available contribution date in YYYY-MM-DD format */
  toDate: string;
}
/** Complete contribution data for a requested calendar range */
interface ContributionData {
  /** Sunday-based calendar weeks, typically 52 or 53 */
  weeks: ContributionWeek[];
  /** Computed statistics */
  stats: ContributionStats;
  /** Effective year used for deterministic terrain variants */
  year: number;
  /** GitHub username */
  username: string;
}
/** Options passed to theme renderers */
interface ThemeOptions {
  /** Title text displayed in the SVG */
  title: string;
  /** SVG viewBox width (default: 840) */
  width: number;
  /** SVG viewBox height (default: 240) */
  height: number;
  /** Hemisphere for seasonal terrain (default: 'north') */
  hemisphere?: 'north' | 'south';
  /** Building density 1-10 (default: 5, higher = buildings at lower activity) */
  density?: number;
  motion?: MotionMode;
  layout?: TerrainLayout;
  style?: VillageStyle$1;
  villageStyle?: VillageStyle$1;
  normalization?: NormalizationOptions;
  layoutSeed?: string;
}
/** Rendered SVG output for both color modes */
interface ThemeOutput {
  /** SVG string for dark mode (GitHub dark: #0d1117) */
  dark: string;
  /** SVG string for light mode (GitHub light: #ffffff) */
  light: string;
}
/** Theme renderer interface — each theme must implement this */
interface Theme {
  /** Unique theme identifier (e.g., "terrain") */
  name: string;
  /** Human-readable display name */
  displayName: string;
  /** Brief description */
  description: string;
  /** Render contribution data into dark and light SVGs */
  render(data: ContributionData, options: ThemeOptions): ThemeOutput;
}
/** GitHub color mode */
type ColorMode = 'dark' | 'light';

/**
 * Computes contribution statistics from weekly contribution data.
 *
 * @param weeks - Sunday-based contribution weeks; edge weeks may be partial
 * @returns Computed statistics including total, streaks, and most active day
 */
declare function computeStats(weeks: ContributionWeek[]): ContributionStats;

/**
 * Register a theme in the global registry
 * @param theme - Theme to register
 */
declare function registerTheme(theme: Theme): void;
/**
 * Retrieve a theme by its unique name
 * @param name - Theme identifier
 * @returns The theme, or undefined if not found
 */
declare function getTheme(name: string): Theme | undefined;
/**
 * List all registered theme names
 * @returns Array of theme identifiers
 */
declare function listThemes(): string[];

type SceneBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
type SceneBiome = {
  readonly isRiver: boolean;
  readonly isPond: boolean;
  readonly nearWater: boolean;
  readonly forestDensity: number;
};
type SceneCell = {
  readonly date: string;
  readonly week: number;
  readonly day: number;
  readonly absoluteWeek: number;
  readonly count: number;
  readonly level100: number;
  readonly height: number;
  readonly isoX: number;
  readonly isoY: number;
};
type SceneBiomeEntry = {
  readonly week: number;
  readonly day: number;
  readonly biome: SceneBiome;
};
type ScenePlacement = {
  readonly id: string;
  readonly catalogId: string;
  readonly anchorDate: string;
  readonly week: number;
  readonly day: number;
  readonly cx: number;
  readonly cy: number;
  readonly footprint: SceneBounds;
  readonly drawOrder: number;
  readonly variant: number;
  readonly animated: boolean;
  readonly decorative?: boolean;
};
type WonderThreshold = {
  readonly metric: 'level100' | 'richness' | 'total' | 'longestStreak';
  readonly required: number;
  readonly current: number;
  readonly achieved: boolean;
};
type SceneWonderPlacement = ScenePlacement & {
  readonly tier: 'rare' | 'epic' | 'legendary';
  readonly thresholds: readonly WonderThreshold[];
  readonly explanation: string;
};
type NeighborhoodPath = {
  readonly id: string;
  readonly catalogId: string;
  readonly anchorDate: string;
  readonly week: number;
  readonly day: number;
  readonly footprint: SceneBounds;
  readonly drawOrder: number;
  readonly points: readonly {
    readonly x: number;
    readonly y: number;
  }[];
};
type LayoutSeedPolicy = {
  readonly root: string;
  readonly policy: 'username-date-v1';
};
type TerrainScene = {
  readonly schemaVersion: 1;
  readonly layoutVersion: 1;
  readonly username: string;
  readonly year: number;
  readonly fromDate: string;
  readonly toDate: string;
  readonly settings: ResolvedRenderSettings;
  readonly normalization: NormalizationSummary;
  readonly stats: Readonly<ContributionStats>;
  readonly seed: LayoutSeedPolicy;
  readonly cells: readonly SceneCell[];
  readonly biomes: readonly SceneBiomeEntry[];
  readonly placements: readonly ScenePlacement[];
  readonly wonders: readonly SceneWonderPlacement[];
  readonly neighborhoodPaths: readonly NeighborhoodPath[];
  readonly bounds: SceneBounds;
};
type TerrainCellMetadata = {
  readonly date: string;
  readonly count: number;
  readonly week: number;
  readonly day: number;
  readonly level100: number;
  readonly biome: SceneBiome;
  readonly assetIds: readonly string[];
  readonly wonderIds: readonly string[];
};
type TerrainMetadata = {
  readonly schemaVersion: 1;
  readonly layoutVersion: 1;
  readonly username: string;
  readonly year: number;
  readonly fromDate: string;
  readonly toDate: string;
  readonly dataDayCount: number;
  readonly missingDayCount: number;
  readonly stats: Readonly<ContributionStats>;
  readonly normalization: NormalizationSummary;
  readonly seed: LayoutSeedPolicy;
  readonly bounds: SceneBounds;
  readonly cells: readonly TerrainCellMetadata[];
  readonly placements: readonly ScenePlacement[];
  readonly wonders: readonly SceneWonderPlacement[];
  readonly neighborhoodPaths: readonly NeighborhoodPath[];
};
type TerrainRenderResult = {
  readonly dark: string;
  readonly light: string;
  readonly metadata: TerrainMetadata;
};

type TerrainRenderOptions = Partial<ThemeOptions> & {
  readonly preset?: VillagePreset;
  readonly namespace?: string;
};
type TerrainSceneRenderOptions = Pick<
  TerrainRenderOptions,
  'width' | 'height' | 'title' | 'motion' | 'layout' | 'namespace'
>;

declare function prepareTerrainScene(
  data: ContributionData,
  options?: TerrainRenderOptions,
): TerrainScene;

declare function renderTerrainScene(
  scene: TerrainScene,
  mode: ColorMode,
  options?: TerrainSceneRenderOptions,
): string;

declare function renderTerrain(
  data: ContributionData,
  options?: TerrainRenderOptions,
): TerrainRenderResult;

interface AssetColors {
  trunk: string;
  pine: string;
  leaf: string;
  bush: string;
  roofA: string;
  roofB: string;
  wall: string;
  wallShade: string;
  church: string;
  fence: string;
  wheat: string;
  sheep: string;
  sheepHead: string;
  cow: string;
  cowSpot: string;
  chicken: string;
  whale: string;
  whaleBelly: string;
  boat: string;
  sail: string;
  fish: string;
  flag: string;
  windmill: string;
  windBlade: string;
  well: string;
  chimney: string;
  path: string;
  water: string;
  waterLight: string;
  deer: string;
  horse: string;
  flower: string;
  flowerCenter: string;
  mushroom: string;
  mushroomCap: string;
  rock: string;
  boulder: string;
  palm: string;
  willow: string;
  seagull: string;
  dock: string;
  tent: string;
  tentStripe: string;
  hut: string;
  market: string;
  marketAwning: string;
  inn: string;
  innSign: string;
  blacksmith: string;
  anvil: string;
  castle: string;
  castleRoof: string;
  tower: string;
  bridge: string;
  cart: string;
  barrel: string;
  torch: string;
  torchFlame: string;
  cobble: string;
  smoke: string;
  bird: string;
  scarecrow: string;
  scarecrowHat: string;
  stump: string;
  riverOverlay: string;
  pondOverlay: string;
  reeds: string;
  fountain: string;
  fountainWater: string;
  canal: string;
  gardenTree: string;
  ricePaddy: string;
  ricePaddyWater: string;
  jellyfish: string;
  coral: string;
  turtle: string;
  buoy: string;
  lighthouse: string;
  crab: string;
  driftwood: string;
  sandcastle: string;
  tidePools: string;
  heron: string;
  shellfish: string;
  cattail: string;
  frog: string;
  lily: string;
  rabbit: string;
  fox: string;
  butterfly: string;
  butterflyWing: string;
  beehive: string;
  wildflower: string;
  tallGrass: string;
  birchBark: string;
  haybale: string;
  owl: string;
  squirrel: string;
  moss: string;
  fern: string;
  deadTree: string;
  log: string;
  berryBush: string;
  berry: string;
  spiderWeb: string;
  silo: string;
  pig: string;
  trough: string;
  haystack: string;
  orchard: string;
  orchardFruit: string;
  beeFarm: string;
  pumpkin: string;
  tavern: string;
  tavernSign: string;
  bakery: string;
  stable: string;
  gardenFence: string;
  laundry: string;
  doghouse: string;
  shrine: string;
  wagon: string;
  cathedral: string;
  cathedralWindow: string;
  library: string;
  clocktower: string;
  clockFace: string;
  statue: string;
  parkBench: string;
  warehouse: string;
  gatehouse: string;
  manor: string;
  manorGarden: string;
  signpost: string;
  lantern: string;
  lanternGlow: string;
  woodpile: string;
  puddle: string;
  campfire: string;
  campfireFlame: string;
  snowCap: string;
  snowGround: string;
  ice: string;
  icicle: string;
  frozenWater: string;
  igloo: string;
  sledWood: string;
  sledRunner: string;
  scarfRed: string;
  snowmanCoal: string;
  snowmanCarrot: string;
  winterBirdRed: string;
  winterBirdBrown: string;
  firewoodLog: string;
  bareBranch: string;
  frostWhite: string;
  cherryPetalPink: string;
  cherryPetalWhite: string;
  cherryTrunk: string;
  cherryBranch: string;
  tulipRed: string;
  tulipYellow: string;
  tulipPurple: string;
  tulipStem: string;
  sproutGreen: string;
  nestBrown: string;
  eggBlue: string;
  eggWhite: string;
  crocusPurple: string;
  crocusYellow: string;
  lambWool: string;
  birdhouseWood: string;
  gardenSoil: string;
  parasolRed: string;
  parasolBlue: string;
  parasolYellow: string;
  parasolStripe: string;
  beachTowelA: string;
  beachTowelB: string;
  sandcastleWall: string;
  surfboardBody: string;
  surfboardStripe: string;
  iceCreamCart: string;
  iceCreamUmbrella: string;
  hammockFabric: string;
  sunflowerPetal: string;
  sunflowerCenter: string;
  watermelonRind: string;
  watermelonFlesh: string;
  watermelonSeed: string;
  lemonadeStand: string;
  sprinklerMetal: string;
  poolWater: string;
  poolEdge: string;
  mapleRed: string;
  mapleCrimson: string;
  mapleOrange: string;
  oakGold: string;
  oakBrown: string;
  birchYellow: string;
  ginkgoYellow: string;
  fallenLeafRed: string;
  fallenLeafOrange: string;
  fallenLeafGold: string;
  fallenLeafBrown: string;
  acornBody: string;
  acornCap: string;
  cornStalkColor: string;
  cornEar: string;
  harvestApple: string;
  harvestGrape: string;
  hotDrinkMug: string;
  hotDrinkSteam: string;
  wreathGreen: string;
  wreathBerry: string;
  autumnGold: string;
  autumnBronze: string;
  autumnBurgundy: string;
  autumnRust: string;
  autumnOlive: string;
  blossomPink: string;
  blossomWhite: string;
  peachPink: string;
  icicleBlue: string;
  christmasRed: string;
  christmasGold: string;
  christmasGreen: string;
  appleRed: string;
  oliveGreen: string;
  oliveFruit: string;
  lemonYellow: string;
  orangeFruit: string;
  pearGreen: string;
  peachFruit: string;
  donkey: string;
  goat: string;
  goatHorn: string;
  shadow: string;
  bushDark: string;
  leafLight: string;
  flowerAlt: string;
  epicGold: string;
  epicMarble: string;
  epicJade: string;
  epicCrystal: string;
  epicMagic: string;
  epicPortal: string;
}

type AssetType =
  | 'whale'
  | 'fish'
  | 'fishSchool'
  | 'boat'
  | 'seagull'
  | 'dock'
  | 'waves'
  | 'kelp'
  | 'coral'
  | 'jellyfish'
  | 'turtle'
  | 'buoy'
  | 'sailboat'
  | 'lighthouse'
  | 'crab'
  | 'rock'
  | 'boulder'
  | 'flower'
  | 'bush'
  | 'driftwood'
  | 'sandcastle'
  | 'tidePools'
  | 'heron'
  | 'shellfish'
  | 'cattail'
  | 'frog'
  | 'lily'
  | 'pine'
  | 'deciduous'
  | 'mushroom'
  | 'stump'
  | 'deer'
  | 'rabbit'
  | 'fox'
  | 'butterfly'
  | 'beehive'
  | 'wildflowerPatch'
  | 'tallGrass'
  | 'birch'
  | 'haybale'
  | 'willow'
  | 'palm'
  | 'bird'
  | 'owl'
  | 'squirrel'
  | 'moss'
  | 'fern'
  | 'deadTree'
  | 'log'
  | 'berryBush'
  | 'spider'
  | 'wheat'
  | 'fence'
  | 'scarecrow'
  | 'barn'
  | 'sheep'
  | 'cow'
  | 'chicken'
  | 'horse'
  | 'ricePaddy'
  | 'silo'
  | 'pigpen'
  | 'trough'
  | 'haystack'
  | 'orchard'
  | 'beeFarm'
  | 'pumpkin'
  | 'appleTree'
  | 'oliveTree'
  | 'lemonTree'
  | 'orangeTree'
  | 'pearTree'
  | 'peachTree'
  | 'donkey'
  | 'goat'
  | 'tent'
  | 'hut'
  | 'house'
  | 'houseB'
  | 'church'
  | 'windmill'
  | 'well'
  | 'tavern'
  | 'bakery'
  | 'stable'
  | 'garden'
  | 'laundry'
  | 'doghouse'
  | 'shrine'
  | 'wagon'
  | 'market'
  | 'inn'
  | 'blacksmith'
  | 'castle'
  | 'tower'
  | 'bridge'
  | 'cathedral'
  | 'library'
  | 'clocktower'
  | 'statue'
  | 'park'
  | 'warehouse'
  | 'gatehouse'
  | 'manor'
  | 'reeds'
  | 'fountain'
  | 'canal'
  | 'watermill'
  | 'gardenTree'
  | 'pondLily'
  | 'cart'
  | 'barrel'
  | 'torch'
  | 'flag'
  | 'cobblePath'
  | 'smoke'
  | 'signpost'
  | 'lantern'
  | 'woodpile'
  | 'puddle'
  | 'campfire'
  | 'snowPine'
  | 'snowDeciduous'
  | 'snowman'
  | 'snowdrift'
  | 'igloo'
  | 'frozenPond'
  | 'icicle'
  | 'sled'
  | 'snowCoveredRock'
  | 'bareBush'
  | 'winterBird'
  | 'firewood'
  | 'houseWinter'
  | 'houseBWinter'
  | 'barnWinter'
  | 'churchWinter'
  | 'christmasTree'
  | 'winterLantern'
  | 'frozenFountain'
  | 'cherryBlossom'
  | 'cherryBlossomSmall'
  | 'cherryPetals'
  | 'tulip'
  | 'tulipField'
  | 'sprout'
  | 'nest'
  | 'lamb'
  | 'crocus'
  | 'rainPuddle'
  | 'birdhouse'
  | 'gardenBed'
  | 'cherryBlossomFull'
  | 'cherryBlossomBranch'
  | 'peachBlossom'
  | 'flowerBed'
  | 'wateringCan'
  | 'seedling'
  | 'robinBird'
  | 'butterflyGarden'
  | 'umbrella'
  | 'parasol'
  | 'beachTowel'
  | 'sandcastleSummer'
  | 'surfboard'
  | 'iceCreamCart'
  | 'hammock'
  | 'sunflower'
  | 'watermelon'
  | 'sprinkler'
  | 'lemonade'
  | 'fireflies'
  | 'swimmingPool'
  | 'autumnMaple'
  | 'autumnOak'
  | 'autumnBirch'
  | 'autumnGinkgo'
  | 'fallenLeaves'
  | 'leafSwirl'
  | 'acorn'
  | 'cornStalk'
  | 'scarecrowAutumn'
  | 'harvestBasket'
  | 'hotDrink'
  | 'autumnWreath'
  | 'pumpkinPatch'
  | 'hayMaze'
  | 'appleBasket'
  | 'rake'
  | 'hanok'
  | 'pavilion'
  | 'stoneWall'
  | 'onggi';

type VillageStyle = 'classic' | 'korean';
type AssetCategory = 'water' | 'shore' | 'woodland' | 'farm' | 'village' | 'town' | 'decoration';
type AssetSeason = 'all' | 'winter' | 'spring' | 'summer' | 'autumn';
type AssetBounds = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
};
interface AssetCatalogEntry {
  readonly id: AssetType;
  readonly displayName: string;
  readonly category: AssetCategory;
  readonly bounds: AssetBounds;
  readonly style: VillageStyle;
  readonly season: AssetSeason;
  readonly description: string;
}

declare function renderCatalogAsset(type: AssetType, colors: AssetColors, variant?: number): string;

declare function isAssetType(value: string): value is AssetType;
declare function getAssetCatalogEntry(id: AssetType): AssetCatalogEntry;
declare const ASSET_CATALOG: readonly AssetCatalogEntry[];
declare const ASSET_CATALOG_COUNTS: Readonly<{
  total: number;
  classic: number;
  korean: number;
}>;

type EpicTier = 'rare' | 'epic' | 'legendary';
type EpicBuildingType =
  | 'mountFuji'
  | 'colosseum'
  | 'giantSequoia'
  | 'coralReef'
  | 'pagoda'
  | 'torii'
  | 'geyser'
  | 'hotSpring'
  | 'eiffelTower'
  | 'grandCanyon'
  | 'windmillGrand'
  | 'oasis'
  | 'volcano'
  | 'giantMushroom'
  | 'aurora'
  | 'tajMahal'
  | 'giantWaterfall'
  | 'stBasils'
  | 'bambooGrove'
  | 'operaHouse'
  | 'glacierPeak'
  | 'bioluminescentPool'
  | 'meteorCrater'
  | 'bonsaiGiant'
  | 'floatingIsland'
  | 'crystalSpire'
  | 'dragonNest'
  | 'worldTree'
  | 'sakuraEternal'
  | 'ancientPortal';

interface EpicStatsRule {
  readonly combination: 'or' | 'and';
  readonly total: number;
  readonly longestStreak: number;
}

interface EpicCatalogEntry {
  readonly id: EpicBuildingType;
  readonly type: EpicBuildingType;
  readonly displayName: string;
  readonly description: string;
  readonly category: 'nature' | 'landmark' | 'fantasy';
  readonly tier: EpicTier;
  readonly bounds: AssetBounds;
  readonly style: 'wonder';
  readonly season: 'all';
  readonly gate: {
    readonly minLevel: number;
    readonly minRichness: number;
    readonly baseChance: number;
    readonly statsDescription: string;
    readonly stats: EpicStatsRule;
  };
}
declare function isEpicBuildingType(value: string): value is EpicBuildingType;
declare const EPIC_CATALOG: readonly EpicCatalogEntry[];
declare function getEpicCatalogEntry(type: EpicBuildingType): EpicCatalogEntry;
declare const EPIC_CATALOG_COUNTS: Readonly<{
  total: number;
  rare: number;
  epic: number;
  legendary: number;
}>;

type SettingsV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-settings';
  readonly username: string;
  readonly year?: number;
  readonly settings: ResolvedRenderSettings;
};
type SnapshotSource = {
  readonly kind: 'github' | 'import' | 'sample';
  readonly fetchedAt?: string;
};
type SnapshotWeek = {
  readonly firstDay: string;
  readonly days: readonly Readonly<ContributionDay>[];
};
type SnapshotV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-snapshot';
  readonly username: string;
  readonly year: number;
  readonly weeks: readonly SnapshotWeek[];
  readonly settings: ResolvedRenderSettings;
  readonly source: SnapshotSource;
};
type ArchiveComparison = {
  readonly normalization: {
    readonly kind: 'fixed';
    readonly maxCount: number;
  };
  readonly years: readonly number[];
};
type ArchiveV1 = {
  readonly schemaVersion: 1;
  readonly kind: 'maeul-archive';
  readonly snapshots: readonly SnapshotV1[];
  readonly comparison: ArchiveComparison;
};

declare function parseSettings(input: unknown): SettingsV1;
declare function parseSnapshot(input: unknown): SnapshotV1;
declare function snapshotToContributionData(snapshot: SnapshotV1): ContributionData;
declare function createSnapshot(
  data: ContributionData,
  settings?: RenderSettingsInput,
  source?: SnapshotSource,
): SnapshotV1;

declare function resolveRenderSettings(
  explicit?: unknown,
  loaded?: unknown,
  username?: string,
): ResolvedRenderSettings;

type ValidationIssue = {
  readonly path: string;
  readonly message: string;
};
declare class InputValidationError extends Error {
  readonly issues: readonly ValidationIssue[];
  readonly name = 'InputValidationError';
  readonly code = 'INVALID_INPUT';
  constructor(issues: readonly ValidationIssue[]);
}

declare function serializeSettings(settings: SettingsV1): string;
declare function serializeSnapshot(snapshot: SnapshotV1): string;

declare function parseArchive(input: unknown): ArchiveV1;

declare function selectComparisonSnapshots(
  snapshots: readonly SnapshotV1[],
  years: readonly number[],
): readonly SnapshotV1[];

declare function computeSharedNormalization(
  snapshots: readonly SnapshotV1[],
  normalization?: NormalizationOptions,
): {
  readonly kind: 'fixed';
  readonly maxCount: number;
};
declare function createArchive(
  snapshots: readonly SnapshotV1[],
  years?: readonly number[],
  normalization?: NormalizationOptions,
): ArchiveV1;
declare function upsertArchiveSnapshot(
  snapshots: readonly SnapshotV1[],
  snapshot: SnapshotV1,
  replace?: boolean,
): readonly SnapshotV1[];

declare function serializeArchive(archive: ArchiveV1): string;

type FetchContributionsOptions = {
  /** Each attempt includes response body reading; defaults to 10 seconds, maximum 120 seconds. */
  readonly timeoutMs?: number;
  readonly signal?: AbortSignal;
  /** GitHub or a literal loopback HTTP(S) fixture URL. Tokens are only sent to GitHub. */
  readonly endpoint?: string;
  /** Cumulative retry sleep budget, defaults to 10 seconds, maximum 60 seconds. */
  readonly maxRetryWaitMs?: number;
};

declare const ERROR_MESSAGES: {
  readonly auth: 'Authentication failed: invalid GitHub token or insufficient permissions';
  readonly notfound: 'GitHub user not found';
  readonly ratelimit: 'GitHub API rate limit exceeded';
  readonly timeout: 'GitHub API request timed out';
  readonly network: 'Network failure: unable to reach GitHub API';
  readonly http: 'GitHub API HTTP error';
  readonly invalidresponse: 'GitHub API returned an invalid response';
  readonly aborted: 'GitHub API request cancelled';
  readonly configuration: 'Invalid GitHub API request configuration';
};
type GitHubApiErrorCode = keyof typeof ERROR_MESSAGES;
/** Safe to log: upstream bodies, credentials, URLs, and raw causes are never retained. */
declare class GitHubApiError extends Error {
  readonly code: GitHubApiErrorCode;
  readonly name = 'GitHubApiError';
  readonly retryable: boolean;
  readonly status: number | undefined;
  readonly retryAfterMs: number | undefined;
  constructor(
    code: GitHubApiErrorCode,
    details?: {
      readonly status?: number;
      readonly retryAfterMs?: number;
    },
  );
}

/**
 * Fetch GitHub contribution data for a specific user.
 *
 * When `year` is provided, fetches the full calendar year (Jan 1 – Dec 31).
 * When `year` is omitted, fetches a rolling 52-week window ending today,
 * matching GitHub's own profile contribution graph.
 *
 * @param username - GitHub username
 * @param year - Optional year to fetch. Omit for rolling 52 weeks.
 * @param token - Optional GitHub personal access token (required for private profiles)
 * @param options - Request timeout, cancellation, and fixture endpoint; total duration is capped at 30 seconds
 * @returns Promise resolving to ContributionData
 * @throws GitHubApiError with a stable code and sanitized message
 */
declare function fetchContributions(
  username: string,
  year?: number,
  token?: string,
  options?: FetchContributionsOptions,
): Promise<ContributionData>;

interface PngOptions {
  readonly mode: ColorMode;
  readonly scale?: number;
  readonly wasmPath?: string;
  readonly fontPath?: string;
}
/** Rasterize a freshly rendered motion=off SVG with an opaque mode background. */
declare function renderPng(svg: string, options: PngOptions): Promise<Uint8Array>;

interface TerrainGenerationRequest {
  readonly username?: string;
  readonly token?: string;
  readonly theme?: string;
  readonly title?: string;
  readonly outputDir?: string;
  readonly year?: string | number;
  readonly years?: string | readonly number[];
  readonly hemisphere?: string;
  readonly preset?: string;
  readonly density?: string | number;
  readonly config?: string | SettingsV1;
  readonly input?: string | SnapshotV1;
  readonly writeSnapshot?: boolean | string;
  readonly motion?: string;
  readonly layout?: string;
  readonly style?: string;
  readonly villageStyle?: string;
  readonly normalization?: string;
  readonly maxCount?: string | number;
  readonly layoutSeed?: string;
  readonly format?: string;
  readonly scale?: string | number;
  readonly onProgress?: (message: string) => void;
}
interface TerrainGenerationResult {
  readonly darkPath: string;
  readonly lightPath: string;
  readonly darkPngPath?: string;
  readonly lightPngPath?: string;
  readonly snapshotPath?: string;
  readonly themeName: string;
  readonly themeDisplayName: string;
  readonly presetName: VillagePreset;
  readonly density: number;
}
interface TerrainGeneratorDependencies {
  readonly fetchContributions: typeof fetchContributions;
  readonly getTheme: (name: string) => Theme | undefined;
  readonly listThemes: () => string[];
  readonly getDefaultTheme: () => string;
  readonly makeDirectory: (path: string) => Promise<void>;
  readonly writeFile: (path: string, content: string) => Promise<void>;
  readonly readFile?: (path: string) => Promise<string>;
  readonly writeBinaryFile?: (path: string, content: Uint8Array) => Promise<void>;
  readonly renderPng?: (svg: string, options: PngOptions) => Promise<Uint8Array>;
}

declare function createTerrainGenerator(
  dependencies: TerrainGeneratorDependencies,
): (request: TerrainGenerationRequest) => Promise<TerrainGenerationResult>;
declare const generateTerrain: (
  request: TerrainGenerationRequest,
) => Promise<TerrainGenerationResult>;

interface TerrainArchiveRequest extends Omit<TerrainGenerationRequest, 'input'> {
  readonly input?: string | ArchiveV1;
  readonly snapshots?: readonly SnapshotV1[];
}
interface TerrainArchiveResult {
  readonly archivePath: string;
  readonly comparisonDarkPath: string;
  readonly comparisonLightPath: string;
  readonly years: readonly number[];
  readonly normalization: {
    readonly kind: 'fixed';
    readonly maxCount: number;
  };
  readonly outputs: readonly TerrainGenerationResult[];
}

declare function createArchiveGenerator(
  dependencies: TerrainGeneratorDependencies,
): (request: TerrainArchiveRequest) => Promise<TerrainArchiveResult>;
declare const generateArchive: (request: TerrainArchiveRequest) => Promise<TerrainArchiveResult>;

type PreviewServerOptions = {
  readonly host?: string;
  readonly port?: number;
  readonly assetRoot?: string | URL;
  readonly token?: string;
  readonly fetchContributions?: typeof fetchContributions;
  readonly requestTimeoutMs?: number;
  readonly cacheTtlMs?: number;
  readonly cacheMaxEntries?: number;
};
type PreviewAddress = {
  readonly host: string;
  readonly port: number;
  readonly url: string;
};
type PreviewServerHandle = {
  readonly server: Server;
  readonly listen: () => Promise<PreviewAddress>;
  readonly close: () => Promise<void>;
};
type StartedPreviewServer = PreviewServerHandle & PreviewAddress;
declare function createPreviewServer(options?: PreviewServerOptions): PreviewServerHandle;
declare function startPreviewServer(options?: PreviewServerOptions): Promise<StartedPreviewServer>;

export {
  ASSET_CATALOG,
  ASSET_CATALOG_COUNTS,
  type ArchiveV1,
  type ColorMode,
  type ContributionData,
  type ContributionDay,
  type ContributionStats,
  type ContributionWeek,
  DEFAULT_VILLAGE_PRESET,
  EPIC_CATALOG,
  EPIC_CATALOG_COUNTS,
  type FetchContributionsOptions,
  GitHubApiError,
  type GitHubApiErrorCode,
  type Hemisphere,
  InputValidationError,
  type MotionMode,
  type NormalizationOptions,
  type NormalizationSummary,
  type RenderSettingsInput,
  type ResolvedRenderSettings,
  type SceneCell,
  type ScenePlacement,
  type SceneWonderPlacement,
  type SettingsV1,
  type SnapshotSource,
  type SnapshotV1,
  type TerrainArchiveRequest,
  type TerrainArchiveResult,
  type TerrainCellMetadata,
  type TerrainGenerationRequest,
  type TerrainGenerationResult,
  type TerrainLayout,
  type TerrainMetadata,
  type TerrainRenderOptions,
  type TerrainRenderResult,
  type TerrainScene,
  type TerrainSceneRenderOptions,
  type Theme,
  type ThemeOptions,
  type ThemeOutput,
  VILLAGE_PRESETS,
  type ValidationIssue,
  type VillagePreset,
  type VillageStyle$1 as VillageStyle,
  computeSharedNormalization,
  computeStats,
  createArchive,
  createArchiveGenerator,
  createPreviewServer,
  createSnapshot,
  createTerrainGenerator,
  fetchContributions,
  generateArchive,
  generateTerrain,
  getAssetCatalogEntry,
  getEpicCatalogEntry,
  getTheme,
  isAssetType,
  isEpicBuildingType,
  isVillagePreset,
  listThemes,
  parseArchive,
  parseSettings,
  parseSnapshot,
  prepareTerrainScene,
  registerTheme,
  renderCatalogAsset,
  renderPng,
  renderTerrain,
  renderTerrainScene,
  resolveRenderSettings,
  selectComparisonSnapshots,
  serializeArchive,
  serializeSettings,
  serializeSnapshot,
  snapshotToContributionData,
  startPreviewServer,
  upsertArchiveSnapshot,
};
