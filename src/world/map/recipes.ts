import type { ModelPart, ModelRecipe, Vec3 } from '../model/types.js';
import { project } from './projection.js';
import { polygon } from './terrain.js';
import { lerpColor } from '../../utils/color.js';

function shade(color: string, percent: number): string {
  return lerpColor(color, percent < 0 ? '#182e34' : '#fff5d9', Math.abs(percent) / 100);
}

function box(part: ModelPart): string {
  const { position: p, size: s } = part;
  const left = p.x - s.x / 2;
  const right = p.x + s.x / 2;
  const back = p.z - s.z / 2;
  const front = p.z + s.z / 2;
  const top = p.y + s.y / 2;
  const base = p.y - s.y / 2;
  const corners = [
    { x: left, y: top, z: back },
    { x: right, y: top, z: back },
    { x: right, y: top, z: front },
    { x: left, y: top, z: front },
  ];
  return `<polygon points="${polygon([corners[3], corners[2], { x: right, y: base, z: front }, { x: left, y: base, z: front }])}" fill="${shade(part.color, -15)}"/><polygon points="${polygon([corners[2], corners[1], { x: right, y: base, z: back }, { x: right, y: base, z: front }])}" fill="${shade(part.color, -28)}"/><polygon points="${polygon(corners)}" fill="${part.color}"/>`;
}

function renderPart(part: ModelPart): string {
  const center = project(part.position);
  const radius = Math.max(part.size.x, part.size.z) * 14;
  const height = part.size.y * 28;
  switch (part.primitive) {
    case 'box':
      return box(part);
    case 'sphere':
      return `<ellipse cx="${center.x}" cy="${center.y}" rx="${radius}" ry="${Math.max(radius * 0.55, height / 2)}" fill="${part.color}"/><ellipse cx="${center.x - radius * 0.25}" cy="${center.y - height * 0.16}" rx="${radius * 0.6}" ry="${height * 0.26}" fill="${shade(part.color, 12)}"/>`;
    case 'cylinder':
      return `<path d="M${center.x - radius},${center.y - height / 2}h${radius * 2}v${height}q${-radius},${radius * 0.8} ${-radius * 2},0Z" fill="${part.color}"/><ellipse cx="${center.x}" cy="${center.y - height / 2}" rx="${radius}" ry="${radius * 0.45}" fill="${shade(part.color, 15)}"/>`;
    case 'cone':
      return `<path d="M${center.x},${center.y - height / 2}L${center.x + radius},${center.y + height / 2}Q${center.x},${center.y + height / 2 + radius * 0.4} ${center.x - radius},${center.y + height / 2}Z" fill="${part.color}"/>`;
    case 'roof': {
      const peak: Vec3 = { ...part.position, y: part.position.y + part.size.y / 2 };
      const base = { ...part.position, y: part.position.y - part.size.y / 2 };
      return `<polygon points="${polygon([
        { ...base, x: base.x - part.size.x / 2, z: base.z - part.size.z / 2 },
        { ...peak, z: peak.z - part.size.z / 2 },
        { ...peak, z: peak.z + part.size.z / 2 },
        { ...base, x: base.x - part.size.x / 2, z: base.z + part.size.z / 2 },
      ])}" fill="${part.color}"/><polygon points="${polygon([
        { ...peak, z: peak.z + part.size.z / 2 },
        { ...base, x: base.x + part.size.x / 2, z: base.z + part.size.z / 2 },
        { ...base, x: base.x - part.size.x / 2, z: base.z + part.size.z / 2 },
      ])}" fill="${shade(part.color, -20)}"/>`;
    }
  }
}

export function renderRecipe(recipe: ModelRecipe): string {
  return recipe.parts
    .map((part) => `<g opacity="${part.opacity}">${renderPart(part)}</g>`)
    .join('');
}
