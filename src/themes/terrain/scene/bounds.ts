import type {
  SceneBounds,
  SceneCell,
  ScenePlacement,
  NeighborhoodPath,
} from '../../../core/scene-types.js';
import type { TerrainLayout } from '../../../core/render-options.js';
import { THW, THH } from './projection.js';

export function unionBounds(bounds: readonly SceneBounds[]): SceneBounds {
  if (bounds.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const x = Math.min(...bounds.map((item) => item.x));
  const y = Math.min(...bounds.map((item) => item.y));
  return {
    x,
    y,
    width: Math.max(...bounds.map((item) => item.x + item.width)) - x,
    height: Math.max(...bounds.map((item) => item.y + item.height)) - y,
  };
}

export function sceneBounds(
  cells: readonly SceneCell[],
  placements: readonly ScenePlacement[],
  paths: readonly NeighborhoodPath[],
  effectBounds: readonly SceneBounds[] = [],
): SceneBounds {
  return unionBounds([
    ...cells.map((cell) => ({
      x: cell.isoX - THW - 1,
      y: cell.isoY - THH - 1,
      width: THW * 2 + 2,
      height: THH * 2 + cell.height + 2,
    })),
    ...placements.map((placement) => placement.footprint),
    ...paths.map((path) => path.footprint),
    ...effectBounds,
  ]);
}

export function sceneViewport(layout: TerrainLayout): SceneBounds {
  return layout === 'card'
    ? { x: 18, y: 82, width: 384, height: 150 }
    : { x: 315, y: 35, width: 503, height: 175 };
}

export function fitScene(bounds: SceneBounds, viewport: SceneBounds) {
  const scale = Math.min(viewport.width / bounds.width, viewport.height / bounds.height, 1.35);
  return {
    scale,
    x: viewport.x + (viewport.width - bounds.width * scale) / 2 - bounds.x * scale,
    y: viewport.y + (viewport.height - bounds.height * scale) / 2 - bounds.y * scale,
  };
}
