import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { withMotionContext } from '../../src/core/animation.js';
import { EPIC_RENDERERS } from '../../src/themes/terrain/epics/renderers.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

// Historical coverage guard: opaque silhouettes, excluding short ground shadows.
// This proves a physical redesign for each ID; the art board remains the quality evidence.
const originalOutlines = {
  mountFuji: 'a80cdce245fc343594a957e47ac6a1a2c815ac77c2e1a0d95d205cfbe3ace922',
  giantSequoia: '86e4ca91a824ec8a0818b88d67da894805474cb1806222404092f0266f3f47c0',
  coralReef: '1e6b45a0160230bc1ba2276ce8b5f8b0e87a3eb0a4d850dd4993fe6e278e9206',
  geyser: 'f09bf4a05f24bc31ba7f6df45499e609210262ae526287f3867e723733d0a34d',
  hotSpring: '04630154bfb489c86f02ebe6526c80a856ec64f2049bd50cdb520a83c9848d60',
  grandCanyon: '92fbccabfddf66dd38c60897a974e01bffe074c1312a77ab3068f8d429f58cfd',
  oasis: '4c85098523606cddb3707c3484c0ca4efd49f914405bb042909694c15da2e1ed',
  volcano: '93160098411dd57cc98e68a1fd03d3e806fd46a7f3e31cac5e4191867881f367',
  giantMushroom: 'a616a0e7aa728b4dc41b8f2d6bb13198181894029919e77a9ed02055f3c34553',
  colosseum: '86c4734b596c0bd332ef04d709e7b0dbc05d2b215f538a0dd178ed1606f5dbd7',
  pagoda: '27a4c28df34135595a7d65d33cc4d15f40c9642284a1c35a79f2eb7a9a1cd5ec',
  torii: '4035f7d63684ee62a4adf977f32e226968905daf0b9a3cbae4646d20ba152b49',
  eiffelTower: '1db33e0a2a421f699e2c704fd0556426d7648a366caeb78c696d63c22041689f',
  windmillGrand: 'ff7866399e9966ba5a036ca6dfb5b492fd65401fc76570d95d8e016ffdeb239c',
  aurora: '1833156dc8023359cde0b09690aac1f2b7f1e5e17ff1494ec1fe3f1e6d9834c0',
  giantWaterfall: '857ca7016df310b14aeb28867c90642306f4b2740badb95a732519ffd918c2e4',
  bambooGrove: '2ac5578945cc37da09ebe0bd085c851fd6533ee44b63b55ab9b9303dc4f71f76',
  glacierPeak: '505e622e47939a24f66f2d68027629c647f4581fa7974ad34aee05daa0c93c68',
  bioluminescentPool: '22be923143c67962d406f387469807c20a6526e54684d17283489e4c13ed4b31',
  meteorCrater: 'ef3e3da73ea4d34361f6befbf1c2bf718cbb36b17adb9c32d81bf7cceb31228b',
  bonsaiGiant: 'e9c9c8c42b4764447348a5aa18ae0391d253a3c1bfdee0272ac2b045da180034',
  tajMahal: '20a61ec65c277844d666b7b859b48ae16b7670ad63119b5f9e0d7a979ab17343',
  stBasils: 'f0e9f920399f862d2db9fc84339fe6243e318d4962e91e313437c5f3a4ef8c00',
  operaHouse: 'a66be4b9b6bac939488b8acc1e3cac398ce8a1bd073cb2a2151044da7280ad82',
  floatingIsland: 'c17a258b2bc163c57715d70bee5b1cac61fcd58af056f31a483c6e70eceb2221',
  crystalSpire: '769f34f53536a044bfe16c704c9ea5f1aebf03340065dcfb42ed6caf146c7565',
  dragonNest: '70ab0343395980db48c0da915bd1eba62fc77cd75837e9fcbe91f5297698a604',
  worldTree: '4d853ff5af181a3cacd8dc7b2c00fa3c5d400344faa980468639a17aae5be944',
  sakuraEternal: '3000873a12f4669e866baf68346832b5202065e28a939eeb972954202cfe3420',
  ancientPortal: 'd26c3cd3c386e7ac93edbb5a3d75cb0690762c3ad5a4d3e8828ed05b984d17b8',
} as const;

function outline(svg: string): string {
  const fragment = svg.replace(/<(ellipse|path)[^>]*opacity="0\.1[025]"[^>]*\/>/g, '');
  const pixels = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="-16 -20 32 32">${fragment}</svg>`,
    { font: { loadSystemFonts: false } },
  ).render().pixels;
  return createHash('sha256')
    .update(Buffer.from(pixels.filter((_, i) => i % 4 === 3).map((a) => (a > 127 ? 1 : 0))))
    .digest('hex');
}

describe('Wonder physical redesign coverage', () => {
  for (const id of Object.keys(originalOutlines).filter(
    (key): key is keyof typeof originalOutlines => Object.hasOwn(originalOutlines, key),
  )) {
    it(`changes the main opaque silhouette of ${id} beyond shadow or recolor`, () => {
      // Given: the historical main-shape fingerprint and a fixed coordinate window.
      const original = originalOutlines[id];
      const colors = getTerrainPalette100('light').assets;
      // When: the complete resting artwork is rasterized without palette information.
      const svg = withMotionContext({ mode: 'off', namespace: '' }, () =>
        EPIC_RENDERERS[id](0, 0, colors),
      );
      // Then: opaque object geometry differs independently of paint colors.
      expect(outline(svg)).not.toBe(original);
    });
  }
});
