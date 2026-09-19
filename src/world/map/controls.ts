import type { WorldScene, WorldView } from '../model/types.js';
import { mapTransform, moveCamera, unprojectDelta } from './projection.js';
import type { MapPoint, MapViewport } from './projection.js';

export type MapControlPort = {
  readonly view: () => WorldView;
  readonly viewport: () => MapViewport;
  readonly change: (view: WorldView) => void;
  readonly select: (id: string) => void;
  readonly reset: () => void;
};

function targetDay(target: EventTarget | null): SVGElement | undefined {
  if (!(target instanceof Element)) return undefined;
  const day = target.closest('[data-day-id]');
  return day instanceof SVGElement ? day : undefined;
}

function localPoint(host: HTMLElement, x: number, y: number): MapPoint | undefined {
  const svg = host.querySelector('svg');
  const matrix = svg?.getScreenCTM();
  if (!matrix) return undefined;
  return new DOMPoint(x, y).matrixTransform(matrix.inverse());
}

export function bindMapControls(
  host: HTMLElement,
  scene: WorldScene,
  port: MapControlPort,
): () => void {
  const controller = new AbortController();
  const signal = controller.signal;
  const pointers = new Map<number, MapPoint>();
  let moved = false;
  let pointerDay: string | undefined;
  const zoom = (
    factor: number,
    anchor: MapPoint = { x: port.viewport().width / 2, y: port.viewport().height * 0.55 },
  ): void => {
    const view = port.view();
    const viewport = port.viewport();
    const previous = mapTransform(scene, view, viewport);
    const next = moveCamera(view, { x: 0, y: 0, z: 0 }, view.camera.zoom * factor);
    const after = mapTransform(scene, next, viewport);
    const delta = 1 / previous.scale - 1 / after.scale;
    port.change(
      moveCamera(
        next,
        unprojectDelta(
          (anchor.x - viewport.width / 2) * delta,
          (anchor.y - viewport.height * 0.55) * delta,
        ),
      ),
    );
  };
  host.addEventListener(
    'click',
    (event) => {
      const id = targetDay(event.target)?.dataset.dayId ?? pointerDay;
      pointerDay = undefined;
      if (moved) {
        moved = false;
        return;
      }
      if (id) port.select(id);
    },
    { signal },
  );
  host.addEventListener(
    'keydown',
    (event) => {
      const day = targetDay(event.target);
      const directions: Readonly<Record<string, number>> = {
        ArrowRight: 1,
        ArrowLeft: -1,
        ArrowDown: 7,
        ArrowUp: -7,
        Home: -Infinity,
        End: Infinity,
      };
      const offset = directions[event.key];
      if (day && offset !== undefined) {
        event.preventDefault();
        const days = [...host.querySelectorAll<SVGElement>('[data-day-id]')];
        const index = Math.max(0, Math.min(days.length - 1, days.indexOf(day) + offset));
        for (const entry of days) entry.setAttribute('tabindex', '-1');
        days[index]?.setAttribute('tabindex', '0');
        days[index]?.focus();
        return;
      }
      if (day && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        const id = day.dataset.dayId;
        if (id) port.select(id);
        return;
      }
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          zoom(1.25);
          break;
        case '-':
        case '_':
          event.preventDefault();
          zoom(0.8);
          break;
        case '0':
        case 'Escape':
          event.preventDefault();
          port.reset();
          break;
        case 'ArrowRight':
        case 'ArrowLeft':
        case 'ArrowDown':
        case 'ArrowUp': {
          event.preventDefault();
          const view = port.view();
          const { scale } = mapTransform(scene, view, port.viewport());
          const dx = event.key === 'ArrowRight' ? 60 : event.key === 'ArrowLeft' ? -60 : 0;
          const dy = event.key === 'ArrowDown' ? 60 : event.key === 'ArrowUp' ? -60 : 0;
          port.change(moveCamera(view, unprojectDelta(dx / scale, dy / scale)));
          break;
        }
      }
    },
    { signal },
  );
  host.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      zoom(
        Math.exp(-Math.max(-150, Math.min(150, event.deltaY)) * 0.003),
        localPoint(host, event.clientX, event.clientY),
      );
    },
    { signal, passive: false },
  );
  host.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      const point = localPoint(host, event.clientX, event.clientY);
      if (!point) return;
      pointers.set(event.pointerId, point);
      moved = false;
      pointerDay = targetDay(event.target)?.dataset.dayId;
      if (event.isTrusted) host.setPointerCapture(event.pointerId);
    },
    { signal },
  );
  host.addEventListener(
    'pointermove',
    (event) => {
      const previous = pointers.get(event.pointerId);
      const next = localPoint(host, event.clientX, event.clientY);
      if (!previous || !next) return;
      const other = [...pointers.entries()].find(([id]) => id !== event.pointerId)?.[1];
      pointers.set(event.pointerId, next);
      if (Math.hypot(next.x - previous.x, next.y - previous.y) > 2) moved = true;
      if (other) {
        const distance = Math.hypot(previous.x - other.x, previous.y - other.y);
        if (distance > 1)
          zoom(Math.hypot(next.x - other.x, next.y - other.y) / distance, {
            x: (next.x + other.x) / 2,
            y: (next.y + other.y) / 2,
          });
        return;
      }
      const view = port.view();
      const { scale } = mapTransform(scene, view, port.viewport());
      port.change(
        moveCamera(
          view,
          unprojectDelta((previous.x - next.x) / scale, (previous.y - next.y) / scale),
        ),
      );
    },
    { signal },
  );
  const release = (event: PointerEvent): void => {
    pointers.delete(event.pointerId);
    if (event.type === 'pointercancel') pointerDay = undefined;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  };
  host.addEventListener('pointerup', release, { signal });
  host.addEventListener('pointercancel', release, { signal });
  return () => {
    controller.abort();
    for (const id of pointers.keys())
      if (host.hasPointerCapture(id)) host.releasePointerCapture(id);
    pointers.clear();
  };
}
