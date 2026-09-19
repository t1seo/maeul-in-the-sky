import {
  BufferGeometry,
  DataTexture,
  Float32BufferAttribute,
  Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  Points,
  PointsMaterial,
} from 'three';
import { weatherForMonth } from '../model/index.js';
import type { WorldScene, WorldView } from '../model/types.js';
import { atmosphereZones, zonePoint } from './season-zones.js';

function snowflake() {
  const pixels = new Uint8Array(12 * 12 * 4);
  for (let y = 0; y < 12; y++)
    for (let x = 0; x < 12; x++) {
      const radius = Math.hypot((x - 5.5) / 6, (y - 5.5) / 6);
      pixels.set(
        [255, 255, 255, Math.round(Math.max(0, 1 - radius) ** 0.6 * 255)],
        (y * 12 + x) * 4,
      );
    }
  const texture = new DataTexture(pixels, 12, 12);
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export function createWeather(scene: WorldScene) {
  const zones = atmosphereZones(scene);
  const group = new Group();
  const rainPositions = new Float32BufferAttribute(new Float32Array(224 * 6), 3);
  const snowPositions = new Float32BufferAttribute(new Float32Array(180 * 3), 3);
  const rain = new LineSegments(
    new BufferGeometry().setAttribute('position', rainPositions),
    new LineBasicMaterial({
      color: '#bdd4dc',
      transparent: true,
      opacity: 0.38,
      depthWrite: false,
    }),
  );
  const snow = new Points(
    new BufferGeometry().setAttribute('position', snowPositions),
    new PointsMaterial({
      color: '#f7faf5',
      map: snowflake(),
      size: 3.4,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    }),
  );
  rain.name = 'rain';
  snow.name = 'snow';
  rain.frustumCulled = false;
  snow.frustumCulled = false;
  group.add(rain, snow);
  function update(view: WorldView, seconds: number) {
    const rainZones = zones.filter(
      (zone) => weatherForMonth(scene, view, zone.monthKey) === 'rain',
    );
    const snowZones = zones.filter(
      (zone) => weatherForMonth(scene, view, zone.monthKey) === 'snow',
    );
    const high = view.quality === 'high';
    const rainCount = rainZones.length ? (high ? 224 : 96) : 0;
    const snowCount = snowZones.length ? (high ? 180 : 72) : 0;
    rain.visible = rainCount > 0;
    snow.visible = snowCount > 0;
    rain.geometry.setDrawRange(0, rainCount * 2);
    snow.geometry.setDrawRange(0, snowCount);
    for (let index = 0; index < rainCount; index++) {
      const zone = rainZones[index % rainZones.length];
      const point = zonePoint(zone, index);
      const phase = (((index * 0.754877 + seconds * 0.55) % 1) + 1) % 1;
      const y = point.y + 5.4 - phase * 5.6;
      rainPositions.setXYZ(index * 2, point.x, y, point.z);
      rainPositions.setXYZ(index * 2 + 1, point.x + 0.055, y - 0.38, point.z);
    }
    for (let index = 0; index < snowCount; index++) {
      const zone = snowZones[index % snowZones.length];
      const point = zonePoint(zone, index);
      const phase = (((index * 0.754877 + seconds * 0.06) % 1) + 1) % 1;
      snowPositions.setXYZ(
        index,
        point.x + Math.sin(seconds * 0.4 + index) * 0.2,
        point.y + 4.5 - phase * 4.6,
        point.z + Math.cos(seconds * 0.3 + index) * 0.14,
      );
    }
    rainPositions.needsUpdate = true;
    snowPositions.needsUpdate = true;
  }
  return { group, update };
}
