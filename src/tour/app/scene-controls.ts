import type { TourRenderer } from '../render/renderer.js';
import type { TourModel } from '../types.js';
import { createTourAsset } from '../assets/index.js';
import { announce, buttonElement, canvasElement, element, formatDate } from './dom.js';
import { createTapGesture, pointerPoint } from './tap-gesture.js';
import type { MapPosition } from './map-coordinates.js';

export function bindSceneControls(
  renderer: TourRenderer,
  model: TourModel,
  signal: AbortSignal,
  closeMap: () => void,
): void {
  const canvas = canvasElement('village');
  const gesture = createTapGesture();
  let destination: MapPosition | null = null;
  buttonElement('detail-close').addEventListener(
    'click',
    () => {
      element('detail-panel').hidden = true;
    },
    { signal },
  );
  buttonElement('detail-walk').addEventListener(
    'click',
    () => {
      if (destination && renderer.navigation.teleport(destination)) {
        element('detail-panel').hidden = true;
        announce('You are now walking here. Use Q and E to turn, or drag to look around.');
      } else {
        announce('No walkable ground is available here. Choose another part of the village.');
      }
    },
    { signal },
  );
  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button === 0) gesture.start(pointerPoint(event));
    },
    { signal },
  );
  canvas.addEventListener('pointermove', (event) => gesture.move(pointerPoint(event)), { signal });
  canvas.addEventListener(
    'pointerup',
    (event) => {
      if (!gesture.finish(pointerPoint(event))) return;
      if (renderer.inspect().mode === 'walk') {
        if (renderer.teleportAt(event.clientX, event.clientY))
          announce('Moved to this spot. Your facing direction is unchanged.');
        else
          announce(
            'No walkable ground here. Click inside the village or choose a place on the map.',
          );
        return;
      }
      const cell = renderer.pick(event.clientX, event.clientY);
      if (!cell) return;
      closeMap();
      element('help-panel').hidden = true;
      buttonElement('help-toggle').setAttribute('aria-expanded', 'false');
      destination = { x: cell.week * model.cellSize, z: cell.day * model.cellSize };
      element('detail-date').textContent = formatDate(cell.date);
      element('detail-count').textContent =
        `${cell.count.toLocaleString('en-US')} GitHub contribution${cell.count === 1 ? '' : 's'}`;
      const labels = model.placements
        .filter((placement) => placement.source.anchorDate === cell.date)
        .map(
          (placement) =>
            createTourAsset(placement.source.catalogId, placement.source.variant, placement.season)
              .label,
        );
      element('detail-assets').textContent = labels.length
        ? [...new Set(labels)].join(' · ')
        : 'A quiet piece of this day’s landscape';
      element('detail-panel').hidden = false;
    },
    { signal },
  );
  for (const name of ['pointercancel', 'lostpointercapture'])
    canvas.addEventListener(name, gesture.cancel, { signal });
  window.addEventListener('blur', gesture.cancel, { signal });
}
