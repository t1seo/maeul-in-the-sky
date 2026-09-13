export type EpicTier = 'rare' | 'epic' | 'legendary';

export type EpicBuildingType =
  // Rare — 7 natural + 7 landmark (14)
  | 'mountFuji'
  | 'colosseum'
  | 'giantSequoia'
  | 'coralReef'
  | 'pagoda'
  | 'torii'
  | 'geyser'
  | 'hotSpring'
  | 'eiffelTower'
  | 'grandCanyon'
  | 'windmillGrand'
  | 'oasis'
  | 'volcano'
  | 'giantMushroom'
  // Epic — 7 natural + 3 landmark (10)
  | 'aurora'
  | 'tajMahal'
  | 'giantWaterfall'
  | 'stBasils'
  | 'bambooGrove'
  | 'operaHouse'
  | 'glacierPeak'
  | 'bioluminescentPool'
  | 'meteorCrater'
  | 'bonsaiGiant'
  // Legendary — 5 natural + 1 structure (6)
  | 'floatingIsland'
  | 'crystalSpire'
  | 'dragonNest'
  | 'worldTree'
  | 'sakuraEternal'
  | 'ancientPortal';

export interface PlacedEpicBuilding {
  readonly id?: string;
  readonly date?: string;
  readonly catalogId?: EpicBuildingType;
  type: EpicBuildingType;
  tier: EpicTier;
  week: number;
  day: number;
  cx: number;
  cy: number;
}
