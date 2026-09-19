import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import { hash, seededRandom } from '../../../utils/math.js';
import { currentSurfaceContext, seasonalSurfaceCells } from '../scene/surface-context.js';
import { selectEvenly } from './selection.js';

const WEATHER = {
  snow: { season: 'winter', count: 12, group: 'snow-particles', opacity: '.55', duration: 14 },
  petals: { season: 'spring', count: 10, group: 'falling-petals', opacity: '.6', duration: 12 },
  butterflies: {
    season: 'spring',
    count: 3,
    group: 'spring-butterflies',
    opacity: '.65',
    duration: 16,
  },
  rain: { season: 'summer', count: 12, group: 'summer-rain', opacity: '.3', duration: 5 },
  leaves: { season: 'autumn', count: 10, group: 'falling-leaves', opacity: '.6', duration: 13 },
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

function weatherShape(kind: WeatherKind, x: number, y: number): string {
  const start = `M${x.toFixed(1)},${y.toFixed(1)}`;
  switch (kind) {
    case 'snow':
      return `${start}a.45,.45 0 1 0 .9,0a.45,.45 0 1 0-.9,0`;
    case 'petals':
      return `${start}q.8,-.9 1.2,-.2q-.3,.8-1.2,.2Z`;
    case 'butterflies':
      return `${start}c-1.5,-2.1-2.7,.4 0,.8c2.7,-.4 1.5,-2.1 0,-.8Z`;
    case 'rain':
      return `${start}l-.8,2.6`;
    case 'leaves':
      return `${start}q1.5,-.7 1.8,.3q-1.3,.8-1.8,-.3Z`;
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

function weatherColor(kind: WeatherKind, palette: TerrainPalette100, phase: number): string {
  switch (kind) {
    case 'snow':
      return '#fff';
    case 'petals':
      return palette.assets.cherryPetalPink;
    case 'butterflies':
      return palette.assets.fallenLeafGold;
    case 'rain':
      return palette.assets.waterLight;
    case 'leaves':
      return phase ? palette.assets.fallenLeafOrange : palette.assets.fallenLeafRed;
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
    const selected = selectEvenly(weatherCells(cells, kind), WEATHER[kind].count);
    if (!selected.length) return '';
    const phases = [0, 1]
      .map((phase) => {
        const shapes = selected.flatMap((cell, index) => {
          if (index % 2 !== phase) return [];
          const rng = seededRandom(hash(`${seed}:${kind}:${cell.date}`));
          return weatherShape(kind, cell.isoX + (rng() - 0.5) * 6, cell.isoY - 3 - rng() * 12);
        });
        if (!shapes.length) return '';
        const color = weatherColor(kind, palette, phase);
        const paint =
          kind === 'rain'
            ? `fill="none" stroke="${color}" stroke-width=".35" stroke-linecap="round"`
            : `fill="${color}"`;
        const motion =
          currentMotionContext().mode === 'full' && moving.has(`seasonal-${kind}-${phase}`)
            ? ` class="${motionId(`seasonal-${kind}-${phase}`)}"`
            : '';
        return `<path data-seasonal="${kind}" d="${shapes.join('')}" ${paint}${motion}/>`;
      })
      .join('');
    return `<g class="${WEATHER[kind].group}" opacity="${WEATHER[kind].opacity}">${phases}</g>`;
  }).join('');
}

export function renderSeasonalWeatherCSS(cells: readonly IsoCell[]): string {
  if (currentMotionContext().mode !== 'full') return '';
  return KINDS.flatMap((kind) => {
    if (!weatherCells(cells, kind).length) return [];
    const name = motionId(`seasonal-${kind}`);
    const frames =
      kind === 'butterflies'
        ? '0%,100%{transform:translate(0,0)}35%{transform:translate(3px,-2px)}70%{transform:translate(-1px,-4px)}'
        : `0%{transform:translate(-2px,-5px);opacity:0}15%,85%{opacity:1}100%{transform:translate(${kind === 'rain' ? -5 : 3}px,7px);opacity:0}`;
    return [
      `@keyframes ${name}{${frames}}`,
      ...[0, 1].map((phase) => {
        const duration = WEATHER[kind].duration + phase * 2;
        return `.${motionId(`seasonal-${kind}-${phase}`)}{animation:${name} ${duration}s ${kind === 'butterflies' ? 'ease-in-out' : 'linear'} -${duration * (phase ? 0.7 : 0.3)}s infinite}`;
      }),
    ];
  }).join('');
}
