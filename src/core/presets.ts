export const VILLAGE_PRESETS = {
  nature: {
    displayName: 'Nature',
    description: 'Light decoration with more open space',
    density: 2,
  },
  balanced: {
    displayName: 'Balanced',
    description: 'Balanced detail around daily natural features',
    density: 5,
  },
  civilization: {
    displayName: 'Civilization',
    description: 'Richer decoration around the same daily features',
    density: 9,
  },
} as const;

export type VillagePreset = keyof typeof VILLAGE_PRESETS;

export const DEFAULT_VILLAGE_PRESET: VillagePreset = 'balanced';

export function isVillagePreset(value: string): value is VillagePreset {
  return value in VILLAGE_PRESETS;
}
