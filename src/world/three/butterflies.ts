import {
  Color,
  DoubleSide,
  Euler,
  ExtrudeGeometry,
  Float32BufferAttribute,
  Group,
  InstancedMesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  Shape,
  SphereGeometry,
  Vector3,
} from 'three';
import type { AtmosphereZone } from './season-zones.js';
import { zonePoint } from './season-zones.js';

export function createButterflies() {
  const shape = new Shape().moveTo(0, 0);
  shape.bezierCurveTo(0.2, 0.4, 0.4, 1, 0.85, 0.82);
  shape.bezierCurveTo(1.2, 0.6, 0.75, 0.15, 0.62, 0.04);
  shape.bezierCurveTo(1.05, -0.65, 0.24, -0.9, 0, 0);
  const wingGeometry = new ExtrudeGeometry(shape, {
    depth: 0.025,
    bevelEnabled: false,
    curveSegments: 5,
  });
  const vertices = wingGeometry.getAttribute('position');
  const colors: number[] = [];
  for (let index = 0; index < vertices.count; index++) {
    const shade = vertices.getX(index) > 0.75 ? 0.35 : 1;
    colors.push(shade, shade, shade);
  }
  wingGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const wings = new InstancedMesh(
    wingGeometry,
    new MeshStandardMaterial({
      color: '#ffffff',
      roughness: 0.9,
      vertexColors: true,
      side: DoubleSide,
    }),
    36,
  );
  wings.name = 'butterfly-wings';
  const bodies = new InstancedMesh(
    new SphereGeometry(1, 6, 4),
    new MeshStandardMaterial({ color: '#594b41', roughness: 1 }),
    18,
  );
  bodies.name = 'butterfly-bodies';
  for (const mesh of [wings, bodies]) {
    mesh.count = 0;
    mesh.visible = false;
    mesh.frustumCulled = false;
  }
  const group = new Group().add(wings, bodies);
  const placement = new Object3D();
  const orientation = new Quaternion();
  const flap = new Quaternion();
  const hinge = new Vector3(0, 1, 0);
  const color = new Color();
  return {
    group,
    update(zones: readonly AtmosphereZone[], seconds: number, high: boolean) {
      const count = zones.length ? (high ? 18 : 6) : 0;
      wings.count = count * 2;
      bodies.count = count;
      wings.visible = count > 0;
      bodies.visible = count > 0;
      for (let index = 0; index < count; index++) {
        const zone = zones[index % zones.length];
        const point = zonePoint(zone, index);
        const phase = seconds * 0.5 + index * 2.4;
        const wander = Math.min(0.65, (zone.max.x - zone.min.x) / 5);
        placement.position.set(
          point.x + Math.sin(phase) * wander,
          point.y + 0.75 + Math.sin(phase * 1.9) * 0.2,
          point.z + Math.cos(phase) * wander,
        );
        orientation.setFromEuler(new Euler(-Math.PI / 2, 0, -phase));
        placement.quaternion.copy(orientation);
        placement.scale.set(0.022, 0.11, 0.022);
        placement.updateMatrix();
        bodies.setMatrixAt(index, placement.matrix);
        color.set(index % 3 === 0 ? '#eec86b' : index % 3 === 1 ? '#dbedf1' : '#d89779');
        const angle = 0.2 + Math.sin(seconds * 10 + index * 1.7) * 0.85;
        for (let side = 0; side < 2; side++) {
          flap.setFromAxisAngle(hinge, side === 0 ? angle : Math.PI - angle);
          placement.quaternion.copy(orientation).multiply(flap);
          placement.scale.setScalar(0.2);
          placement.updateMatrix();
          wings.setMatrixAt(index * 2 + side, placement.matrix);
          wings.setColorAt(index * 2 + side, color);
        }
      }
      wings.instanceMatrix.needsUpdate = true;
      bodies.instanceMatrix.needsUpdate = true;
      if (wings.instanceColor) wings.instanceColor.needsUpdate = true;
    },
  };
}
