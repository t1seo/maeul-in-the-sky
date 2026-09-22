import type { TourModel } from '../types.js';
import type { TourRenderer } from '../render/renderer.js';
import { announce, buttonElement, canvasElement, element } from './dom.js';
import { unprojectMapPoint, type MapPosition } from './map-coordinates.js';
import { drawMinimap } from './map-render.js';
import { createTapGesture, pointerPoint } from './tap-gesture.js';

export function bindMap(
  renderer: TourRenderer,
  model: TourModel,
  signal: AbortSignal,
  releaseWalking: () => void,
) {
  const canvas = canvasElement('mini-map');
  const panel = element('map-panel');
  const toggle = buttonElement('map-toggle');
  const state = renderer.inspect();
  let marker: MapPosition = model.stops[state.stopIndex]?.position ?? { x: 0, z: 0 };
  const refresh = (): void => drawMinimap(model, renderer.inspect(), marker);
  const setOpen = (open: boolean): void => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.dataset.mapOpen = String(open);
    if (open) {
      releaseWalking();
      element('detail-panel').hidden = true;
      element('help-panel').hidden = true;
      buttonElement('help-toggle').setAttribute('aria-expanded', 'false');
      refresh();
    }
  };
  const dock = buttonElement('map-dock');
  document.body.dataset.mapSide = 'right';
  dock.setAttribute('aria-label', 'Move map to bottom left');
  dock.title = 'Move map to bottom left';
  dock.addEventListener(
    'click',
    () => {
      const side = document.body.dataset.mapSide === 'right' ? 'left' : 'right';
      document.body.dataset.mapSide = side;
      const label = `Move map to bottom ${side === 'right' ? 'left' : 'right'}`;
      dock.setAttribute('aria-label', label);
      dock.title = label;
      announce(`Map moved to the bottom ${side}.`);
    },
    { signal },
  );
  const teleport = (): void => {
    if (renderer.navigation.teleport(marker)) {
      marker = renderer.inspect().position;
      announce('Moved to the map marker. Your facing direction is unchanged.');
      if (matchMedia('(max-width: 800px)').matches) setOpen(false);
    } else {
      announce('There is no walkable ground at this marker. Choose a tile inside the village.');
    }
    refresh();
  };
  toggle.addEventListener(
    'click',
    () => {
      setOpen(panel.hidden);
      if (!panel.hidden) canvas.focus({ preventScroll: true });
    },
    { signal },
  );
  buttonElement('map-close').addEventListener(
    'click',
    () => {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    },
    { signal },
  );
  buttonElement('map-walk').addEventListener('click', teleport, { signal });
  const gesture = createTapGesture();
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      gesture.start(pointerPoint(event));
    },
    { signal },
  );
  canvas.addEventListener('pointermove', (event) => gesture.move(pointerPoint(event)), { signal });
  canvas.addEventListener(
    'pointerup',
    (event) => {
      if (!gesture.finish(pointerPoint(event))) return;
      const rect = canvas.getBoundingClientRect();
      const point = unprojectMapPoint(model.bounds, canvas, {
        x: ((event.clientX - rect.left) / rect.width) * canvas.width,
        y: ((event.clientY - rect.top) / rect.height) * canvas.height,
      });
      if (!point) return;
      marker = point;
      teleport();
    },
    { signal },
  );
  for (const event of ['pointercancel', 'lostpointercapture'])
    canvas.addEventListener(event, gesture.cancel, { signal });
  canvas.addEventListener(
    'keydown',
    (event) => {
      const arrows = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
      if (!arrows.includes(event.key) && event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      if (event.key === 'Enter' || event.key === ' ') {
        teleport();
        return;
      }
      marker = {
        x: Math.max(
          model.bounds.minX + 2,
          Math.min(
            model.bounds.maxX - 2,
            marker.x + (event.key === 'ArrowLeft' ? -4 : event.key === 'ArrowRight' ? 4 : 0),
          ),
        ),
        z: Math.max(
          model.bounds.minZ + 2,
          Math.min(
            model.bounds.maxZ - 2,
            marker.z + (event.key === 'ArrowUp' ? -4 : event.key === 'ArrowDown' ? 4 : 0),
          ),
        ),
      };
      refresh();
    },
    { signal },
  );
  window.addEventListener('blur', gesture.cancel, { signal });
  window.addEventListener(
    'resize',
    () => {
      if (!panel.hidden) releaseWalking();
    },
    { signal },
  );
  setOpen(!matchMedia('(max-width: 800px)').matches);
  return { refresh, close: (): void => setOpen(false) };
}
