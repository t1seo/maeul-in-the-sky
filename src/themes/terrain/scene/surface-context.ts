import type { ArtStyle, Hemisphere } from '../../../core/render-options.js';
import type { IsoCell } from './projection.js';
import type { PeakSeason } from '../seasons.js';
import { datePeakSeason } from './season.js';

type SeasonCells = Readonly<Record<PeakSeason, IsoCell[]>>;

interface SurfaceContext {
  readonly hemisphere: Hemisphere;
  readonly seasons: WeakMap<readonly IsoCell[], SeasonCells>;
  readonly waterMotionLimit: number;
  readonly weatherMotionLimit: number;
}

let context: SurfaceContext | undefined;

export function currentSurfaceContext(): SurfaceContext | undefined {
  return context;
}

export function setSurfaceMotionLimits(water: number, weather: number): void {
  if (context) context = { ...context, waterMotionLimit: water, weatherMotionLimit: weather };
}

export function seasonalSurfaceCells(cells: readonly IsoCell[], season: PeakSeason): IsoCell[] {
  const cached = context?.seasons.get(cells);
  if (cached) return cached[season];
  const grouped: SeasonCells = { winter: [], spring: [], summer: [], autumn: [] };
  for (const cell of cells) {
    if (cell.date) grouped[datePeakSeason(cell.date, context?.hemisphere ?? 'north')].push(cell);
  }
  context?.seasons.set(cells, grouped);
  return grouped[season];
}

export function withSurfaceContext(
  settings: { readonly artStyle: ArtStyle; readonly hemisphere: Hemisphere },
  render: () => string,
): string {
  const previous = context;
  context =
    settings.artStyle === 'miniature'
      ? {
          hemisphere: settings.hemisphere,
          seasons: new WeakMap(),
          waterMotionLimit: 15,
          weatherMotionLimit: 10,
        }
      : undefined;
  try {
    return render();
  } finally {
    context = previous;
  }
}
