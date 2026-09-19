export function setupChartInteraction(root: HTMLElement, signal: AbortSignal): void {
  const pointFor = (target: EventTarget | null): SVGElement | undefined => {
    const point = target instanceof Element ? target.closest('.analytics-point') : null;
    return point instanceof SVGElement ? point : undefined;
  };
  const show = (point: SVGElement): void => {
    const figure = point.closest('.analytics-figure');
    const tooltip = figure?.querySelector('output');
    if (tooltip) tooltip.textContent = point.dataset.tooltip ?? '';
  };
  for (const event of ['pointerover', 'focusin', 'click']) {
    root.addEventListener(
      event,
      (event) => {
        const point = pointFor(event.target);
        if (point) show(point);
      },
      { signal },
    );
  }
  root.addEventListener(
    'keydown',
    (event) => {
      const point = pointFor(event.target);
      if (!point) return;
      const points = [
        ...(point.closest('svg')?.querySelectorAll<SVGElement>('.analytics-point') ?? []),
      ];
      const current = points.indexOf(point);
      let index: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          index = Math.min(current + 1, points.length - 1);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          index = Math.max(current - 1, 0);
          break;
        case 'Home':
          index = 0;
          break;
        case 'End':
          index = points.length - 1;
          break;
        case 'Escape': {
          const tooltip = point.closest('.analytics-figure')?.querySelector('output');
          if (tooltip?.textContent) {
            tooltip.textContent = '';
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        default:
          return;
      }
      event.preventDefault();
      for (const [offset, entry] of points.entries())
        entry.setAttribute('tabindex', offset === index ? '0' : '-1');
      points[index]?.focus();
    },
    { signal },
  );
}
