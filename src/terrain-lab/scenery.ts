import { withMotionContext } from '../core/animation.js';
import { escapeXml } from '../core/svg.js';
import { ASSET_RENDERERS } from '../themes/terrain/assets/renderers.js';
import { ASSET_BOUNDS } from '../themes/terrain/assets/bounds.js';
import type { AssetBounds, AssetType } from '../themes/terrain/assets/types.js';
import { EPIC_RENDERERS } from '../themes/terrain/epics/renderers.js';
import { EPIC_BOUNDS } from '../themes/terrain/epics/bounds.js';
import type { EpicBuildingType } from '../themes/terrain/epics/types.js';
import { getTerrainPalette100 } from '../themes/terrain/palette.js';
import { hash, seededRandom } from '../utils/math.js';
import { depth, number, type DrawItem, type Lighting, type Projection } from './projection.js';
import type { TerrainModel, TerrainPoint, TerrainSite } from './types.js';

interface Box {
  readonly left: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
}
interface Showcase {
  readonly site: TerrainSite;
  readonly type: EpicBuildingType;
  readonly name: string;
}
export interface Scenery {
  readonly items: readonly DrawItem[];
  readonly assetCount: number;
  readonly showcaseCount: number;
}
const distance = (a: TerrainPoint, b: TerrainPoint): number => Math.hypot(a.x - b.x, a.z - b.z);

function assetDepth(site: TerrainPoint, bounds: AssetBounds, scale: number): number {
  const front = (Math.max(0, bounds.y + bounds.height) * scale) / 5.5;
  // Include one mesh cell so the supporting ground cannot cut through the sprite's base.
  return depth(site) + front + 1.2;
}

function showcases(model: TerrainModel): readonly Showcase[] {
  const selected: Showcase[] = [];
  const exhibits = [
    ['worldTree', '세계수'],
    ['pagoda', '파고다'],
    ['colosseum', '콜로세움'],
  ] as const;
  const candidates = model.sites.filter(
    (site) =>
      site.elevation > 0.6 * Math.min(1, model.options.relief) &&
      site.slope < 0.85 &&
      model.coast.every((edge) => distance(site, edge.a) > 3) &&
      model.rivers.every((river) => river.points.every((point) => distance(site, point) > 2)),
  );
  for (const [index, [type, name]] of exhibits.entries()) {
    const center = model.settlements[index];
    const choices = candidates.filter((site) =>
      selected.every((item) => distance(item.site, site) > 10),
    );
    const site = choices.sort((a, b) =>
      center ? distance(a, center) - distance(b, center) : depth(a) - depth(b),
    )[0];
    if (site) selected.push({ site, type, name });
  }
  return selected;
}

function siteAsset(site: TerrainSite, random: number): AssetType {
  switch (site.biome) {
    case 'sand':
      return random < 0.5 ? 'boulder' : 'tallGrass';
    case 'rock':
      return random < 0.65 ? 'alpineRocks' : 'pine';
    case 'snow':
      return random < 0.65 ? 'snowPine' : 'alpineRocks';
    case 'forest':
      return random < 0.42 ? 'pine' : random < 0.7 ? 'cedarGrove' : 'ancientOak';
    case 'meadow':
      return random < 0.28
        ? 'deciduous'
        : random < 0.48
          ? 'birch'
          : random < 0.72
            ? 'wildflowerMeadow'
            : 'tallGrass';
  }
}

export function sceneryItems(
  model: TerrainModel,
  projection: Projection,
  lighting: Lighting,
  density: number,
): Scenery {
  const colors = getTerrainPalette100(lighting === 'day' ? 'light' : 'dark').assets;
  const exhibits = showcases(model);
  const items: DrawItem[] = [];
  const boxes: Box[] = [];
  const nearRiver = (site: TerrainPoint, radius: number): boolean =>
    model.rivers.some((river) => river.points.some((point) => distance(site, point) < radius));
  const available = (site: TerrainSite): boolean =>
    site.elevation > 0.28 &&
    exhibits.every((item) => distance(item.site, site) > 3.4) &&
    !nearRiver(site, 1.25);
  for (const exhibit of exhibits) {
    const point = projection.point(exhibit.site);
    const scale = 3.05 * projection.scale;
    const art = withMotionContext({ mode: 'off', namespace: `lab-${exhibit.type}` }, () =>
      EPIC_RENDERERS[exhibit.type](0, 0, colors),
    );
    boxes.push({
      left: point.x - 28 * projection.scale,
      right: point.x + 28 * projection.scale,
      top: point.y - 57 * projection.scale,
      bottom: point.y + 9 * projection.scale,
    });
    items.push({
      depth: assetDepth(exhibit.site, EPIC_BOUNDS[exhibit.type], 3.05),
      layer: 3,
      markup: `<g data-showcase="${exhibit.type}" transform="translate(${number(point.x)} ${number(point.y)})"><title>${exhibit.name} · 전시용 원더, 획득 보상과 무관</title><ellipse rx="${number(25 * projection.scale)}" ry="${number(10 * projection.scale)}" fill="${lighting === 'day' ? '#c4c58e' : '#596745'}"/><g transform="scale(${number(scale)})">${art}</g></g>`,
    });
  }
  let assetCount = 0;
  const add = (site: TerrainSite, type: AssetType, key: string, scale: number): void => {
    const p = projection.point(site),
      bounds = ASSET_BOUNDS[type];
    const factor = scale * projection.scale;
    const box = {
      left: p.x + bounds.x * factor,
      right: p.x + (bounds.x + bounds.width) * factor,
      top: p.y + bounds.y * factor,
      bottom: p.y + (bounds.y + bounds.height) * factor,
    };
    if (
      boxes.some(
        (other) =>
          box.left < other.right + 1 &&
          box.right > other.left - 1 &&
          box.top < other.bottom + 1 &&
          box.bottom > other.top - 1,
      )
    )
      return;
    boxes.push(box);
    const art = withMotionContext({ mode: 'off', namespace: `lab-${key}` }, () =>
      ASSET_RENDERERS[type](0, 0, colors, hash(key) % 3),
    );
    items.push({
      depth: assetDepth(site, bounds, scale),
      layer: 3,
      markup: `<g data-scenery="${escapeXml(type)}" transform="translate(${number(p.x)} ${number(p.y)}) scale(${number(factor)})">${art}</g>`,
    });
    assetCount++;
  };
  const plots = [...model.plots].sort((a, b) => b.count - a.count || a.date.localeCompare(b.date));
  for (const plot of plots) {
    if (plot.count === 0 || !available(plot.position)) continue;
    const random = seededRandom(hash(plot.date))();
    const town = model.settlements.findIndex((center) => distance(center, plot.position) < 7.8);
    const built = town >= 0 && plot.position.slope < 0.6 && plot.count >= 5;
    const village: readonly AssetType[] =
      town === 1
        ? ['hanok', 'choga', 'pavilion', 'riceTerrace']
        : ['house', 'houseB', 'barn', 'windmill'];
    const type = built
      ? village[hash(plot.date) % village.length]
      : siteAsset(plot.position, random);
    if (!built && random > density * 0.74 + 0.17) continue;
    add(plot.position, type, plot.date, built ? 2.05 : 1.65 + random * 0.38);
  }
  const random = seededRandom(model.options.seed + 551);
  for (const site of model.sites) {
    const chance = random();
    if (
      chance > density * (site.biome === 'forest' ? 0.36 : 0.075) ||
      !available(site) ||
      site.slope > 1.5
    )
      continue;
    if (model.settlements.some((center) => distance(center, site) < 6)) continue;
    add(
      site,
      siteAsset(site, random()),
      `nature-${number(site.x)}-${number(site.z)}`,
      1.35 + random() * 0.6,
    );
  }
  return { items, assetCount, showcaseCount: exhibits.length };
}
