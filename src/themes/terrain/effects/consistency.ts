import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { ConsistencyEffectKind, SceneConsistencyEffect } from '../../../core/scene-types.js';
import { escapeXml, svgNumber, svgStyle } from '../../../core/svg.js';
import type { ColorMode } from '../../../core/types.js';
import {
  CONSISTENCY_DRIFT,
  CONSISTENCY_GLYPHS,
  CONSISTENCY_STROKE,
} from './consistency-geometry.js';

const COLORS = {
  springPetals: { dark: ['#f3a9c1', '#fff0f5'], light: ['#d77b9a', '#8f4469'] },
  summerFireflies: { dark: ['#a7b951', '#fff1a3'], light: ['#91a644', '#f8eb97'] },
  autumnLeaves: { dark: ['#ddad5c', '#8f542f'], light: ['#bc7940', '#794b31'] },
  winterFrost: { dark: ['#ddebf0', '#b8d6e2'], light: ['#dcebf0', '#639ab0'] },
} as const satisfies Record<ConsistencyEffectKind, Record<ColorMode, readonly [string, string]>>;

export function renderConsistencyEffects(
  effects: readonly SceneConsistencyEffect[],
  mode: ColorMode,
): string {
  if (effects.length === 0) return '';
  const animated = currentMotionContext().mode === 'full';
  const animation = motionId('consistency-drift');
  const css = animated
    ? svgStyle(
        `@keyframes ${animation} { 0%,100% { transform: translate(0,0); opacity: 0.9; } 50% { transform: translate(${CONSISTENCY_DRIFT.x}px,-${CONSISTENCY_DRIFT.y}px); opacity: 0.65; } }` +
          effects
            .map(
              (effect, index) =>
                `.${motionId(effect.id)} { animation: ${animation} ${12 + (index % 5)}s ease-in-out -${index}s infinite; }`,
            )
            .join(''),
      )
    : '';
  const groups = effects
    .map((effect) => {
      const glyph = CONSISTENCY_GLYPHS[effect.kind];
      const [body, detail] = COLORS[effect.kind][mode];
      const particles = effect.particles
        .map(
          (particle) =>
            `<g transform="translate(${svgNumber(particle.x)} ${svgNumber(particle.y)}) scale(${svgNumber(particle.size)})">` +
            `<path d="${glyph.body}" fill="${body}"${effect.kind === 'summerFireflies' ? ' opacity="0.45"' : ''}/>` +
            `<path d="${glyph.detail}" fill="${effect.kind === 'summerFireflies' ? detail : 'none'}" stroke="${detail}" stroke-width="${CONSISTENCY_STROKE}" stroke-linecap="round" stroke-linejoin="round"/></g>`,
        )
        .join('');
      const motion = animated
        ? ` class="${motionId(effect.id)}" data-consistency-motion="true"`
        : '';
      return `<g data-consistency-id="${escapeXml(effect.id)}" data-anchor-date="${escapeXml(effect.anchorDate)}" data-consistency-kind="${effect.kind}" data-consistency-tier="${effect.tier}" data-consistency-active-days="${effect.activeDays}" transform="translate(${svgNumber(effect.cx)} ${svgNumber(effect.cy)})"><g${motion}>${particles}</g></g>`;
    })
    .join('');
  return `<g class="consistency-effects" aria-hidden="true">${css}${groups}</g>`;
}
