export const WILDLIFE = {
  squirrel: { height: 0.46 },
  cow: { height: 1.65 },
  deer: { height: 1.75 },
  fox: { height: 0.72 },
  horse: { height: 1.9 },
  donkey: { height: 1.6 },
  sheep: { height: 1.05 },
  pig: { height: 0.8 },
} as const;

export type WildlifeSpecies = keyof typeof WILDLIFE;

export function wildlifeSpecies(catalogId: string): WildlifeSpecies | null {
  switch (catalogId) {
    case 'squirrel':
    case 'cow':
    case 'deer':
    case 'fox':
    case 'horse':
    case 'donkey':
    case 'sheep':
    case 'pig':
      return catalogId;
    case 'pigpen':
      return 'pig';
    case 'lamb':
      return 'sheep';
    default:
      return null;
  }
}
