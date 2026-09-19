import { BufferGeometry, Color, Float32BufferAttribute } from 'three';
import type { Vec3 } from '../../model/types.js';

export class SurfaceBuffer {
  readonly positions: number[] = [];
  readonly colors: number[] = [];

  triangle(a: Vec3, b: Vec3, c: Vec3, color?: Color): void {
    for (const point of [a, b, c]) {
      this.positions.push(point.x, point.y, point.z);
      if (color) this.colors.push(color.r, color.g, color.b);
    }
  }

  quad(a: Vec3, b: Vec3, c: Vec3, d: Vec3, color?: Color): void {
    this.triangle(a, b, c, color);
    this.triangle(a, c, d, color);
  }

  build(): BufferGeometry {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(this.positions, 3));
    if (this.colors.length)
      geometry.setAttribute('color', new Float32BufferAttribute(this.colors, 3));
    geometry.computeVertexNormals();
    geometry.computeBoundingBox();
    geometry.computeBoundingSphere();
    return geometry;
  }
}
