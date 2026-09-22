import type { TourModel } from '../types.js';
import { element, formatDate } from './dom.js';

const SEASONS = { spring: 'Spring', summer: 'Summer', autumn: 'Autumn', winter: 'Winter' } as const;
const ICONS = { spring: '✿', summer: '☀', autumn: '❧', winter: '❄' } as const;

export function presentVillage(model: TourModel, source: string | null): void {
  element('owner').textContent = `@${model.scene.username}'s`;
  element('source-tag').textContent = source
    ? 'Your original Calendar village'
    : 'SAMPLE · A village from example history';
  element('date-range').textContent =
    `${formatDate(model.scene.fromDate)} — ${formatDate(model.scene.toDate)}`;
  const stats = element('village-stats');
  stats.replaceChildren();
  for (const [value, label] of [
    [model.scene.stats.total, 'contributions'],
    [model.scene.stats.activeDays, 'active days'],
    [model.scene.wonders.length, 'wonders'],
  ] as const) {
    const wrapper = document.createElement('div');
    const count = document.createElement('strong');
    count.textContent = value.toLocaleString('en-US');
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
    button.setAttribute('aria-label', `Visit ${SEASONS[stop.id]}`);
    const icon = document.createElement('span');
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = ICONS[stop.id];
    button.append(icon, SEASONS[stop.id]);
    stops.append(button);
  }
}

export function presentPlace(model: TourModel, stopIndex: number): void {
  const stop = model.stops[stopIndex];
  if (!stop) return;
  element('place-label').textContent = stop.label;
  element('place-date').textContent = formatDate(stop.date);
}
