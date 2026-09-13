import type { TerrainRenderResult } from '../core/scene-types.js';
import type { SnapshotV1 } from '../core/snapshot-types.js';
import type { ColorMode } from '../core/types.js';
import { bindDates } from './date-navigation.js';
import { button, click, dialog, html } from './dom.js';
import { mountSvg, renderSnapshot } from './preview.js';

type TouchPoint = { readonly x: number; readonly y: number };
type PanGesture = {
  readonly pointerId: number;
  readonly origin: TouchPoint;
  readonly scrollLeft: number;
  readonly scrollTop: number;
};
type PinchGesture = {
  readonly distance: number;
  readonly width: number;
  readonly anchorX: number;
  readonly anchorY: number;
};

const distanceBetween = (points: readonly TouchPoint[]): number => {
  const [first, second] = points;
  if (!first || !second) return 0;
  return Math.hypot(second.x - first.x, second.y - first.y);
};

const centerBetween = (points: readonly TouchPoint[]): TouchPoint => {
  const [first, second] = points;
  if (!first || !second) return { x: 0, y: 0 };
  return { x: (first.x + second.x) / 2, y: (first.y + second.y) / 2 };
};

export function setupZoom(
  current: () => {
    readonly output: TerrainRenderResult;
    readonly mode: ColorMode;
    readonly snapshot: SnapshotV1;
  },
): void {
  const modal = dialog('zoom-dialog');
  const viewport = html('zoom-viewport');
  const content = html('zoom-content');
  const touches = new Map<number, TouchPoint>();
  let width = 1680;
  let pan: PanGesture | undefined;
  let pinch: PinchGesture | undefined;
  const setWidth = (next: number): number => {
    width = Math.max(420, Math.min(5040, next));
    content.style.width = `${width}px`;
    return width;
  };
  const resize = (factor: number): void => {
    const before = content.getBoundingClientRect();
    const anchorX = (viewport.scrollLeft + viewport.clientWidth / 2) / before.width;
    const anchorY = (viewport.scrollTop + viewport.clientHeight / 2) / before.height;
    setWidth(width * factor);
    const after = content.getBoundingClientRect();
    viewport.scrollTo(
      anchorX * after.width - viewport.clientWidth / 2,
      anchorY * after.height - viewport.clientHeight / 2,
    );
  };
  const reset = (): void => {
    setWidth(Math.max(840, viewport.clientWidth * 1.5));
    const terrain = [...content.querySelectorAll<SVGGraphicsElement>('.terrain-fit')].find(
      (candidate) => candidate.getClientRects().length > 0,
    );
    if (!terrain) throw new TypeError('Zoom Terrain geometry is missing');
    const viewportBounds = viewport.getBoundingClientRect();
    const terrainBounds = terrain.getBoundingClientRect();
    viewport.scrollTo(
      viewport.scrollLeft +
        terrainBounds.left +
        terrainBounds.width / 2 -
        (viewportBounds.left + viewportBounds.width / 2),
      viewport.scrollTop +
        terrainBounds.top +
        terrainBounds.height / 2 -
        (viewportBounds.top + viewportBounds.height / 2),
    );
  };
  const beginPan = (pointerId: number, point: TouchPoint): void => {
    pan = {
      pointerId,
      origin: point,
      scrollLeft: viewport.scrollLeft,
      scrollTop: viewport.scrollTop,
    };
  };
  const beginPinch = (): void => {
    const points = [...touches.values()].slice(0, 2);
    const distance = distanceBetween(points);
    if (distance === 0) return;
    const center = centerBetween(points);
    const viewportBox = viewport.getBoundingClientRect();
    const contentBox = content.getBoundingClientRect();
    pinch = {
      distance,
      width,
      anchorX: (viewport.scrollLeft + center.x - viewportBox.left) / contentBox.width,
      anchorY: (viewport.scrollTop + center.y - viewportBox.top) / contentBox.height,
    };
    pan = undefined;
  };
  const finishTouch = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') return;
    touches.delete(event.pointerId);
    pinch = undefined;
    const remaining = [...touches.entries()][0];
    if (remaining) beginPan(remaining[0], remaining[1]);
    else pan = undefined;
    if (viewport.hasPointerCapture(event.pointerId))
      viewport.releasePointerCapture(event.pointerId);
  };
  viewport.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch') return;
    const point = { x: event.clientX, y: event.clientY };
    touches.set(event.pointerId, point);
    viewport.setPointerCapture(event.pointerId);
    if (touches.size === 1) beginPan(event.pointerId, point);
    else if (touches.size === 2) beginPinch();
  });
  viewport.addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch' || !touches.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    touches.set(event.pointerId, point);
    event.preventDefault();
    if (touches.size >= 2 && pinch) {
      const points = [...touches.values()].slice(0, 2);
      const nextWidth = setWidth(pinch.width * (distanceBetween(points) / pinch.distance));
      const center = centerBetween(points);
      const viewportBox = viewport.getBoundingClientRect();
      const contentHeight = content.getBoundingClientRect().height;
      viewport.scrollTo(
        pinch.anchorX * nextWidth - (center.x - viewportBox.left),
        pinch.anchorY * contentHeight - (center.y - viewportBox.top),
      );
      return;
    }
    if (pan?.pointerId === event.pointerId) {
      viewport.scrollTo(
        pan.scrollLeft - (point.x - pan.origin.x),
        pan.scrollTop - (point.y - pan.origin.y),
      );
    }
  });
  viewport.addEventListener('pointerup', finishTouch);
  viewport.addEventListener('pointercancel', finishTouch);
  click('zoom-button', () => {
    const { snapshot, mode } = current();
    const output = renderSnapshot(snapshot, snapshot.settings, 'zoom');
    viewport.dataset.mode = mode;
    const root = mountSvg(content, output[mode]);
    bindDates(root, output.metadata, html('zoom-date-details'));
    modal.showModal();
    reset();
    viewport.focus();
  });
  click('close-zoom', () => modal.close());
  modal.addEventListener('close', () => {
    content.replaceChildren();
    touches.clear();
    pan = undefined;
    pinch = undefined;
    button('zoom-button').focus();
  });
  click('zoom-in', () => resize(1.25));
  click('zoom-out', () => resize(0.8));
  click('zoom-reset', reset);
  modal.addEventListener('keydown', (event) => {
    if (event.key === '+' || event.key === '=') {
      resize(1.25);
      event.preventDefault();
    }
    if (event.key === '-') {
      resize(0.8);
      event.preventDefault();
    }
    if (event.key === '0') {
      reset();
      event.preventDefault();
    }
    const direction = {
      ArrowLeft: [-80, 0],
      ArrowRight: [80, 0],
      ArrowUp: [0, -80],
      ArrowDown: [0, 80],
    }[event.key];
    if (direction) {
      viewport.scrollBy(direction[0], direction[1]);
      event.preventDefault();
    }
  });
}
