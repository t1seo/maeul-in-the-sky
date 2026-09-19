import { escapeXml, svgNumber } from '../../core/svg.js';
import { hash, seededRandom } from '../../utils/math.js';
import type { WorldFrame, WorldScene, WorldSeason, WorldView } from '../model/types.js';
import { seasonForMonth, weatherForMonth } from '../model/seasons.js';
import { exhaustive, project } from './projection.js';
import type { MapPoint } from './projection.js';

type ParticleKind = 'petal' | 'butterfly' | 'leaf' | 'flower' | 'rain' | 'snow';
export type SceneryParticle = {
  readonly id: string;
  readonly regionId: string;
  readonly kind: ParticleKind;
  readonly origin: MapPoint;
  readonly phase: number;
  readonly scale: number;
};

const LIFE = {
  spring: ['flower', 'petal', 'petal', 'butterfly'],
  summer: ['flower', 'butterfly'],
  autumn: ['leaf'],
  winter: [],
} as const satisfies Record<WorldSeason, readonly ParticleKind[]>;

export function sceneryParticles(
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
): readonly SceneryParticle[] {
  const totalBudget = view.quality === 'low' ? 96 : 240;
  const regionalBudget = Math.min(
    view.quality === 'low' ? 8 : 18,
    Math.floor(totalBudget / Math.max(1, scene.regions.length)),
  );
  return scene.regions.flatMap((region) => {
    const tiles = frame.terrain.tiles.filter(
      (tile) => tile.regionId === region.id && tile.surface !== 'water',
    );
    if (tiles.length === 0) return [];
    const season = seasonForMonth(scene, view, region.monthKey);
    const kinds: ParticleKind[] = region.kind === 'nature' ? [...LIFE[season]] : [];
    const weather = weatherForMonth(scene, view, region.monthKey);
    if (weather === 'rain' || weather === 'snow') kinds.push(weather, weather, weather);
    if (kinds.length === 0) return [];
    const rng = seededRandom(hash(`${scene.worldId}:${region.id}:scenery`));
    return Array.from({ length: regionalBudget }, (_, index) => {
      const tile = tiles[Math.floor(rng() * tiles.length)];
      return {
        id: `${region.id}:${index}`,
        regionId: region.id,
        kind: kinds[index % kinds.length],
        origin: project({
          x: tile.position.x + (rng() - 0.5) * tile.size * 0.8,
          y: tile.position.y + tile.activityHeight,
          z: tile.position.z + (rng() - 0.5) * tile.size * 0.8,
        }),
        phase: rng(),
        scale: 0.65 + rng() * 0.65,
      };
    });
  });
}

export function sceneryTransform(particle: SceneryParticle, seconds: number): string {
  const phase = particle.phase * Math.PI * 2;
  const time = seconds + phase;
  let x = particle.origin.x;
  let y = particle.origin.y;
  let rotation = 0;
  let width = 1;
  switch (particle.kind) {
    case 'flower':
      rotation = Math.sin(time * 0.9) * 5;
      break;
    case 'butterfly':
      x += Math.sin(time * 0.7) * 12;
      y -= 13 + Math.cos(time * 1.1) * 5;
      rotation = Math.sin(time) * 12;
      width = 0.55 + Math.abs(Math.sin(time * 5)) * 0.45;
      break;
    case 'petal':
    case 'leaf':
      x += Math.sin(time * 0.6) * 9;
      y -= 44 * (1 - ((particle.phase + seconds * 0.045) % 1));
      rotation = phase * 40 + seconds * 13;
      break;
    case 'rain': {
      const fall = (particle.phase + seconds * 0.55) % 1;
      x += 8 * (1 - fall);
      y -= 55 * (1 - fall);
      break;
    }
    case 'snow':
      x += Math.sin(time * 0.45) * 6;
      y -= 55 * (1 - ((particle.phase + seconds * 0.075) % 1));
      break;
    default:
      return exhaustive(particle.kind);
  }
  return `translate(${svgNumber(x)} ${svgNumber(y)}) rotate(${svgNumber(rotation)}) scale(${svgNumber(particle.scale * width)} ${svgNumber(particle.scale)})`;
}

function particleArt(kind: ParticleKind): string {
  switch (kind) {
    case 'flower':
      return '<path d="M0,0Q-1,-4 0,-7M0,-3Q-4,-6 -4,-2" fill="none" stroke="#70906a" stroke-width="0.7"/><path d="M0,-6C-5,-6 -3,-11 0,-9C3,-12 5,-7 1,-6Z" fill="#f3d7c0"/><circle cy="-7.5" r="0.7" fill="#dbb365"/>';
    case 'butterfly':
      return '<path d="M0,0C-8,-9 -8,2 -1,2C-6,7 0,7 0,0M0,0C8,-9 8,2 1,2C6,7 0,7 0,0" fill="#e5b867" stroke="#b18b61" stroke-width="0.5"/><path d="M0,-2V3" stroke="#775c49" stroke-width="0.7"/>';
    case 'petal':
      return '<path d="M-2,0Q-4,-5 0,-3Q4,-4 3,0Q1,4 -2,0Z" fill="#f0bfc5" opacity="0.85"/>';
    case 'leaf':
      return '<path d="M-4,2Q-5,-5 4,-3Q5,3 -4,2Z" fill="#cc9858"/><path d="M-4,2L3,-2" stroke="#9a794a" stroke-width="0.5"/>';
    case 'rain':
      return '<path d="M0,0l-1.5,7" stroke="#c4e1de" stroke-width="0.8" stroke-linecap="round" opacity="0.65"/>';
    case 'snow':
      return '<circle r="1.5" fill="#fffaf0" opacity="0.85"/>';
    default:
      return exhaustive(kind);
  }
}

export function renderSceneryMotion(
  particles: readonly SceneryParticle[],
  view: WorldView,
): string {
  return `<g class="map-seasonal-motion" data-weather="${view.weather}" aria-hidden="true" pointer-events="none">${particles.map((particle) => `<g data-scenery-id="${escapeXml(particle.id)}" data-region-id="${escapeXml(particle.regionId)}" data-scenery-motion="${particle.kind}" transform="${sceneryTransform(particle, view.elapsedSeconds)}">${particleArt(particle.kind)}</g>`).join('')}</g>`;
}
