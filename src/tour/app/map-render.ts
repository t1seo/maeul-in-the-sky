import type { TourModel } from '../types.js';
import type { TourRenderer } from '../render/renderer.js';
import { canvasElement, element, formatDate } from './dom.js';
import { projectMapPoint, type MapPosition } from './map-coordinates.js';

const COLORS = {
  spring: '#aac087',
  summer: '#729c80',
  autumn: '#c4a171',
  winter: '#c2d4d0',
} as const;

export function nearestMapDate(model: TourModel, position: MapPosition): string | null {
  let nearest: { readonly date: string; readonly distance: number } | null = null;
  for (const cell of model.cells) {
    const distance = Math.hypot(cell.x - position.x, cell.z - position.z);
    if (!nearest || distance < nearest.distance) nearest = { date: cell.source.date, distance };
  }
  return nearest?.date ?? null;
}

export function drawMinimap(
  model: TourModel,
  state: ReturnType<TourRenderer['inspect']>,
  marker: MapPosition,
): void {
  const canvas = canvasElement('mini-map');
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (const cell of model.cells) {
    const corner = projectMapPoint(model.bounds, canvas, { x: cell.x - 1.8, z: cell.z - 1.8 });
    const end = projectMapPoint(model.bounds, canvas, { x: cell.x + 1.8, z: cell.z + 1.8 });
    context.fillStyle = cell.surface === 'water' ? '#659ea8' : COLORS[cell.season];
    context.fillRect(corner.x, corner.y, end.x - corner.x, end.y - corner.y);
  }
  const target = projectMapPoint(model.bounds, canvas, marker);
  context.strokeStyle = '#b36536';
  context.lineWidth = 2;
  context.beginPath();
  context.arc(target.x, target.y, 6, 0, Math.PI * 2);
  context.stroke();
  const current = projectMapPoint(model.bounds, canvas, state.position);
  context.save();
  context.translate(
    Math.max(6, Math.min(canvas.width - 6, current.x)),
    Math.max(6, Math.min(canvas.height - 6, current.y)),
  );
  context.rotate(-state.heading);
  context.beginPath();
  context.moveTo(0, -8);
  context.lineTo(6, 6);
  context.lineTo(0, 3);
  context.lineTo(-6, 6);
  context.closePath();
  context.fillStyle = '#2a4b43';
  context.strokeStyle = '#fff9e9';
  context.lineWidth = 2;
  context.fill();
  context.stroke();
  context.restore();
  const date = nearestMapDate(model, state.position);
  element('map-position').textContent =
    `${state.mode === 'walk' ? 'Walking' : 'View'}${date ? ` · ${formatDate(date)}` : ''}`;
  const selected = nearestMapDate(model, marker);
  element('map-marker-label').textContent = selected
    ? `Marker · ${formatDate(selected)}`
    : 'Choose a place';
}
