import { Group } from 'three';
import type { WorldScene } from '../../model/types.js';
import type { WorldGeometry } from '../geometry-port.js';
import { createRecipeInstances } from './instances.js';
import { GeometryResources } from './resources.js';
import { createRoutes } from './routes.js';
import { createSelection } from './selection.js';
import { createTerrain } from './terrain.js';
import { createWaterways } from './waterways.js';

export function createWorldGeometry(scene: WorldScene): WorldGeometry {
  const content = new Group();
  content.name = `world:${scene.worldId}`;
  content.visible = false;
  const resources = new GeometryResources();
  const terrain = createTerrain(scene, content, resources);
  const waterways = createWaterways(scene, content, resources);
  const routes = createRoutes(scene, content, resources);
  const instances = createRecipeInstances(scene, content, resources);
  const select = createSelection(content, resources);
  let disposed = false;
  return {
    content,
    update: (frame, view) => {
      if (disposed) return;
      terrain.update(frame, view);
      waterways(view);
      routes(frame);
      instances.update(frame, view);
      select(frame, view);
      content.visible = true;
      content.updateMatrixWorld(true);
    },
    identify: (hit) => {
      if (disposed || !content.visible || !hit.object.visible) return undefined;
      return instances.identify(hit) ?? terrain.identify(hit);
    },
    dispose: () => {
      if (disposed) return;
      disposed = true;
      resources.dispose();
      content.clear();
    },
  };
}
