import { BufferGeometry, Float32BufferAttribute } from 'three';

export function createGrassGeometry(): BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  for (let blade = 0; blade < 5; blade++) {
    const angle = blade * 2.4;
    const height = 0.25 + (blade % 3) * 0.06;
    const curve = 0.08 + (blade % 2) * 0.055;
    const base = positions.length / 3;
    for (let segment = 0; segment <= 3; segment++) {
      const t = segment / 3;
      const width = (0.026 - blade * 0.0015) * (1 - t) ** 0.85;
      const centerX = Math.cos(angle) * curve * t * t;
      const centerZ = Math.sin(angle) * curve * t * t;
      for (const side of [-1, 1]) {
        positions.push(
          centerX - Math.sin(angle) * width * side,
          height * t * (1 - 0.12 * t),
          centerZ + Math.cos(angle) * width * side,
        );
        const light = 0.66 + 0.34 * t;
        colors.push(light, light, light);
      }
      if (segment === 3) continue;
      const row = base + segment * 2;
      indices.push(row, row + 1, row + 2);
      if (segment < 2) indices.push(row + 1, row + 3, row + 2);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}
