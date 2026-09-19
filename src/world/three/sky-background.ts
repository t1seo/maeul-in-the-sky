import {
  Color,
  DataTexture,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  RGBAFormat,
  SRGBColorSpace,
  type OrthographicCamera,
} from 'three';
import type { WorldSeason, WorldView } from '../model/types.js';

export const SKY_COLORS = {
  day: {
    top: '#86b5c8',
    horizon: '#f2e6cd',
    bottom: '#b3ccd0',
    cloud: '#fff7e8',
    key: '#fff0d6',
    fill: '#d0e7ed',
  },
  sunset: {
    top: '#596d91',
    horizon: '#edb694',
    bottom: '#c49494',
    cloud: '#f9d1b5',
    key: '#ffad70',
    fill: '#acbedc',
  },
  night: {
    top: '#0b1429',
    horizon: '#283b58',
    bottom: '#405574',
    cloud: '#667c9a',
    key: '#c5dcff',
    fill: '#7388ab',
  },
} as const;

export function createSkyBackground() {
  const data = new Uint8Array(128 * 4);
  const texture = new DataTexture(data, 1, 128, RGBAFormat);
  texture.colorSpace = SRGBColorSpace;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  const mesh = new Mesh(
    new PlaneGeometry(2, 2),
    new MeshBasicMaterial({
      map: texture,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    }),
  );
  mesh.name = 'sky-gradient';
  mesh.renderOrder = -1000;
  mesh.frustumCulled = false;
  let paletteKey = '';
  function update(view: WorldView, season: WorldSeason, camera: OrthographicCamera) {
    const key = `${view.lighting}:${season}`;
    if (key !== paletteKey) {
      paletteKey = key;
      const palette = SKY_COLORS[view.lighting];
      const top = new Color(palette.top);
      const horizon = new Color(palette.horizon);
      if (season === 'winter')
        horizon.lerp(new Color('#e1edf4'), view.lighting === 'night' ? 0.08 : 0.3);
      if (season === 'spring') horizon.lerp(new Color('#f0d8d0'), 0.1);
      const bottom = new Color(palette.bottom);
      for (let row = 0; row < 128; row++) {
        const t = row / 127;
        const color =
          t < 0.48
            ? bottom.clone().lerp(horizon, t / 0.48)
            : horizon.clone().lerp(top, (t - 0.48) / 0.52);
        color.convertLinearToSRGB();
        data.set(
          [Math.round(color.r * 255), Math.round(color.g * 255), Math.round(color.b * 255), 255],
          row * 4,
        );
      }
      texture.needsUpdate = true;
    }
    camera.updateMatrixWorld(true);
    mesh.position.set(0, 0, -camera.far * 0.97).applyMatrix4(camera.matrixWorld);
    mesh.quaternion.copy(camera.quaternion);
    mesh.scale.set(camera.right / camera.zoom, camera.top / camera.zoom, 1);
  }
  return { mesh, update };
}
