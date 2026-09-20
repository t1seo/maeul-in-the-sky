export type TerrainLayout = 'island' | 'archipelago' | 'valley';
export type Biome = 'sand' | 'meadow' | 'forest' | 'rock' | 'snow';

export interface TerrainPoint {
  readonly x: number;
  readonly z: number;
  readonly elevation: number;
}

export interface TerrainSite extends TerrainPoint {
  readonly moisture: number;
  readonly slope: number;
  readonly biome: Biome;
}

export interface TerrainTriangle {
  readonly points: readonly [TerrainPoint, TerrainPoint, TerrainPoint];
  readonly biome: Biome;
  readonly moisture: number;
}

export interface CoastEdge {
  readonly a: TerrainPoint;
  readonly b: TerrainPoint;
}

export interface TerrainRiver {
  readonly points: readonly TerrainPoint[];
  readonly width: number;
}

export interface DayPlot {
  readonly date: string;
  readonly count: number;
  readonly position: TerrainSite;
}

export interface TerrainOptions {
  readonly layout: TerrainLayout;
  readonly seed: number;
  readonly relief: number;
  readonly roughness: number;
}

export interface TerrainModel {
  readonly options: TerrainOptions;
  readonly triangles: readonly TerrainTriangle[];
  readonly coast: readonly CoastEdge[];
  readonly rivers: readonly TerrainRiver[];
  readonly plots: readonly DayPlot[];
  readonly sites: readonly TerrainSite[];
  readonly settlements: readonly TerrainSite[];
  readonly peaks: readonly TerrainSite[];
}
