import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import { hash, seededRandom } from '../../../utils/math.js';
import { currentSurfaceContext, seasonalSurfaceCells } from '../scene/surface-context.js';
import { selectEvenly } from './selection.js';
import { clipSeasonalWeatherToCells } from './seasonal-weather-clip.js';

const WEATHER = {
  snow: { season: 'winter', count: 36, group: 'snow-particles', opacity: '.82', duration: 12 },
  petals: { season: 'spring', count: 28, group: 'falling-petals', opacity: '.8', duration: 8 },
  butterflies: {
    season: 'spring',
    count: 3,
    group: 'spring-butterflies',
    opacity: '.65',
    duration: 16,
  },
  rain: { season: 'summer', count: 40, group: 'summer-rain', opacity: '.62', duration: 2 },
  leaves: { season: 'autumn', count: 28, group: 'falling-leaves', opacity: '.82', duration: 10 },
} as const;
type WeatherKind = keyof typeof WEATHER;
const KINDS = ['snow', 'petals', 'butterflies', 'rain', 'leaves'] as const;

function weatherCells(cells: readonly IsoCell[], kind: WeatherKind): IsoCell[] {
  return seasonalSurfaceCells(cells, WEATHER[kind].season);
}

export function seasonalWeatherTargets(cells: readonly IsoCell[]): string[] {
  return [0, 1].flatMap((phase) =>
    KINDS.flatMap((kind) =>
      weatherCells(cells, kind).length > phase ? [`seasonal-${kind}-${phase}`] : [],
    ),
  );
}

function weatherShape(kind: WeatherKind, x: number, y: number, size: number, flip: number): string {
  const start = `M${x.toFixed(1)},${y.toFixed(1)}`;
  const n = (value: number): string => (value * size).toFixed(2);
  const dx = (value: number): string => n(value * flip);
  switch (kind) {
    case 'snow':
      return `${start}a${n(0.8)},${n(0.8)} 0 1 0 ${n(1.6)},0a${n(0.8)},${n(0.8)} 0 1 0-${n(1.6)},0`;
    case 'petals':
      return `${start}q${dx(1.3)},${n(-1.8)} ${dx(2.4)},${n(-0.5)}q${dx(-0.2)},${n(1.9)} ${dx(-2.4)},${n(0.5)}Z`;
    case 'butterflies':
      return `${start}c-1.5,-2.1-2.7,.4 0,.8c2.7,-.4 1.5,-2.1 0,-.8Z`;
    case 'rain':
      return `${start}l${n(-1.3)},${n(4.8)}`;
    case 'leaves':
      return `${start}q${dx(1.6)},${n(-1.8)} ${dx(3.2)},${n(0.2)}q${dx(-1.5)},${n(1.7)} ${dx(-3.2)},${n(-0.2)}Z`;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function weatherColor(kind: WeatherKind, palette: TerrainPalette100, phase: number): string {
  switch (kind) {
    case 'snow':
      return phase ? palette.assets.snowCap : palette.assets.frostWhite;
    case 'petals':
      return phase ? palette.assets.cherryPetalPink : palette.assets.flower;
    case 'butterflies':
      return palette.assets.fallenLeafGold;
    case 'rain':
      return phase ? palette.assets.fountainWater : palette.assets.waterLight;
    case 'leaves':
      return phase ? palette.assets.fallenLeafGold : palette.assets.fallenLeafOrange;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function weatherPaint(kind: WeatherKind, palette: TerrainPalette100, phase: number): string {
  const color = weatherColor(kind, palette, phase);
  switch (kind) {
    case 'rain':
      return `fill="none" stroke="${color}" stroke-width="${phase ? '.65' : '.8'}" stroke-linecap="round"`;
    case 'snow':
      return `fill="${color}" stroke="${palette.assets.frozenWater}" stroke-width=".25"`;
    case 'petals':
      return `fill="${color}" stroke="${palette.assets.flower}" stroke-width=".25"`;
    case 'leaves':
      return `fill="${color}" stroke="${palette.assets.fallenLeafBrown}" stroke-width=".25"`;
    case 'butterflies':
      return `fill="${color}"`;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function renderSeasonalWeather(
  cells: readonly IsoCell[],
  seed: number,
  palette: TerrainPalette100,
): string {
  const moving = new Set(
    seasonalWeatherTargets(cells).slice(0, currentSurfaceContext()?.weatherMotionLimit ?? 10),
  );
  return KINDS.map((kind) => {
    const seasonal = weatherCells(cells, kind);
    const selected = selectEvenly(seasonal, WEATHER[kind].count);
    if (!selected.length) return '';
    const phases = [0, 1]
      .map((phase) => {
        const shapes = selected.flatMap((cell, index) => {
          if (index % 2 !== phase) return [];
          const rng = seededRandom(hash(`${seed}:${kind}:${cell.date}`));
          return weatherShape(
            kind,
            cell.isoX + (rng() - 0.5) * 8,
            cell.isoY - 4 - rng() * 16,
            0.85 + rng() * 0.65,
            rng() < 0.5 ? -1 : 1,
          );
        });
        if (!shapes.length) return '';
        const paint = weatherPaint(kind, palette, phase);
        const motion =
          currentMotionContext().mode === 'full' && moving.has(`seasonal-${kind}-${phase}`)
            ? ` class="${motionId(`seasonal-${kind}-${phase}`)}"`
            : '';
        return `<path data-seasonal="${kind}" d="${shapes.join('')}" ${paint}${motion}/>`;
      })
      .join('');
    return clipSeasonalWeatherToCells(
      `<g class="${WEATHER[kind].group}" opacity="${WEATHER[kind].opacity}">${phases}</g>`,
      seasonal,
      kind,
    );
  }).join('');
}

function weatherFrames(kind: WeatherKind): string {
  switch (kind) {
    case 'snow':
      return '0%{transform:translate(-2px,-8px);opacity:0}15%,85%{opacity:1}35%{transform:translate(2px,0)}65%{transform:translate(-1px,7px)}100%{transform:translate(3px,16px);opacity:0}';
    case 'petals':
      return '0%{transform:translate(-4px,-7px);opacity:0}15%,85%{opacity:1}30%{transform:translate(3px,-1px)}55%{transform:translate(-2px,5px)}80%{transform:translate(4px,10px)}100%{transform:translate(1px,15px);opacity:0}';
    case 'butterflies':
      return '0%,100%{transform:translate(0,0)}35%{transform:translate(3px,-2px)}70%{transform:translate(-1px,-4px)}';
    case 'rain':
      return '0%{transform:translate(3px,-12px);opacity:0}12%,88%{opacity:1}100%{transform:translate(-5px,18px);opacity:0}';
    case 'leaves':
      return '0%{transform:translate(3px,-8px);opacity:0}15%,85%{opacity:1}25%{transform:translate(-3px,-2px)}50%{transform:translate(4px,4px)}75%{transform:translate(-2px,9px)}100%{transform:translate(2px,16px);opacity:0}';
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function renderSeasonalWeatherCSS(cells: readonly IsoCell[]): string {
  if (currentMotionContext().mode !== 'full') return '';
  return KINDS.flatMap((kind) => {
    if (!weatherCells(cells, kind).length) return [];
    const name = motionId(`seasonal-${kind}`);
    return [
      `@keyframes ${name}{${weatherFrames(kind)}}`,
      ...[0, 1].map((phase) => {
        const duration = WEATHER[kind].duration * (1 + phase * 0.2);
        return `.${motionId(`seasonal-${kind}-${phase}`)}{animation:${name} ${duration}s ${kind === 'butterflies' ? 'ease-in-out' : 'linear'} -${duration * (phase ? 0.7 : 0.3)}s infinite}`;
      }),
    ];
  }).join('');
}
