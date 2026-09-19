import { describe, expect, it } from 'vitest';
import { Mesh, OrthographicCamera } from 'three';
import { TINY_WORLD_SCENE } from '../../../src/world/model/fixture.js';
import { defaultWorldView } from '../../../src/world/model/index.js';
import { createAtmosphere } from '../../../src/world/three/atmosphere.js';

describe('volumetric world atmosphere', () => {
  it.each(['day', 'sunset', 'night'] as const)(
    'shows the proper celestial bodies for %s',
    (lighting) => {
      const sky = createAtmosphere(TINY_WORLD_SCENE);
      const camera = new OrthographicCamera(-10, 10, 8, -8, 0.1, 200);
      camera.position.set(10, 10, 10);
      camera.lookAt(0, 0, 0);

      sky.update({ ...defaultWorldView(TINY_WORLD_SCENE), lighting }, 'spring', camera, 0);

      expect(sky.group.getObjectByName('sun')?.visible).toBe(lighting !== 'night');
      expect(sky.group.getObjectByName('moon')?.visible).toBe(lighting === 'night');
      expect(sky.group.getObjectByName('stars')?.visible).toBe(lighting === 'night');
      const moon = sky.group.getObjectByName('moon-surface');
      expect(moon).toBeInstanceOf(Mesh);
      if (!(moon instanceof Mesh)) throw new TypeError('Moon must have mesh depth');
      expect(moon.geometry.getAttribute('position').count).toBeGreaterThan(100);
      sky.dispose();
    },
  );

  it.each(['clear', 'rain', 'snow'] as const)('bounds precipitation for %s', (weather) => {
    const sky = createAtmosphere(TINY_WORLD_SCENE);

    sky.update(
      { ...defaultWorldView(TINY_WORLD_SCENE), weather },
      'winter',
      new OrthographicCamera(),
      10,
    );

    expect(sky.group.getObjectByName('rain')?.visible).toBe(weather === 'rain');
    expect(sky.group.getObjectByName('snow')?.visible).toBe(weather === 'snow');
    sky.dispose();
    expect(sky.group.children).toHaveLength(0);
  });
});
