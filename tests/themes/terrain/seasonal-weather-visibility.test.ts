import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../../src/core/animation.js';
import type { MotionMode } from '../../../src/core/render-options.js';
import { prepareTerrainScene } from '../../../src/themes/terrain/index.js';
import { getTerrainPalette100 } from '../../../src/themes/terrain/palette.js';
import {
  renderSeasonalWeather,
  renderSeasonalWeatherCSS,
  seasonalWeatherTargets,
} from '../../../src/themes/terrain/effects/seasonal-weather.js';
import {
  setSurfaceMotionLimits,
  withSurfaceContext,
} from '../../../src/themes/terrain/scene/surface-context.js';
import { calendarFixture, sceneOptions } from './scene/fixtures.js';

const palette = getTerrainPalette100('light');
const miniature = { artStyle: 'miniature', hemisphere: 'north' } as const;
const scene = prepareTerrainScene(calendarFixture('2025-01-01', 365, 5), sceneOptions);
const cells = scene.cells.map((cell) => ({ ...cell, colors: palette.getElevation(cell.level100) }));
const kinds = ['snow', 'petals', 'butterflies', 'rain', 'leaves'] as const;

function paths(markup: string, kind: string): string[] {
  return [...markup.matchAll(new RegExp(`<path data-seasonal="${kind}"[^>]*>`, 'g'))].map(
    (match) => match[0],
  );
}

function geometry(markup: string): string[] {
  return [...markup.matchAll(/data-seasonal="([^"]+)" d="([^"]+)"/g)].map(
    (match) => `${match[1]}:${match[2]}`,
  );
}

function render(mode: MotionMode = 'full', budget = 10): string {
  return withSurfaceContext(miniature, () =>
    withMotionContext({ mode, namespace: 'weather-test' }, () => {
      setSurfaceMotionLimits(15, budget);
      return renderSeasonalWeather(cells, 42, palette);
    }),
  );
}

describe('seasonal weather visibility without extra animation targets', () => {
  it.each([
    { kind: 'snow', minimum: 24 },
    { kind: 'petals', minimum: 20 },
    { kind: 'rain', minimum: 24 },
    { kind: 'leaves', minimum: 20 },
  ])('adds varied $kind artwork within two compound paths', ({ kind, minimum }) => {
    // Given: a full year with all calendar seasons.
    // When: the weather is rendered as still artwork.
    const output = paths(render('off'), kind);
    const shapes = output.flatMap((path) =>
      [...(path.match(/ d="([^"]+)"/)?.[1] ?? '').matchAll(/M[-\d.]+,[-\d.]+([^M]*)/g)].map(
        (match) => match[1],
      ),
    );
    // Then: more visible particles have varied silhouettes without extra animated nodes.
    expect(output).toHaveLength(2);
    expect(shapes.length).toBeGreaterThanOrEqual(minimum);
    expect(new Set(shapes).size).toBeGreaterThan(3);
  });

  it('uses palette-backed edges to keep snow and petals readable on pale terrain', () => {
    // Given: daylight colors and a still full-year scene.
    // When: seasonal artwork is painted.
    const output = render('off');
    // Then: pale fills retain a colored outline and rain is thick enough to survive fitting.
    expect(
      paths(output, 'snow').every((path) =>
        path.includes(`stroke="${palette.assets.frozenWater}"`),
      ),
    ).toBe(true);
    expect(
      paths(output, 'petals').every((path) => path.includes(`stroke="${palette.assets.flower}"`)),
    ).toBe(true);
    expect(
      paths(output, 'rain').every(
        (path) => Number(path.match(/stroke-width="([^"]+)"/)?.[1]) >= 0.6,
      ),
    ).toBe(true);
  });

  it('gives falling weather distinct trajectories and faster rain', () => {
    // Given: all weather kinds are eligible for full motion.
    // When: weather CSS is emitted.
    const css = withSurfaceContext(miniature, () =>
      withMotionContext({ mode: 'full', namespace: '' }, () => renderSeasonalWeatherCSS(cells)),
    );
    const trajectories = kinds.map(
      (kind) =>
        css.match(new RegExp(`@keyframes seasonal-${kind}\\{(.*?)\\}\\.seasonal-${kind}-0`))?.[1],
    );
    const rainDuration = Number(
      css.match(/\.seasonal-rain-0\{animation:seasonal-rain ([\d.]+)s/)?.[1],
    );
    // Then: rain falls quickly while snow, petals, leaves and butterflies follow different paths.
    expect(trajectories).not.toContain(undefined);
    expect(new Set(trajectories).size).toBe(5);
    expect(rainDuration).toBeLessThan(3);
    expect(css).not.toMatch(/filter:|brightness|visibility:/);
  });

  it.each([0, 1, 3, 10])('retains every still shape with a %i-target budget', (budget) => {
    // Given: the same dated artwork under a constrained global motion allocation.
    const still = render('off');
    // When: full mode receives only the remaining target budget.
    const output = render('full', budget);
    // Then: budget exhaustion removes animation classes, never weather or butterflies.
    expect(geometry(output)).toEqual(geometry(still));
    expect(output.match(/<path[^>]+class="[^"]*seasonal-/g) ?? []).toHaveLength(budget);
    for (const kind of kinds) expect(paths(output, kind)).toHaveLength(2);
    expect(seasonalWeatherTargets(cells)).toHaveLength(10);
  });

  it.each(['off', 'subtle'] as const)('keeps %s weather visible and motionless', (mode) => {
    // Given: a mode that must retain still weather.
    // When: the geometry and CSS use that mode.
    const output = render(mode);
    const css = withMotionContext({ mode, namespace: 'still' }, () =>
      renderSeasonalWeatherCSS(cells),
    );
    // Then: full-mode artwork remains, without any seasonal animation target or rule.
    expect(geometry(output)).toEqual(geometry(render('full')));
    expect(output).not.toMatch(/<path[^>]+class=|<animate/);
    expect(css).toBe('');
  });

  it('keeps deterministic geometry across lighting and leaves scene data untouched', () => {
    // Given: an immutable dated scene used in both lighting modes.
    const before = JSON.stringify(cells);
    // When: the same seed is rendered with day and night palettes.
    const outputs = (['light', 'dark'] as const).map((mode) =>
      withSurfaceContext(miniature, () =>
        renderSeasonalWeather(cells, 42, getTerrainPalette100(mode)),
      ),
    );
    // Then: paint changes without moving any weather or modifying source dates and positions.
    expect(geometry(outputs[0])).toEqual(geometry(outputs[1]));
    expect(outputs[0]).not.toBe(outputs[1]);
    expect(JSON.stringify(cells)).toBe(before);
  });
});
