import type { TerrainMetadata } from '../core/scene-types.js';
import { describeDay, showDay } from './day-details.js';
import { select } from './dom.js';

export function bindDates(
  root: SVGSVGElement,
  metadata: TerrainMetadata,
  target: HTMLElement,
): void {
  const lookup = new Map(metadata.cells.map((cell) => [cell.date, cell]));
  for (const branch of root.querySelectorAll('.terrain-blocks')) {
    const nodes = [...branch.querySelectorAll<SVGElement>('[data-date]')].sort((a, b) =>
      (a.dataset.date ?? '').localeCompare(b.dataset.date ?? ''),
    );
    for (const [index, node] of nodes.entries()) {
      const date = node.dataset.date;
      if (!date) continue;
      const cell = lookup.get(date);
      if (!cell) continue;
      node.setAttribute('tabindex', index === 0 ? '0' : '-1');
      node.setAttribute('role', 'button');
      node.setAttribute('aria-label', describeDay(cell, metadata));
      const show = (): void => {
        showDay(target, cell, metadata);
        select('date-select').value = date;
        const parent = target.closest('details');
        if (parent) parent.open = true;
      };
      node.addEventListener('pointerenter', show);
      node.addEventListener('focus', show);
      node.addEventListener('keydown', (event) => {
        const delta =
          event.key === 'ArrowRight' || event.key === 'ArrowDown'
            ? 1
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
              ? -1
              : 0;
        if (!delta) return;
        const next = nodes[index + delta];
        if (!next) return;
        event.preventDefault();
        event.stopPropagation();
        node.setAttribute('tabindex', '-1');
        next.setAttribute('tabindex', '0');
        next.focus();
      });
    }
  }
}
