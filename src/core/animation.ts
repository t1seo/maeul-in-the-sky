import type { MotionMode } from './render-options.js';
import type { SmilAnimation, SmilTransformAnimation, CssAnimation } from './types.js';

export interface MotionContext {
  readonly mode: MotionMode;
  readonly namespace: string;
}

const DEFAULT_MOTION: MotionContext = { mode: 'full', namespace: '' };
// SVG renderers are synchronous; nested scopes restore their caller even on failure.
let currentContext = DEFAULT_MOTION;

export function currentMotionContext(): MotionContext {
  return currentContext;
}

export function withMotionContext(context: MotionContext, render: () => string): string {
  const previous = currentContext;
  currentContext = context;
  try {
    return render();
  } finally {
    currentContext = previous;
  }
}

/** Gate only a known animation fragment at its creation site, retaining its base shape. */
export function motionMarkup(fragment: string): string {
  return currentContext.mode === 'full' ? fragment : '';
}

/** Encode identifiers at definition and reference sites without rewriting SVG text. */
export function motionId(localId: string): string {
  if (!currentContext.namespace) return localId;
  const encode = (value: string): string =>
    Array.from(value, (character) =>
      /^[A-Za-z0-9-]$/.test(character) ? character : `_${character.codePointAt(0)?.toString(16)}_`,
    ).join('');
  return `m-${encode(currentContext.namespace)}--${encode(localId)}`;
}

/**
 * Generate a SMIL `<animate>` element string.
 * Primary animation strategy — SMIL is preferred over CSS for SVG attribute animation.
 * @param animation - SMIL animation configuration
 * @returns `<animate>` element string
 */
export function smilAnimate(animation: SmilAnimation): string {
  if (currentContext.mode !== 'full') return '';
  const { attributeName, values, dur, repeatCount, begin, fill = 'freeze' } = animation;

  const attrs: string[] = [
    `attributeName="${attributeName}"`,
    `values="${values.join(';')}"`,
    `dur="${dur}"`,
    `repeatCount="${repeatCount}"`,
    `fill="${fill}"`,
  ];

  if (begin !== undefined) {
    attrs.push(`begin="${begin}"`);
  }

  return `<animate ${attrs.join(' ')}/>`;
}

/**
 * Generate a SMIL `<animateTransform>` element string.
 * Used for transform-based animations (rotate, scale, translate).
 * @param animation - SMIL transform animation configuration
 * @returns `<animateTransform>` element string
 */
export function smilAnimateTransform(animation: SmilTransformAnimation): string {
  if (currentContext.mode !== 'full') return '';
  const { type, values, dur, repeatCount, begin } = animation;

  const attrs: string[] = [
    `attributeName="transform"`,
    `type="${type}"`,
    `values="${values.join(';')}"`,
    `dur="${dur}"`,
    `repeatCount="${repeatCount}"`,
  ];

  if (begin !== undefined) {
    attrs.push(`begin="${begin}"`);
  }

  return `<animateTransform ${attrs.join(' ')}/>`;
}

/**
 * Generate CSS `@keyframes` and animation rule.
 * Fallback for properties that SMIL can't handle (e.g., stroke-dashoffset).
 * @param animation - CSS animation configuration
 * @returns CSS string containing @keyframes block and class rule
 */
export function cssKeyframes(animation: CssAnimation): string {
  if (currentContext.mode !== 'full') return '';
  const {
    name,
    keyframes,
    duration,
    easing,
    iterationCount,
    fillMode = 'forwards',
    delay,
  } = animation;

  const keyframeEntries = Object.entries(keyframes)
    .map(([stop, properties]) => {
      const declarations = Object.entries(properties)
        .map(([prop, val]) => `${prop}: ${val};`)
        .join(' ');
      return `${stop} { ${declarations} }`;
    })
    .join(' ');

  const keyframesBlock = `@keyframes ${name} { ${keyframeEntries} }`;

  let animationRule = `.${name} { animation: ${name} ${duration} ${easing} ${iterationCount} ${fillMode};`;
  if (delay !== undefined) {
    animationRule += ` animation-delay: ${delay};`;
  }
  animationRule += ' }';

  return `${keyframesBlock}\n${animationRule}`;
}

/**
 * Compute a staggered begin/delay time for sequenced animations.
 * Distributes elements evenly across the given duration based on index/total ratio.
 * @param index - Current element index (0-based)
 * @param total - Total number of elements
 * @param duration - Total stagger window (e.g., "2s", "1500ms")
 * @returns Delay string in seconds (e.g., "0.5s")
 */
export function staggerDelay(index: number, total: number, duration: string): string {
  const match = duration.match(/^([\d.]+)(ms|s)$/);
  if (!match) {
    return '0s';
  }

  const value = parseFloat(match[1]);
  const unit = match[2];
  const durationMs = unit === 's' ? value * 1000 : value;

  const delayMs = total > 1 ? (index / (total - 1)) * durationMs : 0;
  const delaySec = parseFloat((delayMs / 1000).toFixed(3));

  return `${delaySec}s`;
}
