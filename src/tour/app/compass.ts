import { element } from './dom.js';

const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;

export function compassBearing(heading: number) {
  const degrees = ((((-heading * 180) / Math.PI) % 360) + 360) % 360;
  return {
    degrees,
    label: `${DIRECTIONS[Math.round(degrees / 45) % 8]} · ${Math.round(degrees) % 360}°`,
  };
}

export function refreshCompass(heading: number): void {
  const bearing = compassBearing(heading);
  element('compass-needle').style.transform = `rotate(${-heading}rad)`;
  element('compass-bearing').textContent = bearing.label;
  element('compass').setAttribute('aria-label', `Facing ${bearing.label}. North is up on the map.`);
}
