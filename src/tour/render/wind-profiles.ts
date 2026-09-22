export const WIND_PROFILES = {
  tree: { strength: 0.045, bend: 1.6, flutter: 0.004, height: 6 },
  shrub: { strength: 0.105, bend: 0.65, flutter: 0.014, height: 2 },
  reed: { strength: 0.11, bend: 0.3, flutter: 0.012, height: 2.7 },
  flower: { strength: 0.1, bend: 0.2, flutter: 0.01, height: 2.2 },
  grass: { strength: 0.2, bend: 0.11, flutter: 0.012, height: 0.75 },
} as const;

export type WindProfile = keyof typeof WIND_PROFILES;
export type WindSettings = (typeof WIND_PROFILES)[WindProfile];

export function windInfluence(height: number, settings: WindSettings): number {
  const h = Math.min(settings.height, Math.max(0, height - 0.015));
  return (h * h) / (h + settings.bend);
}

export function windMargin(settings: WindSettings): number {
  const x = settings.strength * 1.15 + settings.flutter;
  const z = settings.strength * (1.15 * 0.33 + 0.15) + settings.flutter * 0.4;
  return windInfluence(settings.height + 0.015, settings) * Math.hypot(x, z);
}
