import { svgNumber } from '../../core/svg.js';
import type { WorldFrame, WorldScene, WorldView } from '../model/types.js';
import { renderMapLabels } from './labels.js';
import { mapPalette } from './palette.js';
import { MAP_VIEWPORT, mapTransform } from './projection.js';
import type { MapViewport } from './projection.js';
import { renderMapFrame } from './render.js';
import { actorTransform } from './transit.js';
import { sceneryTransform } from './scenery-motion.js';
import type { SceneryParticle } from './scenery-motion.js';
import { waterCurrentOffset } from './surface-textures.js';

export function mapElement(
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
  namespace: string,
  viewport: MapViewport = MAP_VIEWPORT,
): SVGSVGElement {
  const parsed = new DOMParser().parseFromString(
    renderMapFrame(scene, frame, view, { namespace, caption: false, viewport }),
    'image/svg+xml',
  );
  const svg = parsed.documentElement;
  if (!(svg instanceof SVGSVGElement))
    throw new TypeError('The world map did not produce a valid SVG document.');
  const element = document.importNode(svg, true);
  element.style.cssText =
    'display:block;width:100%;height:100%;overflow:hidden;touch-action:none;user-select:none';
  element.setAttribute('tabindex', '0');
  element.setAttribute('focusable', 'true');
  return element;
}

export function paintCamera(
  svg: SVGSVGElement,
  scene: WorldScene,
  frame: WorldFrame,
  view: WorldView,
  viewport: MapViewport = MAP_VIEWPORT,
): void {
  const transform = mapTransform(scene, view, viewport);
  svg
    .querySelector('.map-world')
    ?.setAttribute(
      'transform',
      `translate(${svgNumber(transform.x)} ${svgNumber(transform.y)}) scale(${transform.scale})`,
    );
  const labels = renderMapLabels(scene, frame, transform, mapPalette(frame.season, view.lighting));
  const parsed = new DOMParser().parseFromString(
    `<svg xmlns="http://www.w3.org/2000/svg">${labels}</svg>`,
    'image/svg+xml',
  );
  const group = parsed.documentElement.firstElementChild;
  if (group) svg.querySelector('.map-labels')?.replaceWith(document.importNode(group, true));
}

export function paintActors(svg: SVGSVGElement, frame: WorldFrame): void {
  const actors = new Map(frame.actors.map((actor) => [actor.id, actor]));
  for (const element of svg.querySelectorAll<SVGGElement>('[data-actor-id]')) {
    const actor = actors.get(element.dataset.actorId ?? '');
    if (actor) element.setAttribute('transform', actorTransform(actor));
  }
}

export function bindSceneryMotion(
  svg: SVGSVGElement,
  particles: readonly SceneryParticle[],
): (seconds: number) => void {
  const models = new Map(particles.map((particle) => [particle.id, particle]));
  const elements = [...svg.querySelectorAll<SVGGElement>('[data-scenery-id]')].flatMap(
    (element) => {
      const particle = models.get(element.dataset.sceneryId ?? '');
      return particle ? [{ element, particle }] : [];
    },
  );
  const currents = [...svg.querySelectorAll<SVGPathElement>('[data-water-current]')].map(
    (element) => ({ element, speed: Number(element.dataset.waterCurrent) }),
  );
  return (seconds) => {
    for (const { element, particle } of elements)
      element.setAttribute('transform', sceneryTransform(particle, seconds));
    for (const { element, speed } of currents)
      element.setAttribute('stroke-dashoffset', waterCurrentOffset(seconds, speed));
  };
}

export function paintSelection(svg: SVGSVGElement, view: WorldView): void {
  const days = [...svg.querySelectorAll<SVGGElement>('[data-day-id]')];
  const focused = document.activeElement;
  const selectionVisible = days.some((day) => day.dataset.dayId === view.selectedId);
  for (const [index, day] of days.entries()) {
    const selected = day.dataset.dayId === view.selectedId;
    day.setAttribute('aria-pressed', String(selected));
    day.classList.toggle('is-selected', selected);
    day.setAttribute('tabindex', selected || (!selectionVisible && index === 0) ? '0' : '-1');
  }
  if (focused instanceof SVGElement && svg.contains(focused)) focused.setAttribute('tabindex', '0');
}
