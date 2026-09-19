import type { WorldFrame, WorldScene, WorldView } from '../model/types.js';
import { frameWorld } from '../model/index.js';
import { motionId, withMotionContext } from '../../core/animation.js';
import { escapeXml, svgNumber, svgStyle } from '../../core/svg.js';
import { hash } from '../../utils/math.js';
import { atmosphereDefs, renderAtmosphere } from './atmosphere.js';
import { renderCaption, renderDateTargets, renderMapLabels } from './labels.js';
import { mapPalette, regionPalettes } from './palette.js';
import { MAP_HEIGHT, MAP_WIDTH, MAP_VIEWPORT, mapTransform, project } from './projection.js';
import type { MapViewport } from './projection.js';
import { renderEntity, renderEvents } from './props.js';
import { renderTerrain, renderWaterways, terrainMesh } from './terrain.js';
import { renderActors, renderRoutes } from './transit.js';
import { renderSceneryMotion, sceneryParticles } from './scenery-motion.js';
import { surfaceTextureDefs } from './surface-textures.js';
import { portableSvg } from './portable.js';

export type MapRenderOptions = {
  readonly width?: number;
  readonly height?: number;
  readonly namespace?: string;
  readonly caption?: boolean;
  readonly viewport?: MapViewport;
};

export function renderMapFrame(
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
  options: MapRenderOptions = {},
): string {
  const viewport = options.viewport ?? MAP_VIEWPORT;
  const width = options.width ?? viewport.width;
  const height = options.height ?? viewport.height;
  if (![width, height].every((size) => Number.isFinite(size) && size > 0 && size <= 8192))
    throw new RangeError('Map dimensions must be between 1 and 8192 pixels');
  const namespace = options.namespace ?? `world-map-${hash(scene.worldId)}`;
  const palette = mapPalette(frame.season, view.lighting);
  const regions = regionPalettes(scene, view);
  const mesh = terrainMesh(frame.terrain.tiles);
  const transform = mapTransform(scene, view, viewport);
  return withMotionContext({ mode: 'off', namespace }, () => {
    const shadows = scene.islands
      .map((island) => {
        const p = project(island.center);
        const radius =
          (island.bounds.max.x - island.bounds.min.x + island.bounds.max.z - island.bounds.min.z) *
          17;
        return `<ellipse cx="${p.x}" cy="${p.y + 68}" rx="${radius}" ry="${radius * 0.35}" fill="url(#${motionId('island-shadow')})"/>`;
      })
      .join('');
    const props = [...frame.entities]
      .sort((a, b) => a.position.x + a.position.z - (b.position.x + b.position.z))
      .map((entity) => renderEntity(scene, entity, regions.get(entity.regionId) ?? palette, view))
      .join('');
    const terrain =
      renderTerrain(frame, mesh, palette, regions) +
      renderWaterways(frame, palette, view.elapsedSeconds) +
      renderRoutes(frame, palette) +
      props +
      renderEvents(scene, frame, palette) +
      `<g class="map-actors">${renderActors(frame)}</g>` +
      renderSceneryMotion(sceneryParticles(scene, frame, view), view);
    const styles = svgStyle(
      '.map-day{cursor:pointer;outline:none}.map-day.is-selected>polygon,.map-day:focus>polygon,.map-day:hover>polygon{stroke:#edbc60;stroke-width:2;stroke-opacity:1;fill:#f3d49a;fill-opacity:.25}',
    );
    const titleId = motionId('title');
    const descId = motionId('description');
    const glows = Object.entries({ rare: '#FFD700', epic: '#9B59B6', legendary: '#00CED1' })
      .map(
        ([tier, color]) =>
          `<radialGradient id="${motionId(`epic-glow-${tier}`)}"><stop offset="0%" stop-color="${color}" stop-opacity="${view.lighting === 'night' ? 0.4 : 0.3}"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
      )
      .join('');
    const caption = options.caption !== false;
    const margins = caption
      ? `<g class="map-viewport-frame" fill="url(#${motionId('sky')})"><rect width="${MAP_WIDTH}" height="132"/><rect y="${MAP_HEIGHT - 64}" width="${MAP_WIDTH}" height="64"/></g>`
      : '';
    const world = `<g class="map-world" transform="translate(${svgNumber(transform.x)} ${svgNumber(transform.y)}) scale(${transform.scale})"><g pointer-events="none">${shadows}${terrain}</g><g class="map-date-targets">${renderDateTargets(frame, mesh, view, palette)}</g></g>${renderMapLabels(scene, frame, transform, palette)}`;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${viewport.width} ${viewport.height}" role="group" aria-labelledby="${titleId} ${descId}" data-world-map="${escapeXml(scene.worldId)}" data-layout="${scene.settings.layout}" data-season="${frame.season}" data-lighting="${view.lighting}"><title id="${titleId}">${escapeXml(`${scene.username} · Sky world`)}</title><desc id="${descId}">${frame.stats.totalContributions} contributions through ${frame.cursorDate}. Use arrow keys to move between dates, Enter to select, plus and minus to zoom, and zero to reset.</desc><defs>${atmosphereDefs(palette, viewport.height)}${surfaceTextureDefs(palette)}${glows}</defs>${styles}${renderAtmosphere(scene, view, palette, caption ? 132 : 28, viewport)}${world}${margins}${caption ? renderCaption(scene, frame, view, palette) : ''}</svg>`;
  });
}

export function renderMapSvg(
  scene: WorldScene,
  view: WorldView,
  options: MapRenderOptions = {},
): string {
  return portableSvg(renderMapFrame(scene, frameWorld(scene, view), view, options));
}
