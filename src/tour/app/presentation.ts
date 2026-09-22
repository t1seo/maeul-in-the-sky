import type { TourModel } from '../types.js';
import { canvasElement, element, formatDate } from './dom.js';

const SEASONS = { spring: '봄', summer: '여름', autumn: '가을', winter: '겨울' } as const;
const ICONS = { spring: '✿', summer: '☀', autumn: '❧', winter: '❄' } as const;

export function presentVillage(model: TourModel, source: string | null): void {
  element('owner').textContent = `@${model.scene.username}의`;
  element('source-tag').textContent = source
    ? 'GitHub 프로필과 같은 마을'
    : 'SAMPLE · 예시 기록으로 만든 마을';
  element('date-range').textContent = `${model.scene.fromDate} — ${model.scene.toDate}`;
  const stats = element('village-stats');
  stats.replaceChildren();
  for (const [value, label] of [
    [model.scene.stats.total, '개의 기록'],
    [model.scene.stats.activeDays, '일의 발자취'],
    [model.scene.wonders.length, '개의 원더'],
  ] as const) {
    const wrapper = document.createElement('div');
    const count = document.createElement('strong');
    count.textContent = value.toLocaleString('ko-KR');
    const text = document.createElement('span');
    text.textContent = label;
    wrapper.append(count, text);
    stats.append(wrapper);
  }
  const stops = element('season-stops');
  stops.replaceChildren();
  for (const [index, stop] of model.stops.entries()) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.stop = String(index);
    button.setAttribute('aria-label', `${SEASONS[stop.id]} 풍경으로 이동`);
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICONS[stop.id];
    button.append(icon, SEASONS[stop.id]);
    stops.append(button);
  }
}

export function drawMinimap(model: TourModel, stopIndex: number): void {
  const canvas = canvasElement('mini-map');
  const context = canvas.getContext('2d');
  if (!context) return;
  context.clearRect(0, 0, canvas.width, canvas.height);
  const scale = (canvas.width - 12) / (model.bounds.maxX - model.bounds.minX);
  const offset = 6 - model.bounds.minX * scale;
  const color = {
    spring: '#aac087',
    summer: '#729c80',
    autumn: '#c4a171',
    winter: '#c2d4d0',
  } as const;
  for (const cell of model.cells) {
    context.fillStyle = cell.surface === 'water' ? '#659ea8' : color[cell.season];
    context.fillRect(
      (cell.x - 1.8) * scale + offset,
      cell.z * 2.6 + 8,
      Math.max(1, 3.6 * scale),
      8,
    );
  }
  const stop = model.stops[stopIndex];
  if (stop) {
    context.strokeStyle = '#344b40';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(stop.position.x * scale + offset, stop.position.z * 2.6 + 12, 7, 0, Math.PI * 2);
    context.stroke();
    element('place-label').textContent = `${SEASONS[stop.id]}의 마을`;
    element('place-date').textContent = formatDate(stop.date);
  }
}
