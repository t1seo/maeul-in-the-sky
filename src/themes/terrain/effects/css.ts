import { currentMotionContext, motionId } from '../../../core/animation.js';
import type { IsoCell } from '../blocks.js';
import type { BiomeContext } from '../biomes.js';
import { selectEvenly } from './selection.js';
import { currentSurfaceContext } from '../scene/surface-context.js';
import { renderSurfaceMotionCSS } from './surface-motion.js';
const MAX_WATER = 15;
const MAX_SPARKLE = 10;
export function renderTerrainCSS(
  isoCells: IsoCell[],
  biomeMap?: Map<string, BiomeContext>,
  townSparkles = true,
): string {
  if (!currentSurfaceContext()) return renderLegacyTerrainCSS(isoCells, biomeMap, townSparkles);
  return (
    renderSurfaceMotionCSS(isoCells, biomeMap) +
    renderLegacyTerrainCSS(
      isoCells.filter((cell) => cell.level100 < 10 || cell.level100 > 22),
      undefined,
      townSparkles,
    )
  );
}

function renderLegacyTerrainCSS(
  isoCells: IsoCell[],
  biomeMap?: Map<string, BiomeContext>,
  townSparkles = true,
): string {
  const mode = currentMotionContext().mode;
  if (mode === 'off') return '';
  const blocks: string[] = [];
  const waterCount = isoCells.filter((cell) => cell.level100 >= 10 && cell.level100 <= 22).length;
  const maxWater = mode === 'subtle' ? 4 : MAX_WATER;
  const maxRiver = mode === 'subtle' ? Math.max(0, 4 - waterCount) : 8;
  if (mode === 'subtle') {
    for (let index = 0; index < Math.min(waterCount, maxWater); index++) {
      blocks.push(
        `.${motionId('water-' + index)} { animation: subtle-water 8s ease-in-out infinite; }`,
      );
    }
    const riverCount = isoCells.filter((cell) => {
      const biome = biomeMap?.get(`${cell.week},${cell.day}`);
      return cell.level100 > 22 && (biome?.isRiver || biome?.isPond);
    }).length;
    for (let index = 0; index < Math.min(riverCount, maxRiver); index++) {
      blocks.push(
        `.${motionId('river-shimmer-' + index)} { animation: subtle-water 10s ease-in-out infinite; }`,
      );
    }
    if (blocks.length > 0)
      blocks.unshift(
        '@keyframes subtle-water { 0%,100% { opacity: 0.16; } 50% { opacity: 0.20; } }',
      );
    return blocks.join('\n');
  }

  const hasWater = isoCells.some((c) => c.level100 >= 10 && c.level100 <= 22);
  const hasTown = townSparkles && isoCells.some((c) => c.level100 >= 90);

  if (hasWater) {
    blocks.push(
      `@keyframes water-shimmer {` +
        ` 0% { opacity: 0.7; }` +
        ` 50% { opacity: 1; }` +
        ` 100% { opacity: 0.7; }` +
        ` }`,
    );

    const waterCells = isoCells.filter((c) => c.level100 >= 10 && c.level100 <= 22);
    const selected = selectEvenly(waterCells, MAX_WATER);
    for (let i = 0; i < selected.length; i++) {
      const dur = (3 + (i % 3) * 0.8).toFixed(1);
      const delay = ((i * 0.7) % 4).toFixed(1);
      blocks.push(
        `.${motionId('water-' + i)} { animation: water-shimmer ${dur}s ease-in-out ${delay}s infinite; }`,
      );
    }
  }

  if (hasTown) {
    blocks.push(
      `@keyframes town-sparkle {` +
        ` 0% { opacity: 1; }` +
        ` 40% { opacity: 0.5; }` +
        ` 100% { opacity: 1; }` +
        ` }`,
    );

    const townCells = isoCells.filter((c) => c.level100 >= 90);
    const selected = selectEvenly(townCells, MAX_SPARKLE);
    for (let i = 0; i < selected.length; i++) {
      const dur = (2 + (i % 4) * 0.5).toFixed(1);
      const delay = ((i * 0.9) % 3.5).toFixed(1);
      blocks.push(
        `.${motionId('sparkle-' + i)} { animation: town-sparkle ${dur}s ease-in-out ${delay}s infinite; }`,
      );
    }
  }

  // River shimmer for river cells outside the natural water zone
  if (biomeMap) {
    const riverCells = isoCells.filter((c) => {
      const biome = biomeMap.get(`${c.week},${c.day}`);
      return biome && (biome.isRiver || biome.isPond) && c.level100 > 22;
    });
    const selectedRiver = selectEvenly(riverCells, 8);
    if (selectedRiver.length > 0) {
      // Reuse the water-shimmer keyframe (already defined above if hasWater)
      /* v8 ignore start */
      if (!hasWater) {
        /* v8 ignore stop */
        blocks.push(
          `@keyframes water-shimmer {` +
            ` 0% { opacity: 0.7; }` +
            ` 50% { opacity: 1; }` +
            ` 100% { opacity: 0.7; }` +
            ` }`,
        );
      }
      for (let i = 0; i < selectedRiver.length; i++) {
        const dur = (3.5 + (i % 3) * 0.6).toFixed(1);
        const delay = ((i * 0.8) % 3.5).toFixed(1);
        blocks.push(
          `.${motionId('river-shimmer-' + i)} { animation: water-shimmer ${dur}s ease-in-out ${delay}s infinite; }`,
        );
      }
    }
  }

  // Windmill rotation (SMIL handles this, but flag wave needs CSS)
  blocks.push(
    `@keyframes flag-wave {` +
      ` 0% { transform: scaleX(1); }` +
      ` 50% { transform: scaleX(0.7); }` +
      ` 100% { transform: scaleX(1); }` +
      ` }`,
  );

  // Gentle sway for tallGrass, cattail
  blocks.push(
    `@keyframes sway-gentle {` +
      ` 0% { transform: rotate(-2deg); }` +
      ` 50% { transform: rotate(2deg); }` +
      ` 100% { transform: rotate(-2deg); }` +
      ` }`,
  );
  blocks.push(
    `.sway-gentle { animation: sway-gentle 3s ease-in-out infinite; transform-origin: 0 0; }`,
  );

  // Slow sway for laundry
  blocks.push(
    `@keyframes sway-slow {` +
      ` 0% { transform: rotate(-1deg); }` +
      ` 50% { transform: rotate(1deg); }` +
      ` 100% { transform: rotate(-1deg); }` +
      ` }`,
  );
  blocks.push(
    `.sway-slow { animation: sway-slow 4s ease-in-out infinite; transform-origin: bottom center; }`,
  );

  return blocks.join('\n');
}
