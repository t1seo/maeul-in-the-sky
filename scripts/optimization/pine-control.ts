import { mkdir, writeFile } from 'node:fs/promises';
import { svgPine } from '../../src/themes/terrain/assets/renderers/grassland-pine.js';
import { getTerrainPalette100 } from '../../src/themes/terrain/palette.js';

const directory = 'evidence/svg-optimization/pine-control-input';
await mkdir(directory, { recursive: true });
for (const mode of ['dark', 'light'] as const) {
  const colors = getTerrainPalette100(mode).assets;
  const trees = Array.from({ length: 120 }, (_, index) =>
    svgPine(90 + (index % 30) * 20, 90 + Math.floor(index / 30) * 18, colors, index % 3),
  ).join('');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="840" height="240" viewBox="0 0 840 240" aria-labelledby="pine-title"><title id="pine-title">Static pine controlled experiment</title><desc>120 actual pine renderings, three variants, identical palette, original draw order.</desc>${trees}</svg>`;
  await writeFile(`${directory}/pine-${mode}.svg`, svg);
}
