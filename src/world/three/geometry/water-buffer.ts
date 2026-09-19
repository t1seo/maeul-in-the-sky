import { Color, Float32BufferAttribute } from 'three';
import type { Vec3 } from '../../model/types.js';
import { SurfaceBuffer } from './buffer.js';

export type WaterVertex = {
  readonly point: Vec3;
  readonly uv: readonly [number, number];
  readonly depth: number;
};

export class WaterBuffer {
  readonly surface = new SurfaceBuffer();
  readonly uv: number[] = [];
  private readonly shallow = new Color('#91bdb1');
  private readonly deep = new Color('#3e8790');

  triangle(a: WaterVertex, b: WaterVertex, c: WaterVertex): void {
    this.surface.triangle(a.point, b.point, c.point);
    for (const vertex of [a, b, c]) {
      const color = this.shallow.clone().lerp(this.deep, vertex.depth);
      this.surface.colors.push(color.r, color.g, color.b);
      this.uv.push(...vertex.uv);
    }
  }

  quad(a: WaterVertex, b: WaterVertex, c: WaterVertex, d: WaterVertex): void {
    this.triangle(a, b, c);
    this.triangle(a, c, d);
  }

  build() {
    const geometry = this.surface.build();
    geometry.setAttribute('uv', new Float32BufferAttribute(this.uv, 2));
    return geometry;
  }
}
