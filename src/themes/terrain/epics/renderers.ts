import type { AssetColors } from '../palette.js';
import type { EpicBuildingType } from './types.js';
import * as rareLandscapes from './renderers/rare-landscapes.js';
import * as rareLandmarks from './renderers/rare-landmarks.js';
import * as epicLandscapes from './renderers/epic-landscapes.js';
import * as epicLandmarks from './renderers/epic-landmarks.js';
import * as legendary from './renderers/legendary.js';

export const EPIC_RENDERERS: Record<
  EpicBuildingType,
  (x: number, y: number, colors: AssetColors) => string
> = {
  mountFuji: rareLandscapes.renderMountFuji,
  giantSequoia: rareLandscapes.renderGiantSequoia,
  coralReef: rareLandscapes.renderCoralReef,
  geyser: rareLandscapes.renderGeyser,
  hotSpring: rareLandscapes.renderHotSpring,
  grandCanyon: rareLandscapes.renderGrandCanyon,
  oasis: rareLandscapes.renderOasis,
  volcano: rareLandmarks.renderVolcano,
  giantMushroom: rareLandmarks.renderGiantMushroom,
  colosseum: rareLandmarks.renderColosseum,
  pagoda: rareLandmarks.renderPagoda,
  torii: rareLandmarks.renderTorii,
  eiffelTower: rareLandmarks.renderEiffelTower,
  windmillGrand: rareLandmarks.renderWindmillGrand,
  aurora: epicLandscapes.renderAurora,
  giantWaterfall: epicLandscapes.renderGiantWaterfall,
  bambooGrove: epicLandscapes.renderBambooGrove,
  glacierPeak: epicLandscapes.renderGlacierPeak,
  bioluminescentPool: epicLandscapes.renderBioluminescentPool,
  meteorCrater: epicLandscapes.renderMeteorCrater,
  bonsaiGiant: epicLandmarks.renderBonsaiGiant,
  tajMahal: epicLandmarks.renderTajMahal,
  stBasils: epicLandmarks.renderStBasils,
  operaHouse: epicLandmarks.renderOperaHouse,
  floatingIsland: legendary.renderFloatingIsland,
  crystalSpire: legendary.renderCrystalSpire,
  dragonNest: legendary.renderDragonNest,
  worldTree: legendary.renderWorldTree,
  sakuraEternal: legendary.renderSakuraEternal,
  ancientPortal: legendary.renderAncientPortal,
};
