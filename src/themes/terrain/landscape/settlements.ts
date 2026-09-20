import type { TerrainScene } from '../../../core/scene-types.js';
import { planLandscapeFields } from './fields.js';
import { placeLandscapeFacts } from './parcels.js';
import { planLandscapeRoads } from './roads.js';
import { landscapeScenery } from './scenery.js';
import { groundPolygon } from './settlement-geometry.js';
import type { LandscapeModel, LandscapeSettlementPlan, LandscapeTown } from './types.js';

function towns(model: LandscapeModel, scene: TerrainScene): readonly LandscapeTown[] {
  if (!scene.cells.some((cell) => cell.count > 0)) return [];
  return model.settlements.map((center, index) => {
    const radius = index === 0 ? 1.65 : 1.35;
    const offsets = Array.from({ length: 8 }, (_, side): readonly [number, number] => {
      const angle = (side * Math.PI) / 4;
      return [Math.cos(angle) * radius, Math.sin(angle) * radius];
    });
    return { id: `town:${index}`, center, plaza: groundPolygon(model, center, offsets) };
  });
}

export function planLandscapeSettlements(
  model: LandscapeModel,
  scene: TerrainScene,
): LandscapeSettlementPlan {
  const settlements = towns(model, scene);
  const facts = placeLandscapeFacts(model, scene, settlements);
  const fields = planLandscapeFields(model, settlements, facts, scene.settings.style);
  const roads = planLandscapeRoads(model, settlements);
  return {
    towns: settlements,
    roads,
    fields,
    sprites: [...facts, ...landscapeScenery(model, scene, settlements, fields, facts, roads)],
  };
}
