import { applyTint, type SeasonalTint, type getTransitionBlend } from '../seasons.js';
import type { RGB } from './anchors.js';

export function seasonalGround(
  rgb: RGB,
  tint: SeasonalTint,
  transition: ReturnType<typeof getTransitionBlend>,
): RGB {
  const tinted = applyTint(...rgb, tint);
  const winter =
    (transition.from === 'winter' ? 1 - transition.t : 0) +
    (transition.to === 'winter' ? transition.t : 0);
  const snow: RGB = [
    rgb[0] * 0.18 + 222 * 0.82,
    rgb[1] * 0.18 + 238 * 0.82,
    rgb[2] * 0.18 + 252 * 0.82,
  ];
  return [
    Math.round(tinted[0] + (snow[0] - tinted[0]) * winter),
    Math.round(tinted[1] + (snow[1] - tinted[1]) * winter),
    Math.round(tinted[2] + (snow[2] - tinted[2]) * winter),
  ];
}
