import { currentMotionContext } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import { currentSurfaceContext, setSurfaceMotionLimits } from '../scene/surface-context.js';
import { seasonalWeatherTargets } from './seasonal-weather.js';

const ANIMATION = /(?:^|;)\s*animation(?:-name)?\s*:\s*(?!none\b)/;

function existingMotionCount(markup: string, css: string): number {
  const animatedClasses = new Set<string>();
  const styles =
    css +
    [...markup.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) => match[1]).join('');
  for (const rule of styles.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!ANIMATION.test(rule[2])) continue;
    for (const name of rule[1].matchAll(/\.([\w-]+)/g)) animatedClasses.add(name[1]);
  }
  let count = (markup.match(/<(?:animate(?:Transform|Motion)?|set)\b/g) ?? []).length;
  let previousTarget = -1;
  for (const match of markup.matchAll(/\s(class|style)="([^"]*)"/g)) {
    const animated =
      match[1] === 'class'
        ? match[2].split(/\s+/).some((name) => animatedClasses.has(name))
        : ANIMATION.test(match[2]);
    if (!animated) continue;
    const target = markup.lastIndexOf('<', match.index);
    if (target !== previousTarget) count++;
    previousTarget = target;
  }
  return count;
}

export function reserveSurfaceMotion(
  existing: string,
  css: string,
  cells: readonly IsoCell[],
): void {
  if (!currentSurfaceContext() || currentMotionContext().mode !== 'full') return;
  const available = Math.max(0, 50 - existingMotionCount(existing, css));
  const weather = Math.min(available, seasonalWeatherTargets(cells).length);
  setSurfaceMotionLimits(Math.min(15, available - weather), weather);
}
