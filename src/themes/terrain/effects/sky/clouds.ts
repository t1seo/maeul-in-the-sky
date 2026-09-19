import { motionId } from '../../../../core/animation.js';
import { hexToRgb, lerpColor } from '../../../../utils/color.js';
import type { TerrainPalette100 } from '../../palette.js';
import { CLOUD_SHAPES } from './cloud-shapes.js';

export function cloudPaint(palette: TerrainPalette100): string {
  const { r, g, b } = hexToRgb(palette.bg.subtle);
  const dark = r * 0.2126 + g * 0.7152 + b * 0.0722 < 128;
  const top = dark ? '#8198ae' : '#fffef8';
  const middle = dark ? '#4e657d' : '#e5edf2';
  const bottom = dark ? '#293d53' : '#a9bfce';
  const rim = dark ? '#b8cedb' : '#ffffff';
  return (
    `<defs><linearGradient id="${motionId('sky-cloud-volume')}" x1="30%" y1="0%" x2="60%" y2="100%">` +
    `<stop stop-color="${lerpColor(top, palette.bg.subtle, 0.08)}"/>` +
    `<stop offset=".48" stop-color="${middle}"/><stop offset="1" stop-color="${bottom}"/>` +
    `</linearGradient><linearGradient id="${motionId('sky-cloud-shade')}" x2="0" y2="1">` +
    `<stop stop-color="${bottom}" stop-opacity="0"/><stop offset="1" stop-color="${bottom}" stop-opacity=".65"/>` +
    `</linearGradient><linearGradient id="${motionId('sky-cloud-rim')}" x2="0" y2="1">` +
    `<stop stop-color="${rim}" stop-opacity=".8"/><stop offset="1" stop-color="${rim}" stop-opacity=".08"/>` +
    `</linearGradient></defs>`
  );
}

export function cloudVolume(x: number, y: number, scale: number, variant: number): string {
  const shape = CLOUD_SHAPES[variant % CLOUD_SHAPES.length];
  return (
    `<g class="cloud-volume" transform="translate(${x.toFixed(2)} ${y.toFixed(2)}) scale(${scale.toFixed(3)})">` +
    `<path class="cloud-body" d="${shape.body}" fill="url(#${motionId('sky-cloud-volume')})"/>` +
    `<path d="${shape.shade}" fill="url(#${motionId('sky-cloud-shade')})"/>` +
    `<path d="${shape.folds}" fill="none" stroke="url(#${motionId('sky-cloud-rim')})" stroke-width=".65" opacity=".4" stroke-linecap="round"/>` +
    `<path d="${shape.rim}" fill="none" stroke="url(#${motionId('sky-cloud-rim')})" stroke-width=".7" stroke-linecap="round"/>` +
    `</g>`
  );
}
