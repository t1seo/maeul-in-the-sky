export const WILDLIFE = {
  squirrel: { height: 0.46 },
  cow: { height: 1.65 },
  deer: { height: 1.75 },
  fox: { height: 0.72 },
  horse: { height: 1.9 },
  donkey: { height: 1.6 },
  sheep: { height: 1.05 },
  pig: { height: 0.8 },
  rabbit: { height: 0.48 },
  goat: { height: 1.15 },
  bird: { height: 0.29 },
  chicken: { height: 0.72 },
  owl: { height: 0.62 },
  seagull: { height: 0.48 },
  heron: { height: 1.35 },
  whale: { height: 0.72 },
  frog: { height: 0.22 },
  shellfish: { height: 0.18 },
  fish: { height: 0.22 },
  turtle: { height: 0.38 },
  crab: { height: 0.16 },
  jellyfish: { height: 0.68 },
  butterfly: { height: 0.2 },
  spider: { height: 0.12 },
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
    case 'rabbit':
    case 'goat':
    case 'bird':
    case 'chicken':
    case 'owl':
    case 'seagull':
    case 'heron':
    case 'whale':
    case 'frog':
    case 'shellfish':
    case 'fish':
    case 'turtle':
    case 'crab':
    case 'jellyfish':
    case 'butterfly':
    case 'spider':
      return catalogId;
    case 'winterBird':
      return 'bird';
    case 'fishSchool':
      return 'fish';
    case 'butterflyGarden':
      return 'butterfly';
    case 'pigpen':
      return 'pig';
    case 'lamb':
      return 'sheep';
    default:
      return null;
  }
}
