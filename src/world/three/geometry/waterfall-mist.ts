import {
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  RGBAFormat,
  SRGBColorSpace,
} from 'three';
import type { GeometryResources } from './resources.js';

export function createWaterfallMist(resources: GeometryResources) {
  const positions: number[] = [];
  const uv: number[] = [];
  for (let plane = 0; plane < 3; plane += 1) {
    const angle = (plane * Math.PI) / 3;
    for (const [x, y] of [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
      [1, 1],
      [0, 1],
    ]) {
      positions.push((x - 0.5) * Math.cos(angle), y - 0.5, (x - 0.5) * Math.sin(angle));
      uv.push(x, y);
    }
  }
  const geometry = resources.geometry(new BufferGeometry());
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const size = 32;
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const radius = Math.hypot((2 * x) / (size - 1) - 1, (2 * y) / (size - 1) - 1);
      const alpha = Math.max(0, 1 - radius * radius) ** 3;
      pixels.set([238, 250, 250, Math.round(alpha * 255)], (y * size + x) * 4);
    }
  }
  const texture = resources.texture(new DataTexture(pixels, size, size, RGBAFormat));
  texture.name = 'waterfalls:mist';
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return { geometry, texture };
}
