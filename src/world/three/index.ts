import { ACESFilmicToneMapping, PCFShadowMap, SRGBColorSpace, WebGLRenderer } from 'three';
import WebGL from 'three/addons/capabilities/WebGL.js';
import type { WorldRenderer, WorldRendererCallbacks } from '../model/renderer-types.js';
import type { WorldScene, WorldView } from '../model/types.js';
import { ThreeRendererError } from './errors.js';
import { createThreeController } from './controller.js';

export async function mountThree(
  host: HTMLElement,
  scene: WorldScene,
  view: WorldView,
  callbacks: WorldRendererCallbacks,
): Promise<WorldRenderer> {
  if (!WebGL.isWebGL2Available())
    throw new ThreeRendererError(
      'unavailable',
      'WebGL 2 is unavailable. You can explore this world in the map.',
    );
  const canvas = document.createElement('canvas');
  canvas.setAttribute(
    'aria-label',
    'Interactive 3D terrain. Drag to orbit, scroll to zoom, Home to reset.',
  );
  canvas.tabIndex = 0;
  canvas.dataset.renderer = 'three';
  canvas.style.cssText = 'display:block;width:100%;height:100%;outline-offset:-3px';
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'default',
    });
  } catch (error) {
    throw new ThreeRendererError(
      'unavailable',
      'The graphics device could not start 3D. The map remains available.',
      { cause: error },
    );
  }
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;
  host.append(canvas);
  let port: WorldRenderer | undefined;
  try {
    const controller = createThreeController(renderer, host, scene, view, callbacks);
    port = controller.api;
    await controller.prepare();
    return port;
  } catch (error) {
    if (port) port.dispose();
    else {
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    }
    if (error instanceof ThreeRendererError) throw error;
    throw new ThreeRendererError('unavailable', 'The 3D world could not be prepared.', {
      cause: error,
    });
  }
}
