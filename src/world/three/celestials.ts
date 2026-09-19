import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Points,
  PointsMaterial,
  LinearFilter,
  RGBAFormat,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  TorusGeometry,
  type OrthographicCamera,
} from 'three';
import type { WorldView } from '../model/types.js';

function glow() {
  const data = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++)
    for (let x = 0; x < 64; x++) {
      const radius = Math.hypot((x - 31.5) / 32, (y - 31.5) / 32);
      data.set([255, 209, 148, Math.round(Math.max(0, 1 - radius) ** 2 * 180)], (y * 64 + x) * 4);
    }
  const texture = new DataTexture(data, 64, 64, RGBAFormat);
  texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return new Sprite(
    new SpriteMaterial({ map: texture, blending: AdditiveBlending, depthWrite: false }),
  );
}

export function createCelestials() {
  const group = new Group();
  const sun = new Group();
  sun.name = 'sun';
  const sunGeometry = new SphereGeometry(1, 32, 20);
  const vertices = sunGeometry.getAttribute('position');
  const colors: number[] = [];
  const warm = new Color('#efb36a');
  const cream = new Color('#fff8d7');
  for (let index = 0; index < vertices.count; index++) {
    const color = warm.clone().lerp(cream, (vertices.getY(index) + 1) / 2);
    colors.push(color.r, color.g, color.b);
  }
  sunGeometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  const sunBody = new Mesh(
    sunGeometry,
    new MeshBasicMaterial({ vertexColors: true, toneMapped: false }),
  );
  const halo = glow();
  halo.scale.setScalar(6);
  sun.add(sunBody, halo);
  const moon = new Group();
  moon.name = 'moon';
  const surface = new Mesh(
    new SphereGeometry(1, 32, 20),
    new MeshStandardMaterial({
      color: '#e3e9e6',
      roughness: 1,
      emissive: '#b9c9d9',
      emissiveIntensity: 0.22,
    }),
  );
  surface.name = 'moon-surface';
  moon.add(surface);
  const craterMaterial = new MeshStandardMaterial({ color: '#9daebb', roughness: 1 });
  const craterRim = new MeshStandardMaterial({ color: '#d4dcd9', roughness: 1 });
  for (const [x, y, radius] of [
    [-0.32, 0.25, 0.18],
    [0.28, -0.2, 0.24],
    [-0.36, -0.45, 0.09],
    [0.14, 0.52, 0.09],
    [0.48, 0.24, 0.075],
  ]) {
    const z = Math.sqrt(1 - x * x - y * y);
    const crater = new Mesh(new SphereGeometry(radius, 14, 8), craterMaterial);
    crater.position.set(x, y, z);
    crater.scale.z = 0.12;
    const rim = new Mesh(new TorusGeometry(radius, radius * 0.14, 5, 18), craterRim);
    rim.position.set(x, y, z + 0.015);
    moon.add(crater, rim);
  }
  const moonHalo = glow();
  moonHalo.material.color = new Color('#a7ccff');
  moonHalo.material.opacity = 0.35;
  moonHalo.scale.setScalar(5);
  moon.add(moonHalo);
  const starPositions: number[] = [];
  for (let index = 0; index < 160; index++) {
    starPositions.push(Math.sin(index * 127.1) * 0.96, 0.15 + ((index * 0.618033) % 1) * 0.8, -1);
  }
  const stars = new Points(
    new BufferGeometry().setAttribute('position', new Float32BufferAttribute(starPositions, 3)),
    new PointsMaterial({
      color: '#e4f0ff',
      size: 1.7,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  stars.name = 'stars';
  group.add(sun, moon, stars);
  function update(view: WorldView, camera: OrthographicCamera) {
    sun.visible = view.lighting !== 'night';
    moon.visible = view.lighting === 'night';
    stars.visible = moon.visible;
    const size = (camera.top / camera.zoom) * 0.08;
    for (const body of [sun, moon]) {
      body.position
        .set(
          (-camera.right / camera.zoom) * 0.68,
          (camera.top / camera.zoom) * 0.66,
          -camera.far * 0.82,
        )
        .applyMatrix4(camera.matrixWorld);
      body.quaternion.copy(camera.quaternion);
      body.scale.setScalar(size);
    }
    stars.position.copy(camera.position);
    stars.quaternion.copy(camera.quaternion);
    stars.scale.set(camera.right / camera.zoom, camera.top / camera.zoom, camera.far * 0.9);
    halo.material.opacity = view.lighting === 'sunset' ? 0.9 : 0.55;
  }
  return { group, update };
}
