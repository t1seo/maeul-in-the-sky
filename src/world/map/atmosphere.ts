import { motionId } from '../../core/animation.js';
import { renderCelestials, renderClouds } from '../../themes/terrain/effects/sky.js';
import { hash } from '../../utils/math.js';
import type { WorldScene, WorldView } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { MAP_HEIGHT, MAP_WIDTH, MAP_VIEWPORT } from './projection.js';
import type { MapViewport } from './projection.js';

export function atmosphereDefs(palette: MapPalette, height = MAP_HEIGHT): string {
  return `<linearGradient id="${motionId('sky')}" gradientUnits="userSpaceOnUse" x2="0" y2="${height}"><stop stop-color="${palette.skyTop}"/><stop offset="0.72" stop-color="${palette.skyBottom}"/><stop offset="1" stop-color="${palette.horizon}"/></linearGradient><radialGradient id="${motionId('island-shadow')}"><stop stop-color="#416a72" stop-opacity="0.22"/><stop offset="1" stop-color="#416a72" stop-opacity="0"/></radialGradient><linearGradient id="${motionId('haze')}" x2="0" y2="1"><stop stop-color="${palette.horizon}" stop-opacity="0"/><stop offset="1" stop-color="${palette.horizon}" stop-opacity="0.55"/></linearGradient>`;
}

export function renderAtmosphere(
  scene: WorldScene,
  view: WorldView,
  palette: MapPalette,
  skyTop = 28,
  viewport: MapViewport = MAP_VIEWPORT,
): string {
  const seed = hash(scene.worldId);
  const sky =
    renderCelestials(seed, palette.foliage, view.lighting === 'night') +
    renderClouds(seed, palette.foliage);
  return `<rect width="${viewport.width}" height="${viewport.height}" fill="url(#${motionId('sky')})"/><g transform="scale(${viewport.width / MAP_WIDTH} ${viewport.height / MAP_HEIGHT})"><path d="M0,570Q150,530 320,580T670,555T1200,580V780H0Z" fill="${palette.horizon}" opacity="0.16"/><path d="M0,680Q200,640 470,682T910,660T1200,690V780H0Z" fill="${palette.horizon}" opacity="0.28"/></g><g transform="translate(0 ${skyTop}) scale(${viewport.width / 840})" aria-hidden="true">${sky}</g>`;
}
