import { contains, requireWorld, uniqueIds } from './references-space.js';
import type { WorldScene } from './types.js';

export function validateEntities(scene: WorldScene): void {
  const entities = uniqueIds(scene.entities, 'entity');
  const regions = new Map(scene.regions.map((region) => [region.id, region]));
  const recipes = new Set(scene.modelRecipes.map((recipe) => recipe.key));
  requireWorld(recipes.size === scene.modelRecipes.length, 'Duplicate model recipe key');
  const days = new Map(scene.days.map((day) => [day.date, day]));
  const resolvedParents = new Set<string>();
  for (const entity of entities.values()) {
    requireWorld(
      regions.get(entity.regionId)?.islandId === entity.islandId && recipes.has(entity.modelKey),
      `Invalid region/model reference on ${entity.id}`,
    );
    requireWorld(
      contains(scene.bounds, entity.position),
      `Entity outside world bounds: ${entity.id}`,
    );
    if (entity.date !== undefined) {
      const day = days.get(entity.date);
      requireWorld(
        day?.kind === 'observed' && day.count > 0 && entity.visibleFrom === entity.date,
        `Dated entity has no active observation: ${entity.id}`,
      );
    }
    if (entity.parentId !== undefined) {
      const parent = entities.get(entity.parentId);
      requireWorld(
        parent !== undefined &&
          parent.islandId === entity.islandId &&
          parent.visibleFrom <= entity.visibleFrom,
        `Invalid parent for ${entity.id}`,
      );
    }
    if (['courtyard', 'pier', 'stair'].includes(entity.kind))
      requireWorld(entity.parentId !== undefined, `Attachment ${entity.id} requires a parent`);
    if (entity.kind === 'asset')
      requireWorld(entity.date !== undefined, `Daily asset ${entity.id} requires a source date`);
    if (entity.kind === 'repository' || entity.kind === 'release')
      requireWorld(
        entity.repoId !== undefined && entity.label !== undefined,
        `Public project ${entity.id} requires its actual identity and label`,
      );
    if (entity.kind === 'release')
      requireWorld(entity.releaseId !== undefined, `Release ${entity.id} requires its identity`);
    const chain = new Set<string>([entity.id]);
    let next = entity.parentId;
    while (next !== undefined && !resolvedParents.has(next)) {
      requireWorld(!chain.has(next), `Cyclic entity parent chain: ${entity.id}`);
      chain.add(next);
      next = entities.get(next)?.parentId;
    }
    for (const id of chain) resolvedParents.add(id);
  }
  uniqueIds(scene.discoveries, 'discovery');
  for (const discovery of scene.discoveries) {
    const entity = entities.get(discovery.entityId);
    requireWorld(
      entity !== undefined &&
        discovery.availableFrom >= entity.visibleFrom &&
        (discovery.catalogId === undefined || discovery.catalogId === entity.catalogId),
      `Invalid discovery reference/date: ${discovery.id}`,
    );
  }
  uniqueIds(scene.events, 'event');
  for (const event of scene.events) {
    const anchor = entities.get(event.anchorId);
    requireWorld(
      anchor !== undefined &&
        event.startsOn === anchor.visibleFrom &&
        (event.endsOn === undefined || event.endsOn >= event.startsOn),
      `Invalid event anchor/date: ${event.id}`,
    );
    switch (event.evidence.kind) {
      case 'consistency': {
        const day = days.get(event.startsOn);
        requireWorld(
          anchor.kind === 'festival' &&
            day?.kind === 'observed' &&
            day.consistency.tier > 0 &&
            event.evidence.activeDays === day.consistency.activeDays &&
            event.evidence.observedDays === day.consistency.observedDays,
          `Invalid festival evidence: ${event.id}`,
        );
        break;
      }
      case 'contributions': {
        const total = scene.days.reduce(
          (sum, day) =>
            sum + (day.date <= event.startsOn && day.kind === 'observed' ? day.count : 0),
          0,
        );
        requireWorld(
          anchor.kind === 'wonder' &&
            event.evidence.total !== undefined &&
            event.evidence.total > 0 &&
            event.evidence.total <= total,
          `Invalid milestone evidence: ${event.id}`,
        );
        break;
      }
      case 'release':
        requireWorld(
          anchor.kind === 'release' &&
            event.evidence.repoId === anchor.repoId &&
            event.evidence.releaseId === anchor.releaseId,
          `Invalid release evidence: ${event.id}`,
        );
        break;
    }
  }
}
