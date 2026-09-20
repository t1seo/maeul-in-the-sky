const WINDMILLS = new Set(['windmill', 'windmillGrand', 'koreanWatermill']);
const ANIMATED_CLASS =
  /\sclass="[^"]*\b(?:epic-glow-pulse|epic-portal-swirl|sway-gentle|sway-slow)\b[^"]*"/g;

export interface LandscapeMotionBudget {
  readonly reserve: (catalogId: string, markup: string) => boolean;
}

export function createLandscapeMotionBudget(): LandscapeMotionBudget {
  let remaining = 36;
  let sprites = 0;
  let windmills = 0;
  return {
    reserve: (catalogId, markup) => {
      const count =
        (markup.match(/<(?:animate(?:Transform|Motion)?|set)\b/g) ?? []).length +
        (markup.match(ANIMATED_CLASS) ?? []).length;
      const windmill = WINDMILLS.has(catalogId);
      if (!count || count > remaining || sprites >= 8 || (windmill && windmills >= 4)) return false;
      remaining -= count;
      sprites++;
      if (windmill) windmills++;
      return true;
    },
  };
}
