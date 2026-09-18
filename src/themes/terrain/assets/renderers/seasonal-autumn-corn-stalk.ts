import type { AssetColors } from '../../palette.js';
import { lerpColor } from '../../../../utils/color.js';
import { autumnLeaf, orchardFruit, wovenBasket } from './summer-autumn-art-harvest.js';

export function svgCornStalkAsset(x: number, y: number, c: AssetColors, v: number): string {
  const leaf = v === 2 ? c.haybale : c.cornStalkColor;
  const count = v === 1 ? 3 : 1;
  const stalks = Array.from({ length: count }, (_, i) => {
    const ox = (i - (count - 1) / 2) * 1.8;
    const h = 3.15 - (i % 2) * 0.3;
    return `<g transform="translate(${ox},0)">
      <path d="M-0.15,0.75 L-0.1,${-h} 0.15,${-h} 0.23,0.7Z" fill="${leaf}"/>
      <path d="M0.08,-1.6 Q0.9,-2.95 1.6,-2.4 Q0.95,-2.25 0.2,-1.35 M0,-0.55 Q-1.3,-2.5 -1.5,-1.7 Q-0.55,-1.6 0.13,-0.27 M0.15,-0.3 Q1,-1.5 1.6,-1.05 Q0.8,-0.9 0.15,-0.08Z" fill="${leaf}"/>
      <path d="M0,-2.4 Q-1.1,-3.2 -1.4,-2.6 Q-0.5,-2.3 0.08,-2.1Z" fill="${lerpColor(leaf, c.cornEar, 0.35)}"/>
      <path d="M0.26,-0.98 Q0.14,-2.28 0.65,-2.45 Q1.12,-2 0.55,-0.92Z" fill="${c.cornEar}"/>
      <path d="M0.17,-0.68 Q0.1,-1.45 0.22,-1.65 L0.51,-1.05 1.02,-1.85 Q1,-1.1 0.17,-0.68Z" fill="${leaf}"/>
      <path d="M0.5,-1.55 l0.25,-0.08 M0.53,-1.89 l0.22,-0.04" stroke="${lerpColor(c.cornEar, c.parasolStripe, 0.5)}" stroke-width="0.15"/>
      <path d="M0,${-h} V${-h - 0.26} M0,${-h - 0.1} l-0.45,-0.18 M0.08,${-h - 0.05} l0.45,-0.22" stroke="${c.cornEar}" stroke-width="0.16" stroke-linecap="round"/>
    </g>`;
  }).join('');
  return `<g transform="translate(${x},${y})">${stalks}
    ${v === 2 ? `<path d="M-0.5,0 L0.7,0.2 M-0.52,0.23 L0.65,0.42" stroke="${c.nestBrown}" stroke-width="0.2"/><path d="M-0.15,-0.8 Q-0.95,-1.3 -0.8,-2.1 Q-0.35,-2.35 -0.1,-0.8Z" fill="${c.cornEar}"/>` : ''}
  </g>`;
}

export function svgScarecrowAutumn(x: number, y: number, c: AssetColors, v: number): string {
  const dark = lerpColor(c.scarecrow, c.trunk, 0.4);
  return `<g transform="translate(${x},${y})">
    <ellipse cx="0.3" cy="1.25" rx="1.6" ry="0.35" fill="${c.trunk}" opacity="0.16"/>
    <path d="M-0.18,1.3 V-3 H0.18 V1.3Z" fill="${c.trunk}"/>
    <path d="M-2.55,-2.2 L2.6,-1.9" stroke="${c.trunk}" stroke-width="0.23"/>
    <path d="M-0.62,-3 L0.6,-2.9 1.05,-2.4 2.18,-2.45 2.25,-1.6 0.72,-1.65 1,0.45 0.3,0.2 -0.05,0.6 -0.95,0.25 -0.67,-1.8 -2.1,-1.75 -2.24,-2.55 -1.15,-2.45Z" fill="${c.scarecrow}"/>
    <path d="M0.12,-2.8 L0.6,-2.9 1.05,-2.4 2.18,-2.45 2.25,-1.6 0.72,-1.65 1,0.45 0.3,0.2Z" fill="${dark}"/>
    <path d="M-2.17,-2.37 l-0.47,-0.14 M-2.12,-2.12 l-0.5,0.1 M2.16,-2.2 l0.48,-0.12 M2.2,-1.88 l0.45,0.18 M-0.65,0.17 l-0.24,0.53 M0.6,0.24 l0.15,0.5" stroke="${c.haybale}" stroke-width="0.17"/>
    <path d="M-0.65,-1.45 L-0.05,-1.3 -0.15,-0.65 -0.72,-0.82Z" fill="${c.fallenLeafRed}"/>
    <path d="M-0.59,-1.34 L-0.13,-1.23 M-0.63,-0.96 L-0.2,-0.85" stroke="${c.haybale}" stroke-width="0.1"/>
    ${v === 2 ? `<path d="M-0.95,-3.75 Q-1,-4.8 0,-4.7 Q1.1,-4.8 1,-3.75 Q0.85,-2.9 0,-3 Q-0.9,-2.9 -0.95,-3.75Z" fill="${c.pumpkin}"/><path d="M0.25,-4.68 Q0.85,-3.8 0.25,-3.05" fill="${c.autumnRust}"/><path d="M-0.54,-3.85 l0.24,-0.3 0.2,0.32Z M0.18,-3.8 l0.2,-0.3 0.24,0.35Z M-0.35,-3.4 l0.7,0.05 -0.37,0.2Z" fill="${c.trunk}"/><path d="M0,-4.6 L0.12,-5.05" stroke="${c.trunk}" stroke-width="0.23"/>` : `<path d="M-0.78,-3.75 Q-0.75,-4.55 0,-4.5 Q0.8,-4.4 0.78,-3.65 Q0.58,-3.03 -0.08,-3.03 Q-0.8,-3.12 -0.78,-3.75Z" fill="${c.lambWool}"/><path d="M-0.35,-3.73 h0.14 M0.27,-3.68 h0.14 M-0.28,-3.4 Q0,-3.23 0.3,-3.38" fill="none" stroke="${c.trunk}" stroke-width="0.13"/><path d="M-1.35,-4.35 Q-0.1,-4.9 1.3,-4.35 Q0.1,-3.91 -1.35,-4.35Z" fill="${c.scarecrowHat}"/><path d="M-0.76,-4.45 L-0.58,-5.27 0.48,-5.15 0.72,-4.45 Q0,-4.18 -0.76,-4.45Z" fill="${c.scarecrowHat}"/><path d="M-0.64,-4.69 Q0,-4.43 0.59,-4.65" stroke="${c.haybale}" stroke-width="0.19"/>`}
    ${v === 1 ? `<path d="M1.46,-2.45 Q1.05,-3 1.65,-3.2 Q1.88,-3.2 2.07,-3 L2.22,-3.55 Q2.6,-3.76 2.77,-3.34 L3.32,-3.16 2.77,-3.03 2.64,-2.58 3,-2.24 2.38,-2.47Z" fill="${c.watermelonSeed}"/><path d="M2.16,-2.47 v0.27 M2.48,-2.47 v0.25" stroke="${c.trunk}" stroke-width="0.12"/>` : ''}
  </g>`;
}

export function svgHarvestBasket(x: number, y: number, c: AssetColors, v: number): string {
  const fruit =
    v === 1
      ? orchardFruit(-0.85, -1.25, 0.6, c.pearGreen, c) +
        orchardFruit(0.12, -1.45, 0.54, c.harvestApple, c) +
        `<path d="M0.7,-0.8 L0.8,-2.03 1.4,-1.9Z" fill="${c.cornEar}"/><path d="M1.05,-1.93 Q0.5,-2.68 0.68,-2.55 L1.18,-2.05 1.48,-2.62 1.39,-1.93Z" fill="${c.cornStalkColor}"/>`
      : v === 2
        ? `<path d="M-0.95,-1.45 a0.38,0.38 0 1 1 0.7,-0.2 a0.38,0.38 0 1 1 0.65,0.12 a0.38,0.38 0 1 1 0.24,0.63 a0.4,0.4 0 1 1 -0.73,0.26 a0.38,0.38 0 1 1 -0.58,-0.26 a0.38,0.38 0 0 1 -0.28,-0.55Z" fill="${c.harvestGrape}"/><path d="M-0.68,-1.69 h0.24 M0.11,-1.72 h0.21 M-0.26,-1.2 h0.24" stroke="${lerpColor(c.harvestGrape, c.parasolStripe, 0.45)}" stroke-width="0.14"/><path d="M-0.15,-1.85 Q0.25,-2.2 0.8,-1.95 L0.3,-1.5Z" fill="${c.autumnOlive}"/>`
        : orchardFruit(-0.8, -1.4, 0.55, c.harvestApple, c) +
          orchardFruit(0.58, -1.45, 0.6, c.harvestApple, c) +
          orchardFruit(-0.1, -1.17, 0.42, c.pearGreen, c);
  return `<g transform="translate(${x},${y})">${wovenBasket(fruit, c, v !== 2)}
    ${v === 1 ? `<path d="M-1.53,-1.1 L-0.9,-0.8 -0.72,0.57 -1.35,0.27Z" fill="${c.beachTowelB}"/>` : ''}
    ${v === 2 ? autumnLeaf(1.85, 0.1, -25, 0.8, c.autumnOlive, c.trunk) : ''}
  </g>`;
}

export function svgHotDrink(x: number, y: number, c: AssetColors, v: number): string {
  const top = v === 1 ? -1.75 : -1.3;
  const width = v === 2 ? 0.92 : 0.72;
  const shade = lerpColor(c.hotDrinkMug, c.trunk, 0.35);
  return `<g transform="translate(${x},${y})">
    ${v === 2 ? `<ellipse cx="0.18" cy="0.68" rx="1.62" ry="0.45" fill="${c.hotDrinkMug}"/><ellipse cx="0.12" cy="0.6" rx="1.2" ry="0.25" fill="${c.parasolStripe}"/>` : ''}
    <path d="M${width - 0.04},${top + 0.35} Q1.85,${top + 0.05} 1.6,${top + 1.12} Q1.5,${top + 1.6} ${width - 0.05},${top + 1.2}" fill="none" stroke="${shade}" stroke-width="0.29"/>
    <path d="M-${width},${top} H${width} L${width - 0.08},0.35 Q0,0.85 -${width - 0.08},0.35Z" fill="${c.hotDrinkMug}"/>
    <path d="M${width * 0.35},${top} H${width} L${width - 0.08},0.35 Q0.3,0.65 0,0.6 Q0.6,-0.05 ${width * 0.35},${top}Z" fill="${shade}"/>
    <ellipse cy="${top}" rx="${width}" ry="0.3" fill="${c.parasolStripe}"/>
    <ellipse cy="${top + 0.02}" rx="${width - 0.17}" ry="0.18" fill="${c.acornCap}"/>
    <path d="M-${width - 0.18},${top + 0.36} L-${width - 0.2},0.15" stroke="${lerpColor(c.hotDrinkMug, c.parasolStripe, 0.65)}" stroke-width="0.15" stroke-linecap="round"/>
    <path d="M-0.22,${top - 0.38} C-0.85,${top - 1} 0.5,${top - 1.06} -0.1,${top - 1.65}" fill="none" stroke="${c.hotDrinkSteam}" stroke-width="0.22" stroke-linecap="round" opacity="0.65"/>
    ${v > 0 ? `<path d="M0.38,${top - 0.35} Q0.87,${top - 0.8} 0.48,${top - 1.02}" fill="none" stroke="${c.hotDrinkSteam}" stroke-width="0.16" opacity="0.5"/>` : ''}
    ${v === 2 ? `<path d="M-0.42,-1.48 L-0.1,-1.52 -0.05,-1.22 -0.37,-1.2Z M0.16,-1.35 L0.42,-1.46 0.57,-1.2 0.26,-1.12Z" fill="${c.lambWool}"/>` : ''}
  </g>`;
}

export function svgAutumnWreath(x: number, y: number, c: AssetColors, v: number): string {
  const light = v === 1 ? c.fallenLeafGold : c.autumnOlive;
  const shade = lerpColor(c.wreathGreen, c.trunk, 0.4);
  return `<g transform="translate(${x},${y})">
    <path d="M-1.7,-1.55 Q-1.8,-3.55 0,-3.45 Q1.9,-3.35 1.72,-1.4 Q1.5,0.15 -0.1,0.07 Q-1.6,-0.1 -1.7,-1.55Z M-1,-1.6 Q-1,-0.58 -0.02,-0.65 Q1,-0.55 1.05,-1.6 Q1.1,-2.65 0,-2.63 Q-1.1,-2.7 -1,-1.6Z" fill="${c.nestBrown}" fill-rule="evenodd"/>
    <path d="M-1.92,-1.45 L-1.62,-1.86 -1.9,-2.36 -1.37,-2.52 -1.32,-3.05 -0.7,-2.96 -0.38,-3.56 0.05,-3.19 0.65,-3.43 0.9,-2.98 1.53,-2.92 1.42,-2.37 1.98,-2.03 1.64,-1.54 1.82,-0.94 1.31,-0.82 1.03,-0.21 0.48,-0.38 0.08,0.15 -0.33,-0.26 -0.99,-0.08 -1.14,-0.61 -1.72,-0.64 -1.53,-1.15Z M-1.1,-1.5 L-0.86,-1.06 -0.43,-0.81 0.04,-0.77 0.6,-0.99 0.91,-1.32 1.03,-1.79 0.69,-2.39 0.1,-2.56 -0.45,-2.41 -0.89,-2.07Z" fill="${c.wreathGreen}" fill-rule="evenodd"/>
    <path d="M-1.62,-1.86 L-1.9,-2.36 -1.37,-2.52 -1.32,-3.05 -0.7,-2.96 -0.38,-3.56 0.05,-3.19 0.65,-3.43 0.9,-2.98 0.12,-2.85 -0.47,-2.95 -0.69,-2.47 -1.28,-2.2 -1.12,-1.62Z" fill="${light}"/>
    <path d="M1.25,-2.28 L1.98,-2.03 1.64,-1.54 1.82,-0.94 1.31,-0.82 1.03,-0.21 0.48,-0.38 0.08,0.15 -0.33,-0.26 -0.99,-0.08 -1.14,-0.61 -0.3,-0.51 0.19,-0.29 0.65,-0.66 1.13,-1.08Z" fill="${shade}"/>
    ${v === 1 ? `<path d="M1.44,-1.3 L2.26,-1.9 2.12,-1.05 1.52,-0.86Z" fill="${c.fallenLeafGold}"/>` : ''}
    ${v > 0 ? `<path d="M0.65,-2.9 a0.23,0.23 0 1 0 0.46,0 a0.23,0.23 0 1 0 -0.46,0 M1.17,-2.51 a0.22,0.22 0 1 0 0.44,0 a0.22,0.22 0 1 0 -0.44,0 M-1.48,-1.5 a0.24,0.24 0 1 0 0.48,0 a0.24,0.24 0 1 0 -0.48,0" fill="${c.wreathBerry}"/>` : ''}
    ${v === 2 ? `<path d="M0,-0.38 Q-1.22,-1.22 -0.92,-0.04 L-0.15,-0.12 -0.5,0.97 0.06,0.72 0.36,1.03 0.34,-0.12 Q1.27,0.03 0.88,-0.8Z" fill="${c.scarfRed}"/><path d="M-0.12,-0.48 L0.23,-0.41 0.29,-0.02 -0.16,-0.02Z" fill="${c.wreathBerry}"/>` : ''}
  </g>`;
}

function fieldPumpkin(x: number, y: number, size: number, c: AssetColors): string {
  return `<g transform="translate(${x},${y}) scale(${size})">
    <path d="M0,-0.75 C-1.6,-1.2 -1.7,0.6 -0.7,0.92 Q0,1.22 0.7,0.87 C1.7,0.3 1.3,-1.25 0,-0.75Z" fill="${c.pumpkin}"/>
    <path d="M0.48,-0.75 C1.7,-0.76 1.36,0.6 0.7,0.87 L0.1,1 Q0.97,0.35 0.48,-0.75Z" fill="${c.autumnRust}"/>
    <path d="M-0.2,-0.7 Q-0.96,-0.2 -0.4,0.79 M0.12,-0.63 Q0.63,0.2 0.23,0.88" fill="none" stroke="${lerpColor(c.pumpkin, c.autumnGold, 0.55)}" stroke-width="0.17"/>
    <path d="M-0.15,-0.65 L-0.22,-1.17 0.16,-1.3 0.12,-0.64Z" fill="${c.trunk}"/>
  </g>`;
}

export function svgPumpkinPatch(x: number, y: number, c: AssetColors, v: number): string {
  const pumpkins =
    v === 2
      ? fieldPumpkin(0, 0.05, 1.3, c)
      : v === 1
        ? fieldPumpkin(-1.2, -0.4, 0.82, c) +
          fieldPumpkin(1.05, -0.05, 0.77, c) +
          fieldPumpkin(-0.15, 0.55, 0.67, c)
        : fieldPumpkin(-0.75, 0, 0.9, c) + fieldPumpkin(0.95, 0.32, 0.68, c);
  return `<g transform="translate(${x},${y})">
    <path d="M-2.55,0.7 Q-2.15,-1.55 -0.85,-1.65 Q0.45,-2.2 1.9,-0.95 Q2.65,-0.35 2.12,0.62" fill="none" stroke="${c.autumnOlive}" stroke-width="0.18"/>
    <path d="M-2.3,0.4 Q-3,-0.4 -2.25,-0.65 L-1.85,-0.25Z M1.5,-1.2 Q2.1,-2.05 2.5,-1.35 L2.08,-0.85Z" fill="${c.autumnOlive}"/>
    ${pumpkins}
  </g>`;
}

function strawBale(x: number, y: number, width: number, c: AssetColors): string {
  const shade = lerpColor(c.haybale, c.trunk, 0.35);
  return `<g transform="translate(${x},${y})">
    <path d="M0,0 L${width},0.38 V-0.72 L0,-1.1Z" fill="${c.haybale}"/>
    <path d="M${width},0.38 L${width + 0.7},-0.05 V-1.15 L${width},-0.72Z" fill="${shade}"/>
    <path d="M0,-1.1 L0.7,-1.53 ${width + 0.7},-1.15 ${width},-0.72Z" fill="${c.autumnGold}"/>
    <path d="M0.45,-1.04 V0.06 M${width - 0.32},-0.8 V0.27" stroke="${c.nestBrown}" stroke-width="0.16"/>
    <path d="M0.08,-0.65 L${width - 0.05},-0.33 M0.08,-0.31 L${width - 0.05},0.02" stroke="${c.autumnGold}" stroke-width="0.12"/>
  </g>`;
}

export function svgHayMaze(x: number, y: number, c: AssetColors, v: number): string {
  const bales =
    v === 1
      ? strawBale(-2.2, -1, 1.05, c) +
        strawBale(-2.2, 0.38, 1.05, c) +
        strawBale(-0.1, 0.72, 1.45, c)
      : v === 2
        ? strawBale(-2.15, 0.42, 1.2, c) + strawBale(0.2, -0.4, 1.55, c)
        : strawBale(-2, 0.5, 3.2, c) + strawBale(-0.95, -0.63, 1.48, c);
  return `<g transform="translate(${x},${y})">${bales}</g>`;
}
