import { escapeXml, svgNumber } from '../../core/svg.js';
import { clamp } from '../../utils/math.js';
import { lerpColor } from '../../utils/color.js';
import type { Vec3, WorldFrame, WorldTile, WorldWaterway } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { project } from './projection.js';
import { motionId } from '../../core/animation.js';
import { smoothWaterPath, waterCurrentOffset } from './surface-textures.js';

export type TerrainMesh = ReadonlyMap<string, readonly Vec3[]>;
const OFFSETS = [
  [-0.5, -0.5],
  [0.5, -0.5],
  [0.5, 0.5],
  [-0.5, 0.5],
] as const;
const SURFACE_PRIORITY = { grass: 0, rock: 0, sand: 0, field: 0, path: 1, water: 2 } as const;

export function terrainMesh(tiles: readonly WorldTile[]): TerrainMesh {
  const vertices = new Map<string, { sum: number; count: number; priority: number }>();
  const cornerKey = (tile: WorldTile, x: number, z: number): string =>
    `${tile.islandId}:${x.toFixed(4)},${z.toFixed(4)}`;
  for (const tile of tiles) {
    for (const [dx, dz] of OFFSETS) {
      const key = cornerKey(
        tile,
        tile.position.x + dx * tile.size,
        tile.position.z + dz * tile.size,
      );
      const priority = SURFACE_PRIORITY[tile.surface];
      const height = tile.position.y + (priority === 0 ? tile.activityHeight : 0);
      const current = vertices.get(key);
      if (!current || current.priority < priority)
        vertices.set(key, { sum: height, count: 1, priority });
      else if (current.priority === priority)
        vertices.set(key, { sum: current.sum + height, count: current.count + 1, priority });
    }
  }
  return new Map(
    tiles.map((tile) => [
      tile.id,
      OFFSETS.map(([dx, dz]) => {
        const x = tile.position.x + dx * tile.size;
        const z = tile.position.z + dz * tile.size;
        const vertex = vertices.get(cornerKey(tile, x, z));
        return { x, z, y: vertex ? vertex.sum / vertex.count : tile.position.y };
      }),
    ]),
  );
}

export function polygon(points: readonly Vec3[]): string {
  return points
    .map((point) => {
      const p = project(point);
      return `${svgNumber(p.x)},${svgNumber(p.y)}`;
    })
    .join(' ');
}

function tileColor(tile: WorldTile, palette: MapPalette): string {
  switch (tile.surface) {
    case 'grass':
      return lerpColor(
        palette.ground[0],
        palette.ground[1],
        clamp(tile.position.y * 0.18, 0, 0.65),
      );
    case 'rock':
      return palette.cliff[0];
    case 'sand':
      return palette.sand;
    case 'water':
      return palette.water;
    case 'path':
      return palette.path;
    case 'field':
      return palette.ground[2];
  }
}

export function renderTerrain(
  frame: WorldFrame,
  mesh: TerrainMesh,
  palette: MapPalette,
  regions: ReadonlyMap<string, MapPalette> = new Map(),
): string {
  const edges = new Map<
    string,
    { points: readonly [Vec3, Vec3]; count: number; colors: MapPalette }
  >();
  const faces: string[] = [];
  const caps: string[] = [];
  for (const tile of frame.terrain.tiles) {
    const colors = regions.get(tile.regionId) ?? palette;
    const corners = mesh.get(tile.id) ?? [];
    for (let index = 0; index < corners.length; index++) {
      const start = corners[index];
      const end = corners[(index + 1) % corners.length];
      const key = `${tile.islandId}:${[`${start.x},${start.z}`, `${end.x},${end.z}`].sort().join(':')}`;
      const edge = edges.get(key);
      edges.set(key, { points: [start, end], count: (edge?.count ?? 0) + 1, colors });
    }
    const color = tileColor(tile, colors);
    const center = { ...tile.position, y: tile.position.y + tile.activityHeight };
    const triangles = corners
      .map((corner, index) => {
        const next = corners[(index + 1) % corners.length];
        const slope =
          tile.surface === 'water'
            ? 0
            : (center.y - (corner.y + next.y) / 2) * (index < 2 ? 0.07 : -0.045);
        const face = lerpColor(
          color,
          slope > 0 ? colors.ground[1] : colors.ground[2],
          Math.min(Math.abs(slope), 0.14),
        );
        return `<polygon points="${polygon([corner, next, center])}" fill="${face}"/>`;
      })
      .join('');
    caps.push(
      `<g data-tile-id="${escapeXml(tile.id)}" data-source="${tile.source}" fill="${color}"><polygon points="${polygon(corners)}"/>${triangles}<polygon data-ground-texture="${tile.surface}" points="${polygon(corners)}" fill="url(#${motionId(`ground-${tile.surface}`)})" opacity="0.42"/></g>`,
    );
  }
  for (const {
    points: [start, end],
    count,
    colors,
  } of edges.values()) {
    if (count !== 1) continue;
    const baseY = frame.terrain.waterLevel - 1.3;
    const bottom = [
      { ...end, y: baseY },
      { ...start, y: baseY },
    ];
    const color = end.x > start.x ? colors.cliff[0] : colors.cliff[1];
    faces.push(
      `<polygon points="${polygon([start, end, ...bottom])}" fill="${color}" stroke="${color}" stroke-width="0.5"/>`,
    );
    const strata = [0.3, 0.68].map((fraction) =>
      [start, end].map((point) => ({ ...point, y: point.y + (baseY - point.y) * fraction })),
    );
    for (const line of strata)
      faces.push(
        `<polyline points="${polygon(line)}" fill="none" stroke="${palette.sand}" stroke-width="0.7" opacity="0.22"/>`,
      );
    faces.push(
      `<polyline points="${polygon([start, end])}" fill="none" stroke="${palette.foam}" stroke-width="1.2" opacity="0.25"/>`,
    );
  }
  return `<g class="map-cliffs">${faces.join('')}</g><g class="map-ground">${caps.join('')}</g>`;
}

function renderPond(way: WorldWaterway, palette: MapPalette, seconds: number): string {
  const path = `${smoothWaterPath(way.points)}Z`;
  const points = way.points.map(project);
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const centerY = points.reduce((total, point) => total + point.y, 0) / points.length;
  const centerX = (minX + maxX) / 2;
  const radius = (maxX - minX) / 2;
  const currents = [-1, 0, 1]
    .map((row, index) => {
      const x = centerX - radius * (0.38 + index * 0.06);
      const y = centerY + row * radius * 0.17;
      const streak = `M${svgNumber(x)},${svgNumber(y)}q${svgNumber(radius * 0.3)},-2 ${svgNumber(radius * (0.62 + index * 0.08))},1`;
      const speed = 0.6 + index * 0.25;
      return `<path data-water-current="${speed}" d="${streak}" stroke="${palette.foam}" stroke-width="0.8" stroke-dasharray="7 57" stroke-dashoffset="${waterCurrentOffset(seconds, speed)}" opacity="0.35"/>`;
    })
    .join('');
  return `<path d="${path}" fill="${palette.water}" stroke="${palette.sand}" stroke-width="4" stroke-opacity="0.16"/><path data-water-surface="pond" d="${path}" fill="url(#${motionId('water-shallows')})"/>${currents}`;
}

export function renderWaterways(frame: WorldFrame, palette: MapPalette, seconds = 0): string {
  return `<g class="map-waterways">${frame.terrain.waterways
    .map((way) => {
      const path = smoothWaterPath(way.points);
      const width = Math.max(2, way.width * 28);
      const banks = `<path d="${path}" stroke="${palette.ground[2]}" stroke-width="${width + 8}" opacity="0.1"/><path d="${path}" stroke="${palette.sand}" stroke-width="${width + 4}" opacity="0.23"/><path d="${path}" stroke="${palette.water}" stroke-width="${width}"/><path d="${path}" stroke="${palette.foam}" stroke-width="${width * 0.62}" opacity="0.07"/>`;
      const currents = [1.2, 2]
        .map(
          (speed, index) =>
            `<path data-water-current="${speed}" d="${path}" stroke="${palette.foam}" stroke-width="${index === 0 ? width * 0.3 : 0.7}" stroke-dasharray="${index === 0 ? '9 55' : '4 60'}" stroke-dashoffset="${waterCurrentOffset(seconds, speed)}" opacity="${index === 0 ? 0.09 : 0.28}"/>`,
        )
        .join('');
      return `<g data-waterway-id="${escapeXml(way.id)}" fill="none" stroke-linejoin="round" stroke-linecap="round">${way.kind === 'pond' ? renderPond(way, palette, seconds) : banks + currents}</g>`;
    })
    .join('')}</g>`;
}
