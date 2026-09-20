export type LandscapeLayout = 'island' | 'archipelago' | 'valley';
export type LandscapeBiome = 'sand' | 'meadow' | 'forest' | 'rock' | 'snow' | 'wetland' | 'dry';

export interface LandscapePoint {
  readonly x: number;
  readonly z: number;
  readonly elevation: number;
}

export interface LandscapeSite extends LandscapePoint {
  readonly moisture: number;
  readonly slope: number;
  readonly biome: LandscapeBiome;
  readonly component: number;
}

export interface LandscapeTriangle {
  readonly points: readonly [LandscapePoint, LandscapePoint, LandscapePoint];
  readonly biome: LandscapeBiome;
  readonly moisture: number;
  readonly component: number;
}

export interface LandscapeCoast {
  readonly a: LandscapePoint;
  readonly b: LandscapePoint;
}

export interface LandscapeRiver {
  readonly points: readonly LandscapePoint[];
  readonly width: number;
}

export interface LandscapeOptions {
  readonly layout: LandscapeLayout;
  readonly seed: number;
  readonly relief: number;
  readonly roughness: number;
}

export interface LandscapePlot {
  readonly date: string;
  readonly count: number;
  readonly position: LandscapeSite;
}

export interface LandscapeModel {
  readonly options: LandscapeOptions;
  readonly triangles: readonly LandscapeTriangle[];
  readonly coast: readonly LandscapeCoast[];
  readonly rivers: readonly LandscapeRiver[];
  readonly plots: readonly LandscapePlot[];
  readonly sites: readonly LandscapeSite[];
  readonly settlements: readonly LandscapeSite[];
  readonly peaks: readonly LandscapeSite[];
}

export interface LandscapeSprite {
  readonly id: string;
  readonly catalogId: string;
  readonly kind: 'asset' | 'wonder' | 'reward' | 'scenery';
  readonly anchorDate?: string;
  readonly position: LandscapeSite;
  readonly scale: number;
  readonly variant: number;
}

export interface LandscapeRoad {
  readonly id: string;
  readonly points: readonly LandscapePoint[];
  readonly width: number;
  readonly bridges: readonly (readonly [LandscapePoint, LandscapePoint])[];
}

export interface LandscapeField {
  readonly id: string;
  readonly points: readonly LandscapePoint[];
  readonly crop: 'wheat' | 'rice' | 'vegetable';
  readonly rows: readonly (readonly LandscapePoint[])[];
}

export interface LandscapeTown {
  readonly id: string;
  readonly center: LandscapeSite;
  readonly plaza: readonly LandscapePoint[];
}

export interface LandscapeSettlementPlan {
  readonly towns: readonly LandscapeTown[];
  readonly roads: readonly LandscapeRoad[];
  readonly fields: readonly LandscapeField[];
  readonly sprites: readonly LandscapeSprite[];
}

export interface LandscapeGeography {
  readonly version: 1;
  readonly model: LandscapeModel;
  readonly settlement: LandscapeSettlementPlan;
}
