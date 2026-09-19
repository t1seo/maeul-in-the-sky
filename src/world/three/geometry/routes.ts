import { Group, Mesh, MeshStandardMaterial } from 'three';
import type { WorldFrame, WorldRoute, WorldScene } from '../../model/types.js';
import { railSleeperCount } from '../../model/route-detail.js';
import { SurfaceBuffer } from './buffer.js';
import type { GeometryResources } from './resources.js';
import { addRibbon } from './ribbon.js';

function sleepers(route: WorldRoute): SurfaceBuffer {
  const buffer = new SurfaceBuffer();
  for (let index = 1; index < route.points.length; index += 1) {
    const a = route.points[index - 1];
    const b = route.points[index];
    if (!a || !b) continue;
    const length = Math.hypot(b.x - a.x, b.z - a.z);
    const steps = railSleeperCount(a, b);
    if (steps === 0) continue;
    const sideX = ((b.z - a.z) / length) * 0.17;
    const sideZ = (-(b.x - a.x) / length) * 0.17;
    for (let step = 0; step < steps; step += 1) {
      const t = (step + 0.5) / steps;
      const center = {
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        z: a.z + (b.z - a.z) * t,
      };
      addRibbon(
        buffer,
        [
          { x: center.x - sideX, y: center.y, z: center.z - sideZ },
          { x: center.x + sideX, y: center.y, z: center.z + sideZ },
        ],
        0.05,
        0.065,
        0.03,
      );
    }
  }
  return buffer;
}

export function createRoutes(
  scene: WorldScene,
  content: Group,
  resources: GeometryResources,
): (frame: WorldFrame) => void {
  const groups = new Map<string, Group>();
  const materials = {
    path: resources.material(new MeshStandardMaterial({ color: '#d2b88c', roughness: 0.92 })),
    ballast: resources.material(new MeshStandardMaterial({ color: '#929487', roughness: 0.97 })),
    rail: resources.material(
      new MeshStandardMaterial({ color: '#7e8788', roughness: 0.5, metalness: 0.55 }),
    ),
    wood: resources.material(new MeshStandardMaterial({ color: '#786453', roughness: 0.9 })),
  };
  const add = (
    group: Group,
    buffer: SurfaceBuffer,
    material: MeshStandardMaterial,
    label: string,
  ): void => {
    if (!buffer.positions.length) return;
    const mesh = new Mesh(resources.geometry(buffer.build()), material);
    mesh.name = `${group.name}:${label}`;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    group.add(mesh);
  };
  for (const route of scene.routes) {
    const group = new Group();
    group.name = route.id;
    group.userData = { routeId: route.id, kind: route.kind };
    const base = new SurfaceBuffer();
    switch (route.kind) {
      case 'water':
        continue;
      case 'walk':
        addRibbon(base, route.points, 0.25, 0.027, 0.025);
        add(group, base, materials.path, 'path');
        break;
      case 'rail': {
        addRibbon(base, route.points, 0.42, 0.025, 0.055);
        add(group, base, materials.ballast, 'ballast');
        const rails = new SurfaceBuffer();
        addRibbon(rails, route.points, 0.026, 0.095, 0.035, -0.115);
        addRibbon(rails, route.points, 0.026, 0.095, 0.035, 0.115);
        add(group, rails, materials.rail, 'rails');
        add(group, sleepers(route), materials.wood, 'sleepers');
        break;
      }
      default: {
        const exhaustive: never = route.kind;
        return exhaustive;
      }
    }
    group.visible = false;
    groups.set(route.id, group);
    content.add(group);
  }
  return (frame) => {
    const visible = new Set(
      frame.routes
        .filter((route) => route.visibleFrom <= frame.cursorDate)
        .map((route) => route.id),
    );
    for (const [id, group] of groups) group.visible = visible.has(id);
  };
}
