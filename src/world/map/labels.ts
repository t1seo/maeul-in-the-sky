import { escapeXml, svgNumber } from '../../core/svg.js';
import { calendarSeason } from '../model/dates.js';
import type { WorldFrame, WorldScene, WorldView } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { MAP_HEIGHT, project } from './projection.js';
import type { MapTransform } from './projection.js';
import { entityTitle } from './props.js';
import { polygon } from './terrain.js';
import type { TerrainMesh } from './terrain.js';

export function renderDateTargets(
  frame: WorldFrame,
  mesh: TerrainMesh,
  view: WorldView,
  palette: MapPalette,
): string {
  const tiles = new Map(frame.terrain.tiles.map((tile) => [tile.id, tile]));
  const selectionVisible = frame.days.some((day) => day.id === view.selectedId);
  return frame.days
    .map((day, index) => {
      const tile = tiles.get(day.tileId);
      const corners = mesh.get(day.tileId);
      if (!tile || tile.source !== 'day' || !corners) return '';
      const label = `${day.date} · ${day.kind === 'observed' ? `${day.count} contribution${day.count === 1 ? '' : 's'}` : 'No observation'}`;
      const selected = day.id === view.selectedId;
      const tabIndex = selected || (!selectionVisible && index === 0) ? 0 : -1;
      return `<g data-day-id="${escapeXml(day.id)}" data-date="${day.date}" data-day-kind="${day.kind}" role="button" tabindex="${tabIndex}" aria-label="${escapeXml(label)}" aria-pressed="${selected}" class="map-day${selected ? ' is-selected' : ''}"><title>${escapeXml(label)}</title><polygon points="${polygon(corners)}" fill="${selected ? '#f6d082' : palette.foam}" fill-opacity="${selected ? '0.22' : '0.005'}" stroke="${selected ? '#efc270' : palette.foam}" stroke-opacity="${selected ? '1' : '0.025'}" stroke-width="${selected ? '2' : '0.45'}" stroke-linejoin="round"/></g>`;
    })
    .join('');
}

export function renderMapLabels(
  scene: WorldScene,
  frame: WorldFrame,
  transform: MapTransform,
  palette: MapPalette,
): string {
  const seasonNames = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' } as const;
  const groups =
    scene.settings.layout === 'seasonal'
      ? scene.islands
          .map((island) => {
            const first = island.monthKeys[0];
            if (!first) return undefined;
            const season = calendarSeason(`${first}-15`, scene.settings.hemisphere);
            return {
              keys: island.monthKeys,
              attribute: `data-season-label="${season}" data-months="${island.monthKeys.join(' ')}"`,
              label: seasonNames[season],
              title: `${seasonNames[season]} · ${island.monthKeys.join(' · ')}`,
            };
          })
          .filter((group) => group !== undefined)
      : [...new Set(scene.regions.map((region) => region.monthKey))].map((monthKey) => ({
          keys: [monthKey],
          attribute: `data-month-label="${monthKey}"`,
          label: monthKey,
          title: monthKey,
        }));
  const labels = groups.map((group) => {
    const regions = scene.regions.filter((region) => group.keys.includes(region.monthKey));
    const points = regions.flatMap((region) => region.boundary);
    if (points.length === 0) return '';
    const projected = points.map(project);
    const x =
      (Math.min(...projected.map((point) => point.x)) +
        Math.max(...projected.map((point) => point.x))) /
      2;
    const y = Math.max(...projected.map((point) => point.y)) + 22;
    return `<text ${group.attribute} x="${svgNumber(transform.x + x * transform.scale)}" y="${svgNumber(transform.y + y * transform.scale)}" text-anchor="middle" font-size="13" letter-spacing="1.4" fill="${palette.ink}" paint-order="stroke" stroke="${palette.skyBottom}" stroke-width="3"><title>${escapeXml(group.title)}</title>${escapeXml(group.label)}</text>`;
  });
  const projects = frame.entities
    .filter((entity) => entity.kind === 'repository' || entity.kind === 'release')
    .map((entity) => {
      const p = project(entity.position);
      return `<text data-project-label="${escapeXml(entity.repoId ?? entity.id)}" x="${svgNumber(transform.x + p.x * transform.scale)}" y="${svgNumber(transform.y + p.y * transform.scale + 18)}" text-anchor="middle" fill="${palette.ink}" font-size="12" paint-order="stroke" stroke="${palette.skyBottom}" stroke-width="3">${escapeXml(entityTitle(scene, entity))}</text>`;
    });
  return `<g class="map-labels" pointer-events="none" font-family="Georgia, 'Noto Serif KR', serif">${labels.join('')}${projects.join('')}</g>`;
}

export function renderCaption(
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
  palette: MapPalette,
): string {
  const observed = frame.days.filter((day) => day.kind === 'observed');
  const first = observed[0]?.date;
  const last = observed[observed.length - 1]?.date;
  const period =
    first && last ? `Observed ${first} – ${last}` : `No observations through ${frame.cursorDate}`;
  const title =
    scene.settings.culture === 'korean'
      ? `${scene.username} 님의 하늘 마을`
      : `${scene.username}'s sky world`;
  return `<g pointer-events="none"><text x="42" y="47" font-size="11" letter-spacing="3" fill="${palette.muted}" font-family="Georgia, serif">MAEUL · A LIVING CALENDAR</text><text x="40" y="84" font-size="27" fill="${palette.ink}" font-family="Georgia, 'Noto Serif KR', serif">${escapeXml(title)}</text><text x="42" y="109" font-size="12" fill="${palette.muted}" font-family="Georgia, serif">${period} · ${frame.stats.totalContributions.toLocaleString('en-US')} contributions</text><path d="M42,${MAP_HEIGHT - 56}h1116" stroke="${palette.muted}" opacity="0.25"/><text x="42" y="${MAP_HEIGHT - 30}" fill="${palette.muted}" font-size="12" font-family="Georgia, serif">${frame.season} · ${view.lighting} · ${view.weather}${view.seasonOverride === 'calendar' ? '' : ' · seasonal preview'}</text><text x="1158" y="${MAP_HEIGHT - 30}" text-anchor="end" fill="${palette.muted}" font-size="12" font-family="Georgia, serif">${frame.stats.observedDays} observed days · ${frame.discoveries.length} places to discover</text></g>`;
}
