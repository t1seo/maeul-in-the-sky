import type { ModelPart } from '../geometry-types.js';
import {
  branch,
  PALETTE as C,
  part,
  place,
  radial,
  type Triple,
  type Variant,
} from './primitives.js';

function roots(width: number): readonly ModelPart[] {
  return Array.from({ length: 4 }, (_, index) =>
    branch([0, 0.08, 0], radial(index, 4, width, 0.018, 0.3), 0.028),
  );
}

export function conifer(variant: Variant): readonly ModelPart[] {
  const tiers = 4 + variant;
  const height = 0.84 + variant * 0.12;
  const parts: ModelPart[] = [
    part('cone', C.bark, [0, height * 0.36, 0], [0.105, height * 0.72, 0.105]),
    ...roots(0.16),
  ];
  for (let tier = 0; tier < tiers; tier += 1) {
    const width = 0.62 * (1 - tier / (tiers + 0.5));
    const y = 0.29 + tier * 0.12;
    const shift = Math.sin(tier * 1.7 + variant) * 0.024;
    parts.push(
      part(
        'cone',
        tier % 2 === 0 ? C.pine : C.pineLight,
        [shift, y + 0.17, 0],
        [width, 0.38, width * (0.86 + (tier % 2) * 0.12)],
        [0.02, tier * 0.6, 0.04],
      ),
    );
    parts.push(branch([0, y - 0.03, 0], [width * 0.36, y, width * 0.1], 0.022));
    if (variant === 2 && tier < tiers - 1) {
      parts.push(
        part('cone', C.snow, [shift, y + 0.25, -0.015], [width * 0.63, 0.19, width * 0.61]),
      );
    }
  }
  return parts;
}

export function broadleaf(variant: Variant): readonly ModelPart[] {
  const limbs = 4 + variant;
  const trunkTop: Triple = [0.055 - variant * 0.025, 0.58, 0.025];
  const parts: ModelPart[] = [
    ...roots(0.19 + variant * 0.02),
    branch([0, 0.02, 0], [-0.035, 0.3, 0.025], 0.105 + variant * 0.012),
    branch([-0.035, 0.27, 0.025], trunkTop, 0.076),
  ];
  for (let limb = 0; limb < limbs; limb += 1) {
    const endpoint = radial(
      limb,
      limbs,
      0.22 + (limb % 2) * 0.045,
      0.65 + (limb % 3) * 0.085,
      variant * 0.37,
    );
    const [x, y, z] = endpoint;
    parts.push(branch([trunkTop[0] * 0.4, 0.36 + (limb % 2) * 0.09, 0.025], endpoint, 0.04));
    parts.push(branch(endpoint, [x * 1.16, y + 0.12, z * 0.85], 0.019));
    parts.push(
      part(
        'sphere',
        variant === 1 ? '#c69858' : C.leafDark,
        [x, y + 0.015, z],
        [0.36, 0.25, 0.32],
        [0.08, limb * 0.7, 0.12],
      ),
    );
    parts.push(
      part(
        'sphere',
        variant === 1 ? '#d9b665' : C.leaf,
        [x * 0.93, y + 0.1, z - 0.02],
        [0.33, 0.25, 0.31],
        [0.05, limb * 0.7, -0.2],
      ),
    );
  }
  parts.push(
    part('sphere', variant === 1 ? C.gold : C.leafLight, [0.035, 0.87, 0.015], [0.4, 0.32, 0.37]),
  );
  return parts;
}

export function bamboo(variant: Variant): readonly ModelPart[] {
  const stems = 3 + variant;
  const parts: ModelPart[] = [];
  for (let stem = 0; stem < stems; stem += 1) {
    const [x, , z] = radial(stem, stems, 0.14 + (stem % 2) * 0.045, 0, 0.2);
    const height = 0.64 + ((stem * 3 + variant) % 4) * 0.12;
    const bend = (stem % 2 === 0 ? -1 : 1) * 0.035;
    parts.push(branch([x, 0.015, z], [x + bend, height, z], 0.032, C.leafDark));
    for (let node = 1; node <= 3; node += 1) {
      const y = (height * node) / 4;
      parts.push(
        part('cylinder', C.leafLight, [x + (bend * node) / 4, y, z], [0.039, 0.016, 0.039]),
      );
    }
    for (let leaf = 0; leaf < 3; leaf += 1) {
      const sign = leaf % 2 === 0 ? 1 : -1;
      const y = height * (0.54 + leaf * 0.17);
      const tip: Triple = [x + bend + sign * 0.15, y + 0.04, z + (leaf - 1) * 0.06];
      parts.push(branch([x + bend, y, z], tip, 0.012, C.leafDark));
      parts.push(
        part(
          'sphere',
          leaf === 1 ? C.leafLight : C.leaf,
          tip,
          [0.21, 0.025, 0.065],
          [0, leaf * 0.65, sign * 0.3],
        ),
      );
    }
  }
  return parts;
}

export function willow(variant: Variant): readonly ModelPart[] {
  const crown: Triple = [0.12 + variant * 0.025, 0.79, 0.025];
  const parts: ModelPart[] = [
    ...roots(0.2),
    branch([-0.09, 0.025, 0], [-0.065, 0.37, 0.03], 0.115),
    branch([-0.065, 0.37, 0.03], [0.06, 0.65, 0.03], 0.085),
    branch([0.06, 0.65, 0.03], crown, 0.065),
    part('sphere', C.leaf, crown, [0.39, 0.23, 0.36]),
  ];
  const arms = 5 + variant;
  for (let arm = 0; arm < arms; arm += 1) {
    const [x, y, z] = radial(arm, arms, 0.29, 0.77 + (arm % 2) * 0.08, 0.4);
    parts.push(branch([0.04, 0.61, 0.025], [x, y, z], 0.035));
    parts.push(branch([x, y, z], [x * 1.12, y - 0.3, z * 1.12], 0.012, C.leafDark));
    for (let fall = 0; fall < 3; fall += 1) {
      parts.push(
        part(
          'sphere',
          fall === 0 ? C.leafLight : C.leaf,
          [x * (1 + fall * 0.09), y - fall * 0.14, z * (1 + fall * 0.09)],
          [0.14 - fall * 0.02, 0.29 - fall * 0.025, 0.13],
          [z * 0.7, arm * 0.5, -x * 0.7],
        ),
      );
    }
  }
  return parts;
}

export function grove(variant: Variant): readonly ModelPart[] {
  const trees = 2 + variant;
  return Array.from({ length: trees }, (_, index) => {
    const position = radial(index, trees, 0.24, 0, 0.4 + variant * 0.25);
    const scale = 0.56 + (index % 2) * 0.18;
    return place(conifer(index % 2 === 0 ? 0 : 1), position, scale);
  }).flat();
}
