import { Color, Group, InstancedMesh, MeshStandardMaterial, Object3D, SphereGeometry } from 'three';
import { seasonForMonth } from '../model/index.js';
import type { WorldScene, WorldView } from '../model/types.js';
import { createButterflies } from './butterflies.js';
import { atmosphereZones, zonePoint } from './season-zones.js';

export function createSeasonalLife(scene: WorldScene) {
  const zones = atmosphereZones(scene).filter((zone) => zone.nature);
  const butterflies = createButterflies();
  const petals = new InstancedMesh(
    new SphereGeometry(1, 6, 4),
    new MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 }),
    80,
  );
  petals.name = 'seasonal-petals';
  petals.count = 0;
  petals.visible = false;
  petals.frustumCulled = false;
  const group = new Group().add(petals, butterflies.group);
  group.name = 'seasonal-life';
  const placement = new Object3D();
  const color = new Color();
  function update(view: WorldView, seconds: number) {
    const seasonal = zones.map((zone) => ({
      ...zone,
      season: seasonForMonth(scene, view, zone.monthKey),
    }));
    const falling = seasonal.filter((zone) => zone.season === 'spring' || zone.season === 'autumn');
    const fluttering =
      view.weather === 'rain' || view.weather === 'snow'
        ? []
        : seasonal.filter((zone) => zone.season === 'spring' || zone.season === 'summer');
    butterflies.update(fluttering, seconds, view.quality === 'high');
    const count = falling.length ? (view.quality === 'high' ? 80 : 28) : 0;
    petals.count = count;
    petals.visible = count > 0;
    for (let index = 0; index < count; index++) {
      const zone = falling[index % falling.length];
      const point = zonePoint(zone, index);
      const phase = (index * 0.754877 + seconds * 0.1) % 1;
      placement.position.set(
        point.x + Math.sin(seconds * 0.8 + index) * 0.25,
        point.y + 0.1 + (1 - phase) * 2.1,
        point.z + Math.cos(seconds * 0.65 + index) * 0.2,
      );
      placement.rotation.set(seconds * 1.6 + index, index * 0.4, Math.sin(seconds + index) * 0.8);
      const autumn = zone.season === 'autumn';
      placement.scale.set(autumn ? 0.075 : 0.055, 0.012, autumn ? 0.11 : 0.075);
      placement.updateMatrix();
      petals.setMatrixAt(index, placement.matrix);
      color.set(autumn ? (index % 2 ? '#cd8247' : '#dda45a') : index % 3 ? '#f1c8c3' : '#fff1dd');
      petals.setColorAt(index, color);
    }
    petals.instanceMatrix.needsUpdate = true;
    if (petals.instanceColor) petals.instanceColor.needsUpdate = true;
  }
  return { group, update };
}
