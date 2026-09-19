import { DirectionalLight, Group, HemisphereLight, Vector3, type OrthographicCamera } from 'three';
import type { WorldScene, WorldSeason, WorldView } from '../model/types.js';
import { createSkyBackground, SKY_COLORS } from './sky-background.js';
import { createCelestials } from './celestials.js';
import { createClouds } from './clouds.js';
import { createWeather } from './weather.js';
import { disposeObjectTree } from './resources.js';
import { createSeasonalLife } from './seasonal-life.js';

export function createAtmosphere(scene: WorldScene) {
  const bounds = scene.bounds;
  const group = new Group();
  group.name = 'atmosphere';
  const background = createSkyBackground();
  const celestials = createCelestials();
  const clouds = createClouds();
  const weather = createWeather(scene);
  const life = createSeasonalLife(scene);
  const fill = new HemisphereLight('#d0e7ed', '#6f7756', 2);
  const key = new DirectionalLight('#fff0d6', 3.2);
  const center = new Vector3().addVectors(bounds.min, bounds.max).multiplyScalar(0.5);
  const radius = Math.max(8, new Vector3().subVectors(bounds.max, bounds.min).length() * 0.7);
  key.position.copy(center).add(new Vector3(-radius, radius * 1.7, radius * 0.6));
  key.target.position.copy(center);
  key.castShadow = true;
  key.shadow.camera.left = -radius;
  key.shadow.camera.right = radius;
  key.shadow.camera.top = radius;
  key.shadow.camera.bottom = -radius;
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = radius * 5;
  key.shadow.normalBias = 0.04;
  key.shadow.bias = -0.00015;
  key.shadow.camera.updateProjectionMatrix();
  group.add(
    background.mesh,
    celestials.group,
    clouds.mesh,
    weather.group,
    life.group,
    fill,
    key,
    key.target,
  );
  return {
    group,
    update(view: WorldView, season: WorldSeason, camera: OrthographicCamera, seconds: number) {
      const palette = SKY_COLORS[view.lighting];
      fill.color.set(palette.fill);
      fill.intensity = view.lighting === 'night' ? 1.2 : 2.2;
      key.color.set(palette.key);
      key.intensity = view.lighting === 'night' ? 1.2 : view.lighting === 'sunset' ? 2.5 : 3.2;
      const mapSize = view.quality === 'high' ? 2048 : 1024;
      if (key.shadow.mapSize.x !== mapSize) {
        key.shadow.map?.dispose();
        key.shadow.map = null;
        key.shadow.mapSize.setScalar(mapSize);
        key.shadow.needsUpdate = true;
      }
      background.update(view, season, camera);
      celestials.update(view, camera);
      clouds.update(view, camera, seconds);
      weather.update(view, seconds);
      life.update(view, seconds);
    },
    dispose() {
      key.shadow.dispose();
      disposeObjectTree(group);
    },
  };
}
