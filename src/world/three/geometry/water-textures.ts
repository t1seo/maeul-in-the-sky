import {
  DataTexture,
  LinearFilter,
  LinearMipmapLinearFilter,
  RepeatWrapping,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import type { GeometryResources } from './resources.js';

export function createWaterTextures(resources: GeometryResources) {
  const width = 128;
  const height = 256;
  const currents = new Uint8Array(width * height * 4);
  const foam = new Uint8Array(currents.length);
  const normals = new Uint8Array(currents.length);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const u = x / width;
      const v = y / height;
      const phase = Math.PI * 2 * (v * 3 + Math.sin(u * Math.PI * 2) * 0.06);
      const arc = Math.exp(-(Math.sin(phase) ** 2) * 180);
      const broken = 0.35 + 0.65 * Math.sin(u * Math.PI * 4 + v * Math.PI * 2) ** 4;
      const fade = Math.sin(u * Math.PI) ** 0.8;
      const index = (y * width + x) * 4;
      currents.set([229, 245, 235, Math.round((arc * 65 + 2) * broken * fade)], index);
      foam.set(
        [
          231,
          242,
          220,
          Math.round(fade * (35 + 125 * Math.sin(v * Math.PI * 12 + u * Math.PI) ** 8)),
        ],
        index,
      );
      normals.set(
        [
          Math.round(128 + Math.cos(u * Math.PI * 4 + v * Math.PI * 2) * 5),
          Math.round(128 + Math.cos(phase) * 11),
          254,
          255,
        ],
        index,
      );
    }
  }
  const current = resources.texture(new DataTexture(currents, width, height, RGBAFormat));
  const shore = resources.texture(new DataTexture(foam, width, height, RGBAFormat));
  const normal = resources.texture(new DataTexture(normals, width, height, RGBAFormat));
  current.name = 'water:current';
  shore.name = 'water:foam';
  normal.name = 'water:ripples';
  current.colorSpace = SRGBColorSpace;
  shore.colorSpace = SRGBColorSpace;
  for (const texture of [current, shore, normal]) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearMipmapLinearFilter;
    texture.generateMipmaps = true;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }
  return { current, shore, normal };
}
