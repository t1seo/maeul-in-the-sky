import type { SceneCell, SceneDailyReward, TerrainScene } from '../../../core/scene-types.js';
import type { TerrainPalette100 } from '../palette.js';
import { escapeXml, svgNumber } from '../../../core/svg.js';
import { DAILY_REWARD_MINIMUMS, getDailyRewardTier } from '../assets/progression.js';

export function dailyRewardPlacements(cells: readonly SceneCell[]): SceneDailyReward[] {
  return cells
    .flatMap((cell) => {
      const rewardTier = getDailyRewardTier(cell.count);
      if (rewardTier === 0) return [];
      return [
        {
          id: `reward:${cell.date}`,
          catalogId: `dailyReward:${rewardTier}`,
          anchorDate: cell.date,
          week: cell.week,
          day: cell.day,
          cx: cell.isoX,
          cy: cell.isoY,
          count: cell.count,
          rewardTier,
          minimumCount: DAILY_REWARD_MINIMUMS[rewardTier],
          footprint: { x: cell.isoX - 3.6, y: cell.isoY + 2, width: 7.2, height: 3 },
          drawOrder: cell.week + cell.day,
          variant: 0,
          animated: false,
        },
      ];
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function point(x: number, y: number): string {
  return `${svgNumber(x)},${svgNumber(y)}`;
}

function rewardMarker(reward: SceneDailyReward, palette: TerrainPalette100): string {
  const tier = reward.rewardTier;
  const c = palette.assets;
  const radius = 1.6 + tier * 0.3;
  const rise = 0.5 + tier * 0.12;
  const depth = 0.2 + tier * 0.1;
  const y = 2.4;
  const front = y + rise;
  const material = tier >= 2 ? c.cobble : c.fence;
  const shade = c.rock;
  const edge = tier >= 3 ? c.wall : c.leafLight;
  const left = `<path d="M${point(-radius, y)} ${point(0, front)} ${point(0, front + depth)} ${point(-radius, y + depth)}Z" fill="${shade}"/>`;
  const right = `<path d="M${point(0, front)} ${point(radius, y)} ${point(radius, y + depth)} ${point(0, front + depth)}Z" fill="${material}"/>`;
  const rim = `<path d="M${point(-radius, y)} ${point(0, front)} ${point(radius, y)}" fill="none" stroke="${edge}" stroke-width="0.3" stroke-linejoin="round"/>`;
  const marks = Array.from({ length: tier }, (_, index) => {
    const x = (index - (tier - 1) / 2) * 0.8;
    const markY = front - (Math.abs(x) / radius) * rise + depth * 0.5;
    return `M${point(x, markY - 0.2)} ${point(x + 0.25, markY)} ${point(x, markY + 0.2)} ${point(x - 0.25, markY)}Z`;
  }).join('');
  const caps =
    tier >= 4
      ? [-1, 1]
          .map(
            (side) =>
              `M${point(side * radius, y - 0.25)} ${point(side * radius + 0.3, y)} ${point(side * radius, y + 0.25)} ${point(side * radius - 0.3, y)}Z`,
          )
          .join('')
      : '';
  const inlay = `<path d="${marks}${caps}" fill="${tier >= 4 ? c.epicGold : c.flowerCenter}"/>`;
  const crest =
    tier === 5
      ? `<path d="M${point(-0.45, front + depth)} ${point(0, front + depth - 0.4)} ${point(0.45, front + depth)} ${point(0, front + depth + 0.4)}Z" fill="${c.epicGold}" stroke="${c.wall}" stroke-width="0.15"/>`
      : '';
  return `<g data-reward-id="${escapeXml(reward.id)}" data-reward-tier="${tier}" data-reward-count="${reward.count}" transform="translate(${svgNumber(reward.cx)} ${svgNumber(reward.cy)})">${left}${right}${rim}${inlay}${crest}</g>`;
}

export function renderDailyRewards(
  scene: TerrainScene,
  palettes: TerrainPalette100 | readonly TerrainPalette100[],
): string {
  const rewards = scene.rewards ?? [];
  if (rewards.length === 0) return '';
  const markers = rewards
    .map((reward) => {
      const palette =
        'getElevation' in palettes ? palettes : (palettes[reward.week] ?? palettes[0]);
      return palette ? rewardMarker(reward, palette) : '';
    })
    .join('');
  return `<g class="daily-rewards"${scene.settings.artStyle === 'pixel' ? ' shape-rendering="crispEdges"' : ''}>${markers}</g>`;
}
