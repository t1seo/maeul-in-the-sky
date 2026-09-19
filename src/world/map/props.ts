import { escapeXml, svgNumber } from '../../core/svg.js';
import { getAssetCatalogEntry, isAssetType } from '../../themes/terrain/assets/catalog.js';
import { ASSET_RENDERERS } from '../../themes/terrain/assets/renderers.js';
import { getEpicCatalogEntry, isEpicBuildingType } from '../../themes/terrain/epics/catalog.js';
import { EPIC_RENDERERS } from '../../themes/terrain/epics/renderers.js';
import type { WorldEntity, WorldFrame, WorldScene, WorldView } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { project } from './projection.js';
import { renderRecipe } from './recipes.js';

function contextualArt(entity: WorldEntity, palette: MapPalette): string | undefined {
  switch (entity.kind) {
    case 'courtyard':
      return `<path d="M-20,0 0,-10 20,0 0,10Z" fill="${palette.path}" stroke="${palette.cliff[0]}"/><path d="M-16,0 0,-8 16,0M-8,4 8,-4M0,8 0,-8" stroke="${palette.foam}" opacity="0.55" fill="none"/><path d="M-21,0v-5l16,8v5M21,0v-5L5,3v5" stroke="${palette.cliff[0]}" stroke-width="2.5" fill="none"/>`;
    case 'pier':
    case 'dock':
      return `<path d="M-17,-2 3,-12 21,-3 1,7Z" fill="#a18d69" stroke="#75654f"/><path d="M-13,0 7,-10M-8,2 12,-8M-3,4 17,-6M2,6 21,-3" stroke="#c9b385"/><path d="M-15,-1v8M2,6v8M18,-2v8" stroke="#665b4a" stroke-width="2"/>`;
    case 'stair':
      return Array.from(
        { length: 5 },
        (_, step) =>
          `<path d="M${-10 + step * 3},${5 - step * 3}l12,6 4,-2 -12,-6Z" fill="${step % 2 ? palette.path : palette.sand}" stroke="${palette.cliff[0]}" stroke-width="0.5"/>`,
      ).join('');
    default:
      return undefined;
  }
}

export function entityTitle(scene: WorldScene, entity: WorldEntity): string {
  if (entity.label) return entity.label;
  const discovery = scene.discoveries.find((entry) => entry.entityId === entity.id);
  if (discovery) return discovery.title;
  if (entity.catalogId && isAssetType(entity.catalogId))
    return getAssetCatalogEntry(entity.catalogId).displayName;
  if (entity.catalogId && isEpicBuildingType(entity.catalogId))
    return getEpicCatalogEntry(entity.catalogId).displayName;
  return entity.repoId ?? entity.kind;
}

export function renderEntity(
  scene: WorldScene,
  entity: WorldEntity,
  palette: MapPalette,
  view: WorldView,
): string {
  const point = project(entity.position);
  const contextual = contextualArt(entity, palette);
  let art = contextual;
  let scale = contextual ? 1 : 4.2;
  if (art === undefined && entity.catalogId && isAssetType(entity.catalogId)) {
    art = ASSET_RENDERERS[entity.catalogId](0, 0, palette.foliage.assets, entity.variant);
  }
  if (art === undefined && entity.catalogId && isEpicBuildingType(entity.catalogId)) {
    art = EPIC_RENDERERS[entity.catalogId](0, 0, palette.foliage.assets);
    scale = 3.2;
  }
  if (art === undefined) {
    const recipe = scene.modelRecipes.find((entry) => entry.key === entity.modelKey);
    art = recipe ? renderRecipe(recipe) : '';
    scale = 1;
  }
  const built = scene.regions.find((region) => region.id === entity.regionId)?.kind !== 'nature';
  const glow =
    built && view.lighting !== 'day'
      ? '<ellipse cx="0" cy="0" rx="10" ry="4" fill="#ffd782" opacity="0.28"/><circle cx="-2" cy="-3" r="1.3" fill="#ffe5a1"/>'
      : '';
  return `<g data-entity-id="${escapeXml(entity.id)}" data-entity-kind="${entity.kind}"${entity.catalogId ? ` data-catalog-id="${escapeXml(entity.catalogId)}"` : ''} transform="translate(${svgNumber(point.x)} ${svgNumber(point.y)}) scale(${scale * entity.scale.x} ${scale * entity.scale.y})"><title>${escapeXml(entityTitle(scene, entity))}</title>${art}${glow}</g>`;
}

export function renderEvents(_scene: WorldScene, frame: WorldFrame, palette: MapPalette): string {
  return frame.events
    .map((event) => {
      const anchor = frame.entities.find((entity) => entity.id === event.anchorId);
      const tile = frame.terrain.tiles.find(
        (entry) => entry.id === event.anchorId || entry.date === event.startsOn,
      );
      const point = anchor?.position ?? tile?.position;
      if (!point) return '';
      const center = project(point);
      const colors = ['#db8475', '#e1bd66', '#65999c'];
      const flags = colors
        .map((color, index) => `<path d="M${-17 + index * 12},-20l6,12 6,-12Z" fill="${color}"/>`)
        .join('');
      const seasonal =
        frame.season === 'winter'
          ? '<circle cx="18" cy="0" r="4" fill="#f1f1df"/><circle cx="18" cy="-5" r="2.6" fill="#f8f5e9"/>'
          : frame.season === 'spring'
            ? '<path d="M18,0v-10m-4,5h8" stroke="#dda2b2" stroke-width="4"/>'
            : frame.season === 'autumn'
              ? '<ellipse cx="18" cy="-2" rx="5" ry="4" fill="#d99855"/>'
              : '<path d="M15,0v-12m-8,2q8,-12 16,0Z" fill="#d89075"/>';
      return `<g data-event-id="${escapeXml(event.id)}" transform="translate(${center.x} ${center.y})"><path d="M-20,0v-21h40v21" fill="none" stroke="${palette.cliff[0]}"/>${flags}${seasonal}<title>${escapeXml(event.kind)} · Village gathering</title></g>`;
    })
    .join('');
}
