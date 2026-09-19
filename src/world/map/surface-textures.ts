import { motionId } from '../../core/animation.js';
import { svgNumber } from '../../core/svg.js';
import type { Vec3, WorldTile } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { project } from './projection.js';
import { lerpColor } from '../../utils/color.js';

export function surfaceTextureDefs(palette: MapPalette): string {
  const textures: Record<WorldTile['surface'], string> = {
    grass: `<path d="M3,7q2,-4 1,-5M4,7q2,-2 3,-2M17,15q-1,-3 1,-5M18,15l3,-2" stroke="${palette.ground[2]}" stroke-width="0.8" fill="none"/><ellipse cx="11" cy="12" rx="2" ry="0.7" fill="${palette.ground[1]}"/>`,
    field: `<path d="M0,5Q8,0 16,5T32,5M-8,15Q0,10 8,15T24,15" fill="none" stroke="${palette.path}" stroke-width="1.5" opacity="0.6"/><path d="M6,6v-3m10,12v-4" stroke="${palette.ground[2]}" stroke-width="1"/>`,
    sand: `<path d="M2,7q5,-2 9,0M14,14q4,-2 8,0" fill="none" stroke="${palette.cliff[0]}" stroke-width="0.65" opacity="0.35"/><circle cx="18" cy="4" r="0.7" fill="${palette.foam}"/>`,
    rock: `<path d="M1,9l5,-5 7,2M16,17l4,-6 8,-2" stroke="${palette.cliff[1]}" stroke-width="0.8" opacity="0.4" fill="none"/><path d="M6,4l2,4 5,-2" stroke="${palette.sand}" stroke-width="0.65" fill="none"/>`,
    path: `<ellipse cx="5" cy="6" rx="1.8" ry="0.6" fill="${palette.sand}"/><path d="M14,14l3,-1M21,4h2" stroke="${palette.cliff[0]}" opacity="0.35" stroke-width="0.7"/>`,
    water: `<path d="M1,6q5,-2 10,0M15,14q4,-2 9,0" fill="none" stroke="${palette.foam}" stroke-width="0.8" opacity="0.65"/>`,
  };
  return (
    `<radialGradient id="${motionId('water-shallows')}" cx="42%" cy="42%" r="65%"><stop stop-color="${palette.water}"/><stop offset="0.55" stop-color="${palette.water}"/><stop offset="1" stop-color="${lerpColor(palette.water, palette.foam, 0.26)}"/></radialGradient>` +
    Object.entries(textures)
      .map(
        ([surface, art]) =>
          `<pattern id="${motionId(`ground-${surface}`)}" patternUnits="userSpaceOnUse" width="28" height="20">${art}</pattern>`,
      )
      .join('')
  );
}

export function smoothWaterPath(points: readonly Vec3[]): string {
  const projected = points.map(project);
  if (projected.length === 0) return '';
  const first = projected[0];
  let path = `M${svgNumber(first.x)},${svgNumber(first.y)}`;
  for (let index = 1; index < projected.length - 1; index++) {
    const point = projected[index];
    const next = projected[index + 1];
    path += `Q${svgNumber(point.x)},${svgNumber(point.y)} ${svgNumber((point.x + next.x) / 2)},${svgNumber((point.y + next.y) / 2)}`;
  }
  const last = projected[projected.length - 1];
  return `${path}L${svgNumber(last.x)},${svgNumber(last.y)}`;
}

export function waterCurrentOffset(seconds: number, speed: number): string {
  return svgNumber(-(seconds * speed) % 64);
}
