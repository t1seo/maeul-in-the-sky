export const VILLAGE_PRESETS = {
  nature: {
    displayName: 'Nature',
    description: 'Fewer buildings, with more forests and open terrain',
    density: 2,
  },
  balanced: {
    displayName: 'Balanced',
    description: 'A mix of nature, farms, villages, and cities',
    density: 5,
  },
  civilization: {
    displayName: 'Civilization',
    description: 'More buildings across everyday contribution levels',
    density: 9,
  },
} as const;

export type VillagePreset = keyof typeof VILLAGE_PRESETS;

export const DEFAULT_VILLAGE_PRESET: VillagePreset = 'balanced';

export function isVillagePreset(value: string): value is VillagePreset {
  return value in VILLAGE_PRESETS;
}
