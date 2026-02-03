import type { ColorMode } from '../../core/types.js';
import { svgFilter, svgGradient } from '../../core/svg.js';

/**
 * SVG filter for nebula glow effect on contribution cells.
 * Dark mode uses a wider blur (stdDeviation 4) for a diffuse cosmic glow;
 * light mode uses a tighter blur (stdDeviation 3) to keep contrast.
 * @param mode - Color mode (dark or light)
 * @returns SVG filter element string with id="nebula-glow"
 */
export function nebulaGlowFilter(mode: ColorMode): string {
  const deviation = mode === 'dark' ? '4' : '3';
  const primitives = [
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${deviation}" result="blur"/>`,
    `<feComposite in="blur" in2="SourceGraphic" operator="over"/>`,
  ].join('');

  return svgFilter('nebula-glow', primitives);
}

/**
 * SVG filter for star particle glow.
 * A subtle, fixed-radius glow that makes tiny star dots feel luminous.
 * @returns SVG filter element string with id="star-glow"
 */
export function starGlowFilter(): string {
  const primitives = [
    `<feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur"/>`,
    `<feComposite in="blur" in2="SourceGraphic" operator="over"/>`,
  ].join('');

  return svgFilter('star-glow', primitives);
}

/**
 * Radial gradient definitions for nebula contribution levels L1–L4.
 * L0 is too dim to warrant a glow gradient.
 *
 * Each gradient fades from a bright center through mid and edge colors
 * to full transparency, creating the nebula cloud look.
 *
 * @param mode - Color mode (dark or light)
 * @returns Concatenated SVG radialGradient element strings
 */
export function nebulaGradients(mode: ColorMode): string {
  const palettes: Record<
    ColorMode,
    Array<{ id: string; center: string; mid: string; edge: string }>
  > = {
    dark: [
      { id: 'nebula-l1', center: '#A78BFA', mid: '#7C3AED', edge: '#5B21B6' },
      { id: 'nebula-l2', center: '#C4B5FD', mid: '#A78BFA', edge: '#7C3AED' },
      { id: 'nebula-l3', center: '#7DD3FC', mid: '#A78BFA', edge: '#7C3AED' },
      { id: 'nebula-l4', center: '#F0E6FF', mid: '#7DD3FC', edge: '#A78BFA' },
    ],
    light: [
      { id: 'nebula-l1', center: '#C4B5FD', mid: '#A78BFA', edge: '#7C3AED' },
      { id: 'nebula-l2', center: '#A78BFA', mid: '#7C3AED', edge: '#5B21B6' },
      { id: 'nebula-l3', center: '#7C3AED', mid: '#A78BFA', edge: '#C4B5FD' },
      { id: 'nebula-l4', center: '#5B21B6', mid: '#7C3AED', edge: '#A78BFA' },
    ],
  };

  return palettes[mode]
    .map((g) =>
      svgGradient('radial', g.id, [
        { offset: '0%', color: g.center, opacity: 1 },
        { offset: '40%', color: g.mid, opacity: 0.8 },
        { offset: '70%', color: g.edge, opacity: 0.4 },
        { offset: '100%', color: g.edge, opacity: 0 },
      ]),
    )
    .join('');
}

/**
 * SVG blend filter for overlapping nebula cells.
 * Dark mode uses "screen" so bright areas add together;
 * light mode uses "multiply" so dark areas stack.
 * @param mode - Color mode (dark or light)
 * @returns SVG filter element string with id="nebula-blend"
 */
export function nebulaBlendFilter(mode: ColorMode): string {
  const blendMode = mode === 'dark' ? 'screen' : 'multiply';
  const primitives = `<feBlend mode="${blendMode}" in="SourceGraphic" in2="BackgroundImage"/>`;

  return svgFilter('nebula-blend', primitives);
}

/**
 * Convenience function that returns all nebula SVG filter and gradient
 * definitions concatenated into a single string, ready to be wrapped in `<defs>`.
 * @param mode - Color mode (dark or light)
 * @returns All nebula filter + gradient SVG definitions
 */
export function allNebulaFilters(mode: ColorMode): string {
  return [
    nebulaGlowFilter(mode),
    starGlowFilter(),
    nebulaGradients(mode),
    nebulaBlendFilter(mode),
  ].join('');
}
