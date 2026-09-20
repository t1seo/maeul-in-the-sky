import { motionId } from '../../../core/animation.js';
import type { TerrainScene } from '../../../core/scene-types.js';
import { escapeXml, formatNumber } from '../../../core/svg.js';
import type { LandscapePalette } from './palette.js';

export function landscapeBackdrop(width: number, palette: LandscapePalette): string {
  const sky = motionId('landscape-sky'),
    glow = motionId('landscape-glow');
  return `<defs><linearGradient id="${sky}" x2="0" y2="1"><stop stop-color="${palette.sky[0]}"/><stop offset="1" stop-color="${palette.sky[1]}"/></linearGradient><radialGradient id="${glow}"><stop stop-color="${palette.foam}" stop-opacity=".28"/><stop offset="1" stop-color="${palette.foam}" stop-opacity="0"/></radialGradient></defs><rect width="${width}" height="840" rx="14" fill="url(#${sky})"/><ellipse cx="${width / 2}" cy="445" rx="${width * 0.49}" ry="310" fill="url(#${glow})"/><rect x="15" y="15" width="${width - 30}" height="810" rx="8" fill="none" stroke="${palette.rule}" stroke-width=".65" opacity=".5"/>`;
}

export function landscapePresentation(
  scene: TerrainScene,
  palette: LandscapePalette,
  width: number,
): string {
  const card = scene.settings.layout === 'card';
  const margin = card ? 40 : 54;
  const title = escapeXml(scene.settings.title);
  const period = scene.fromDate
    ? `${scene.fromDate} — ${scene.toDate}`
    : 'No supplied contribution dates';
  const heading = `<text x="${margin}" y="63" fill="${palette.accent}" font-size="11" letter-spacing="3.5">MAEUL IN THE SKY</text><text x="${margin}" y="103" fill="${palette.text}" font-family="Georgia,serif" font-size="29">${title}</text><text x="${width - margin}" y="66" text-anchor="end" fill="${palette.muted}" font-size="11">${escapeXml(period)}</text>`;
  const stats = [
    { value: formatNumber(scene.stats.total), label: 'CONTRIBUTIONS' },
    { value: formatNumber(scene.stats.activeDays), label: 'ACTIVE DAYS' },
    { value: formatNumber(scene.wonders.length), label: 'WONDERS DISCOVERED' },
  ];
  const footer = stats
    .map((stat, index) => {
      const x = margin + index * (card ? 233 : 210);
      return `<text x="${x}" y="${card ? 726 : 765}" fill="${palette.text}" font-family="Georgia,serif" font-size="29">${stat.value}</text><text x="${x}" y="${card ? 747 : 786}" fill="${palette.muted}" font-size="9" letter-spacing="1.5">${stat.label}</text>`;
    })
    .join('');
  const note = card
    ? `<text x="${margin}" y="789" fill="${palette.muted}" font-size="10">Height describes geography · dated assets reflect contributions</text>`
    : `<text x="${width - margin}" y="762" text-anchor="end" fill="${palette.muted}" font-size="10">Height describes geography</text><text x="${width - margin}" y="781" text-anchor="end" fill="${palette.muted}" font-size="10">Dated assets reflect contributions</text>`;
  return `<g class="landscape-presentation" font-family="ui-sans-serif,system-ui,sans-serif">${heading}<path d="M${margin},${card ? 689 : 725}H${width - margin}" stroke="${palette.rule}" stroke-width=".7"/>${footer}${note}</g>`;
}
