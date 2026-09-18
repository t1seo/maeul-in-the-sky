import type { ColorMode } from '../../../core/types.js';
import type { SeasonalTint, getTransitionBlend } from '../seasons.js';
import { applyTint } from '../seasons.js';
import { DARK_COLOR_ANCHORS, DARK_HEIGHT_ANCHORS, LIGHT_COLOR_ANCHORS } from './anchors.js';
import type { ColorAnchor } from './anchors.js';
import { DARK_ASSETS } from './dark-assets.js';
import { LIGHT_ASSETS } from './light-assets.js';
import { interpolateHeight, interpolateRGB, makeElevation } from './interpolation.js';
import type { ElevationColors, TerrainPalette100 } from './types.js';
import { seasonalMaterials } from './season-materials.js';
import { seasonalGround } from './season-ground.js';

const SAMPLE_LEVELS = [0, 5, 12, 25, 40, 55, 70, 82, 92, 99] as const;

function elevationGetter(
  anchors: readonly ColorAnchor[],
  tint?: SeasonalTint,
  transition?: ReturnType<typeof getTransitionBlend>,
) {
  const elevations: (ElevationColors | undefined)[] = Array.from({ length: 100 });
  return (level: number): ElevationColors => {
    const cached = Number.isInteger(level) ? elevations[level] : undefined;
    if (cached) return { ...cached };
    const rgb = interpolateRGB(anchors, level);
    const color =
      tint && transition
        ? seasonalGround(rgb, tint, transition)
        : tint
          ? applyTint(...rgb, tint)
          : rgb;
    const elevation = makeElevation(color);
    if (Number.isInteger(level) && level >= 0 && level < 100) elevations[level] = elevation;
    return { ...elevation };
  };
}

export function createTerrainPalette100(mode: ColorMode): TerrainPalette100 {
  const getElevation = elevationGetter(mode === 'dark' ? DARK_COLOR_ANCHORS : LIGHT_COLOR_ANCHORS);
  const getHeight = (level: number): number => interpolateHeight(DARK_HEIGHT_ANCHORS, level);
  return {
    getElevation,
    getHeight,
    elevations: SAMPLE_LEVELS.map(getElevation),
    heights: SAMPLE_LEVELS.map(getHeight),
    text:
      mode === 'dark'
        ? { primary: '#e6edf3', secondary: '#8b949e', accent: '#58a6ff' }
        : { primary: '#1f2328', secondary: '#656d76', accent: '#0969da' },
    bg: { subtle: mode === 'dark' ? '#161b22' : '#f6f8fa' },
    cloud:
      mode === 'dark'
        ? { fill: 'rgba(200,210,220,0.12)', stroke: 'rgba(200,210,220,0.06)', opacity: 0.8 }
        : { fill: 'rgba(190,205,220,0.35)', stroke: 'rgba(160,175,195,0.30)', opacity: 0.85 },
    assets: mode === 'dark' ? DARK_ASSETS : LIGHT_ASSETS,
  };
}

export function createSeasonalPalette100(
  mode: ColorMode,
  tint: SeasonalTint,
  base: TerrainPalette100,
  transition: ReturnType<typeof getTransitionBlend>,
): TerrainPalette100 {
  if (
    tint.colorShift === 0 &&
    tint.warmth === 0 &&
    tint.snowCoverage === 0 &&
    tint.greenMul === 1 &&
    tint.saturation === 1
  )
    return base;
  const getElevation = elevationGetter(
    mode === 'dark' ? DARK_COLOR_ANCHORS : LIGHT_COLOR_ANCHORS,
    tint,
    transition,
  );
  return {
    ...base,
    getElevation,
    elevations: SAMPLE_LEVELS.map(getElevation),
    assets: seasonalMaterials(base.assets, transition),
  };
}
