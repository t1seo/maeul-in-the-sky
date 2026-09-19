import { Raycaster, Vector2, type OrthographicCamera } from 'three';
import type { WorldGeometry } from './geometry-port.js';

export function attachPicking(
  canvas: HTMLCanvasElement,
  camera: OrthographicCamera,
  geometry: WorldGeometry,
  onSelect: (id: string) => void,
  signal: AbortSignal,
) {
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  let down: { readonly x: number; readonly y: number; readonly id: number } | undefined;
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button === 0 && event.isPrimary)
        down = { x: event.clientX, y: event.clientY, id: event.pointerId };
    },
    { signal },
  );
  canvas.addEventListener(
    'pointercancel',
    () => {
      down = undefined;
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerup',
    (event) => {
      const start = down;
      down = undefined;
      if (
        !start ||
        start.id !== event.pointerId ||
        Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6
      )
        return;
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      pointer.set(
        (2 * (event.clientX - rect.left)) / rect.width - 1,
        1 - (2 * (event.clientY - rect.top)) / rect.height,
      );
      camera.updateMatrixWorld(true);
      geometry.content.updateMatrixWorld(true);
      raycaster.setFromCamera(pointer, camera);
      for (const hit of raycaster.intersectObject(geometry.content, true)) {
        const id = geometry.identify(hit);
        if (id) {
          onSelect(id);
          break;
        }
      }
    },
    { signal },
  );
}
