import type { PeakSeason, getTransitionBlend } from '../seasons.js';
import type { AssetColors } from './asset-colors.js';

const seasonalRoles = [
  'giwa',
  'thatch',
  'leafLight',
  'bushDark',
  'pine',
  'evergreenLight',
  'evergreenDark',
  'leaf',
  'bush',
  'palm',
  'willow',
  'gardenTree',
  'reeds',
  'ricePaddy',
  'cattail',
  'tallGrass',
  'moss',
  'fern',
  'berryBush',
  'orchard',
  'manorGarden',
] as const satisfies readonly (keyof AssetColors)[];

type SeasonalRole = (typeof seasonalRoles)[number];

function blendHex(from: string, to: string, amount: number): string {
  return (
    '#' +
    [1, 3, 5]
      .map((offset) => {
        const start = Number.parseInt(from.slice(offset, offset + 2), 16);
        const end = Number.parseInt(to.slice(offset, offset + 2), 16);
        return Math.round(start + (end - start) * amount)
          .toString(16)
          .padStart(2, '0');
      })
      .join('')
  );
}

function seasonColor(role: SeasonalRole, season: PeakSeason, base: AssetColors): string {
  const original = base[role];
  if (role === 'giwa' || role === 'thatch') {
    return season === 'winter' ? blendHex(original, base.snowCap, 0.97) : original;
  }
  if (role === 'evergreenLight' || role === 'evergreenDark') {
    if (season === 'autumn' || season === 'summer') return original;
    return season === 'winter'
      ? blendHex(original, base.snowCap, role === 'evergreenLight' ? 1 : 0.45)
      : blendHex(original, base.sproutGreen, 0.25);
  }
  if (role === 'leafLight') {
    if (season === 'winter') return base.snowCap;
    if (season === 'autumn') return base.fallenLeafGold;
  }
  if (role === 'bushDark') {
    if (season === 'winter') return blendHex(original, base.ice, 0.45);
    if (season === 'autumn') return blendHex(base.oakBrown, base.trunk, 0.25);
    if (season === 'spring') return blendHex(original, base.leaf, 0.2);
  }
  const evergreen = role === 'pine' || role === 'palm';
  switch (season) {
    case 'summer':
      return original;
    case 'spring':
      return blendHex(original, base.sproutGreen, evergreen ? 0.25 : 0.75);
    case 'winter':
      return blendHex(original, base.snowCap, evergreen ? 0.45 : 0.82);
    case 'autumn':
      if (evergreen) return original;
      return role === 'leaf' || role === 'gardenTree' || role === 'orchard'
        ? base.mapleOrange
        : blendHex(original, base.oakGold, 0.9);
  }
}

export function seasonalMaterials(
  base: AssetColors,
  transition: ReturnType<typeof getTransitionBlend>,
): AssetColors {
  const colors = { ...base };
  for (const role of seasonalRoles) {
    colors[role] = blendHex(
      seasonColor(role, transition.from, base),
      seasonColor(role, transition.to, base),
      transition.t,
    );
  }
  return colors;
}
