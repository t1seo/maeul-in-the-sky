import { inflateSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { renderPng } from '../../src/output/png.js';

function decodePng(bytes: Uint8Array) {
  const buffer = Buffer.from(bytes);
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  const chunks: Buffer[] = [];
  for (let offset = 8; offset < buffer.length;) {
    const length = buffer.readUInt32BE(offset);
    if (buffer.toString('ascii', offset + 4, offset + 8) === 'IDAT') {
      chunks.push(buffer.subarray(offset + 8, offset + 8 + length));
    }
    offset += length + 12;
  }
  return { width, height, pixels: inflateSync(Buffer.concat(chunks)), colorType: buffer[25] };
}

describe('portable PNG output', () => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="10"></svg>';
  it('C13-png decodes scaled PNGs with opaque mode backgrounds', async () => {
    const [dark, light] = await Promise.all([
      renderPng(svg, { mode: 'dark' }),
      renderPng(svg, { mode: 'light', scale: 3 }),
    ]);
    const decodedDark = decodePng(dark);
    const decodedLight = decodePng(light);
    expect([decodedDark.width, decodedDark.height]).toEqual([40, 20]);
    expect([decodedLight.width, decodedLight.height]).toEqual([60, 30]);
    expect(decodedDark.colorType).toBe(6);
    expect([...decodedDark.pixels.subarray(1, 5)]).toEqual([13, 17, 23, 255]);
    expect([...decodedLight.pixels.subarray(1, 5)]).toEqual([255, 255, 255, 255]);
  });
  it.each([0, 5, 1.5, NaN])('rejects scale %s', async (scale) => {
    await expect(renderPng(svg, { mode: 'dark', scale })).rejects.toThrow('scale');
  });
  it('renders bundled-font text into the image', async () => {
    const text = svg.replace(
      '</svg>',
      '<text x="0" y="9" font-size="9" fill="white">가A</text></svg>',
    );
    const [empty, labelled] = await Promise.all([
      renderPng(svg, { mode: 'dark' }),
      renderPng(text, { mode: 'dark' }),
    ]);
    expect(labelled).not.toEqual(empty);
  });
});
