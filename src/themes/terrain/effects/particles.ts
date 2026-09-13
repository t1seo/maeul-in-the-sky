import type { IsoCell } from '../blocks.js';
import type { TerrainPalette100 } from '../palette.js';
import { seededRandom } from '../../../utils/math.js';
import { getSeasonZone } from '../seasons.js';
import { selectEvenly } from './selection.js';
export function renderSnowParticles(
  isoCells: IsoCell[],
  seed: number,
  seasonRotation: number = 0,
): string {
  const rng = seededRandom(seed + 9991);
  const particles: string[] = [];
  const maxParticles = 40;
  let count = 0;

  // Collect cells in winter zones (0, 1, 7)
  const winterCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 0 || zone === 1 || zone === 7;
  });

  if (winterCells.length === 0) return '';

  const selected = selectEvenly(winterCells, maxParticles);
  for (const cell of selected) {
    /* v8 ignore start */
    if (count >= maxParticles) break;
    /* v8 ignore stop */
    const zone = getSeasonZone(cell.week, seasonRotation);
    // More particles in peak winter (zone 0), fewer in transitions
    const density = zone === 0 ? 0.8 : 0.4;
    if (rng() > density) continue;

    const px = cell.isoX + (rng() - 0.5) * 10;
    const py = cell.isoY - cell.height - 5 - rng() * 20;
    const r = 0.3 + rng() * 0.4;
    const opacity = 0.3 + rng() * 0.4;

    particles.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${opacity.toFixed(2)}"/>`,
    );
    count++;
  }

  /* v8 ignore start */
  return particles.length > 0 ? `<g class="snow-particles">${particles.join('')}</g>` : '';
  /* v8 ignore stop */
}

/**
 * Render falling cherry blossom petals for spring zones.
 * Small pink ellipses scattered in spring-zone columns.
 */
export function renderFallingPetals(
  isoCells: IsoCell[],
  seed: number,
  palette: TerrainPalette100,
  seasonRotation: number = 0,
): string {
  const rng = seededRandom(seed + 7771);
  const petals: string[] = [];
  const maxPetals = 30;
  let count = 0;

  /* v8 ignore start */
  const petalColor = palette.assets.cherryPetalPink || '#f5a0b8';
  /* v8 ignore stop */

  // Collect cells in spring zones (1, 2, 3)
  const springCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 2 || zone === 1 || zone === 3;
  });

  if (springCells.length === 0) return '';

  const selected = selectEvenly(springCells, maxPetals);
  for (const cell of selected) {
    /* v8 ignore start */
    if (count >= maxPetals) break;
    /* v8 ignore stop */
    const zone = getSeasonZone(cell.week, seasonRotation);
    const density = zone === 2 ? 0.7 : 0.35;
    if (rng() > density) continue;

    const px = cell.isoX + (rng() - 0.5) * 8;
    const py = cell.isoY - cell.height - 3 - rng() * 15;
    const rx = 0.3 + rng() * 0.2;
    const ry = 0.12 + rng() * 0.08;
    const rotation = Math.floor(rng() * 180);
    const opacity = 0.35 + rng() * 0.3;

    petals.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(2)}" ` +
        `fill="${petalColor}" opacity="${opacity.toFixed(2)}" transform="rotate(${rotation},${px.toFixed(1)},${py.toFixed(1)})"/>`,
    );
    count++;
  }

  /* v8 ignore start */
  return petals.length > 0 ? `<g class="falling-petals">${petals.join('')}</g>` : '';
  /* v8 ignore stop */
}

/**
 * Render falling leaves for autumn zones.
 * Small colored ellipses in red/orange/gold scattered in autumn-zone columns.
 */
export function renderFallingLeaves(
  isoCells: IsoCell[],
  seed: number,
  palette: TerrainPalette100,
  seasonRotation: number = 0,
): string {
  const rng = seededRandom(seed + 5551);
  const leaves: string[] = [];
  const maxLeaves = 30;
  let count = 0;

  /* v8 ignore start */
  const leafColors = [
    palette.assets.fallenLeafRed || '#c04030',
    palette.assets.fallenLeafOrange || '#d08030',
    palette.assets.fallenLeafGold || '#d0a030',
    palette.assets.mapleRed || '#c83020',
    palette.assets.oakGold || '#c8a030',
  ];
  /* v8 ignore stop */

  // Collect cells in autumn zones (5, 6, 7)
  const autumnCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 6 || zone === 5 || zone === 7;
  });

  if (autumnCells.length === 0) return '';

  const selected = selectEvenly(autumnCells, maxLeaves);
  for (const cell of selected) {
    /* v8 ignore start */
    if (count >= maxLeaves) break;
    /* v8 ignore stop */
    const zone = getSeasonZone(cell.week, seasonRotation);
    const density = zone === 6 ? 0.7 : 0.35;
    if (rng() > density) continue;

    const px = cell.isoX + (rng() - 0.5) * 8;
    const py = cell.isoY - cell.height - 2 - rng() * 12;
    const rx = 0.4 + rng() * 0.3;
    const ry = 0.15 + rng() * 0.1;
    const rotation = Math.floor(rng() * 360);
    const opacity = 0.4 + rng() * 0.3;
    const color = leafColors[Math.floor(rng() * leafColors.length)];

    leaves.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(2)}" ` +
        `fill="${color}" opacity="${opacity.toFixed(2)}" transform="rotate(${rotation},${px.toFixed(1)},${py.toFixed(1)})"/>`,
    );
    count++;
  }

  /* v8 ignore start */
  return leaves.length > 0 ? `<g class="falling-leaves">${leaves.join('')}</g>` : '';
  /* v8 ignore stop */
}
