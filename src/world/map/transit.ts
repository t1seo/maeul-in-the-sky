import { escapeXml, svgNumber } from '../../core/svg.js';
import type { WorldFrame } from '../model/types.js';
import type { MapPalette } from './palette.js';
import { project } from './projection.js';
import { polygon } from './terrain.js';

type FramedActor = WorldFrame['actors'][number];

export function renderRoutes(frame: WorldFrame, palette: MapPalette): string {
  return frame.routes
    .map((route) => {
      const points = polygon(route.points);
      let art: string;
      switch (route.kind) {
        case 'walk':
          art = `<polyline points="${points}" stroke="${palette.path}" stroke-width="5"/><polyline points="${points}" stroke="${palette.sand}" stroke-width="1" stroke-dasharray="2 6"/>`;
          break;
        case 'water':
          art = `<polyline points="${points}" stroke="${palette.foam}" stroke-width="1.2" stroke-dasharray="3 11" opacity="0.45"/>`;
          break;
        case 'rail':
          art = `<polyline points="${points}" stroke="#6b6960" stroke-width="7"/><polyline points="${points}" stroke="#bca682" stroke-width="6" stroke-dasharray="1.6 5"/><polyline points="${points}" stroke="#ded6b8" stroke-width="4"/><polyline points="${points}" stroke="#5c6563" stroke-width="2.5"/>`;
          break;
      }
      return `<g data-route-id="${escapeXml(route.id)}" data-route-kind="${route.kind}" fill="none" stroke-linecap="round" stroke-linejoin="round">${art}</g>`;
    })
    .join('');
}

export function actorTransform(actor: FramedActor): string {
  const p = project(actor.position);
  const facing = Math.sin(actor.yaw) - Math.cos(actor.yaw) < 0 ? -1 : 1;
  return `translate(${svgNumber(p.x)} ${svgNumber(p.y)}) scale(${facing} 1)`;
}

function actorArt(actor: FramedActor): string {
  switch (actor.kind) {
    case 'train':
      return '<path d="M-18,-4h24v8h-24Z" fill="#bc8970"/><path d="M-18,-4l4,-3H9L6,-4Z" fill="#e5c294"/><path d="M-15,-3h4v4h-4m6,-4h4v4h-4m6,-4h4v4H-3" fill="#ebdba9"/><path d="M7,-3h13v7H7Z" fill="#527b76"/><path d="M9,-3v-6h7v6m2,0v-6h2v7" fill="#3f6767"/><circle cx="-14" cy="5" r="2" fill="#424f4c"/><circle cx="2" cy="5" r="2" fill="#424f4c"/><circle cx="10" cy="5" r="2" fill="#424f4c"/><circle cx="18" cy="5" r="2" fill="#424f4c"/>';
    case 'ferry':
      return '<ellipse cx="0" cy="6" rx="19" ry="3" fill="#deeee4" opacity="0.55"/><path d="M-17,0l7,7h19l9,-7Z" fill="#a67559"/><path d="M-10,0v-7H8v7" fill="#eddfb6"/><path d="M-12,-7h23l-5,-4h-15Z" fill="#668b85"/><path d="M-7,-6h4v4h-4m7,-4h4v4H0" fill="#4c797d"/><path d="M-2,-11v-8l10,4 -10,1" fill="#e0a36f"/>';
    case 'wildlife':
      return '<ellipse cx="0" cy="0" rx="5" ry="3" fill="#b99870"/><path d="M-3,1v5m5,-5v5M3,-1l2,-6 4,1 -1,4" fill="none" stroke="#9c795b" stroke-width="2"/><path d="M6,-6l-2,-5m3,5 2,-5" stroke="#806f55" fill="none"/><circle cx="8" cy="-5" r="0.7" fill="#364a40"/>';
    case 'resident':
      return '<ellipse cx="0" cy="3" rx="4" ry="1.5" fill="#576e65" opacity="0.3"/><path d="M-2,1l1,-7h3l2,7Z" fill="#bc7867"/><circle cx="1" cy="-8" r="2.2" fill="#e2bf90"/><path d="M-2,-9q3,-4 6,0" fill="#665a49"/>';
  }
}

export function renderActors(frame: WorldFrame): string {
  return frame.actors
    .map(
      (actor) =>
        `<g data-actor-id="${escapeXml(actor.id)}" data-actor-kind="${actor.kind}" transform="${actorTransform(actor)}"><title>${actor.kind}</title>${actorArt(actor)}</g>`,
    )
    .join('');
}
