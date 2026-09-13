import { hash, lerp, seededRandom } from '../../utils/math.js';

export interface BiomeContext {
  isRiver: boolean;
  isPond: boolean;
  nearWater: boolean;
  forestDensity: number;
}

function sample(seed: number, purpose: string, sector: number): number {
  return seededRandom(hash(`${seed}:${purpose}:${sector}`))();
}

function riverDay(week: number, river: number, days: number, seed: number): number {
  const sector = Math.floor(week / 6);
  const t = (week - sector * 6) / 6;
  const bend = lerp(
    sample(seed, `river-${river}`, sector),
    sample(seed, `river-${river}`, sector + 1),
    t * t * (3 - 2 * t),
  );
  const split = Math.max(1, Math.floor(days / 2));
  const start = river === 0 ? 0 : Math.min(split, days - 1);
  const span = river === 0 ? split : days - start;
  return start + Math.round(bend * Math.max(0, span - 1));
}

function waterAt(week: number, day: number, days: number, seed: number) {
  const isRiver = day === riverDay(week, 0, days, seed) || day === riverDay(week, 1, days, seed);
  const pondSector = Math.floor(week / 26);
  let isPond = false;
  for (let sector = pondSector - 1; sector <= pondSector + 1; sector++) {
    const centerWeek = sector * 26 + 3 + Math.floor(sample(seed, 'pond-week', sector) * 20);
    const centerDay = riverDay(centerWeek, 0, days, seed);
    const radius = sample(seed, 'pond-size', sector) > 0.5 ? 1 : 0;
    isPond ||=
      Math.abs(week - centerWeek) + Math.abs(day - centerDay) <= radius ||
      (week === centerWeek && day === Math.min(days - 1, centerDay + 1));
  }
  return { isRiver, isPond };
}

function forestAt(week: number, day: number, days: number, seed: number): number {
  const home = Math.floor(week / 9);
  let density = 0;
  for (let sector = home - 1; sector <= home + 1; sector++) {
    const x = sector * 9 + Math.floor(sample(seed, 'forest-week', sector) * 9);
    const y = Math.floor(sample(seed, 'forest-day', sector) * days);
    const radius = 2 + sample(seed, 'forest-radius', sector) * 2;
    density = Math.max(density, 1 - Math.hypot(week - x, day - y) / radius);
  }
  return density;
}

export function generateBiomeMap(
  weeks: number,
  days: number,
  seed: number,
  firstAbsoluteWeek = 0,
): Map<string, BiomeContext> {
  const map = new Map<string, BiomeContext>();
  for (let week = 0; week < weeks; week++) {
    const absoluteWeek = firstAbsoluteWeek + week;
    for (let day = 0; day < days; day++) {
      const water = waterAt(absoluteWeek, day, days, seed);
      const neighbors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      const nearWater =
        !water.isRiver &&
        !water.isPond &&
        neighbors.some(([dw, dd]) => {
          if (day + dd < 0 || day + dd >= days) return false;
          const neighbor = waterAt(absoluteWeek + dw, day + dd, days, seed);
          return neighbor.isRiver || neighbor.isPond;
        });
      map.set(`${week},${day}`, {
        ...water,
        nearWater,
        forestDensity: forestAt(absoluteWeek, day, days, seed),
      });
    }
  }
  return map;
}
