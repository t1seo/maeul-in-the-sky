import { text } from '../app/dom.js';
import { PAGE_SIZE, pager } from './paging.js';
import type { PageTarget } from './paging.js';

export type PlotPoint = {
  readonly label: string;
  readonly description: string;
  readonly value: number | null;
  readonly position: number;
  readonly partial: boolean;
  readonly className?: string;
};

export function svg<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Readonly<Record<string, string | number>> = {},
  content = '',
): SVGElementTagNameMap[K] {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [key, value] of Object.entries(attributes)) node.setAttribute(key, String(value));
  node.textContent = content;
  return node;
}

export function chart(
  id: string,
  title: string,
  points: readonly PlotPoint[],
  kind: 'line' | 'bar',
  page = 0,
  target?: PageTarget,
): HTMLElement {
  const figure = text('figure', '', 'analytics-figure');
  if (!points.length) {
    figure.append(text('p', 'No observations in this period.', 'analytics-empty'));
    return figure;
  }
  const visible = points.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const width = Math.max(240, Math.min(1200, document.getElementById(id)?.clientWidth || 360));
  const left = 58;
  const right = width - 18;
  const plotWidth = right - left;
  const canvas = svg('svg', {
    class: 'analytics-chart',
    viewBox: `0 0 ${width} 240`,
    role: 'group',
    'aria-labelledby': `${id}-svg-title ${id}-svg-description`,
  });
  canvas.append(svg('title', { id: `${id}-svg-title` }, title));
  canvas.append(
    svg(
      'desc',
      { id: `${id}-svg-description` },
      'Observed totals with a zero baseline. Missing observations are gaps; partial totals are marked. Focus a value and use arrow keys to explore. Exact values are also in the data tables.',
    ),
  );
  const maximum = Math.max(1, ...points.map((point) => point.value ?? 0));
  const ticks = [...new Set([0, Math.ceil(maximum / 2), maximum])];
  const y = (value: number): number => 196 - (value / maximum) * 166;
  const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
  for (const tick of ticks) {
    canvas.append(
      svg('line', { x1: left, x2: right, y1: y(tick), y2: y(tick), class: 'analytics-grid' }),
    );
    canvas.append(
      svg(
        'text',
        { x: 50, y: y(tick) + 4, 'text-anchor': 'end', class: 'analytics-axis' },
        compact.format(tick),
      ),
    );
  }
  const first = visible[0]?.position ?? 0;
  const last = visible.at(-1)?.position ?? first;
  let step = last - first || 1;
  let previous = first;
  for (const point of visible.slice(1)) {
    step = Math.min(step, point.position - previous);
    previous = point.position;
  }
  const barWidth = Math.min(30, ((plotWidth * step) / (last - first + step)) * 0.72);
  const inset = kind === 'bar' ? barWidth / 2 : 4;
  const x = (point: PlotPoint): number =>
    last === first
      ? (left + right) / 2
      : left + inset + ((point.position - first) / (last - first)) * (plotWidth - 2 * inset);
  const labels: { readonly text: string; readonly x: number }[] = [];
  let segment: string[] = [];
  const flush = (): void => {
    if (segment.length > 1)
      canvas.append(svg('polyline', { points: segment.join(' '), class: 'analytics-trend-line' }));
    segment = [];
  };
  if (kind === 'line') {
    for (const point of visible) {
      if (point.value === null || point.partial) flush();
      else segment.push(`${x(point)},${y(point.value)}`);
    }
    flush();
  }
  for (const [index, point] of visible.entries()) {
    const center = x(point);
    const node = svg('g', {
      class: 'analytics-point',
      tabindex: index === 0 ? '0' : '-1',
      role: 'img',
      'aria-label': point.description,
      'data-tooltip': point.description,
      'data-value': point.value === null ? 'unavailable' : point.value,
      'data-partial': String(point.partial),
    });
    node.append(svg('title', {}, point.description));
    node.append(
      svg('rect', {
        x: center - barWidth / 2,
        y: 22,
        width: barWidth,
        height: 180,
        fill: 'transparent',
      }),
    );
    if (point.value === null) {
      node.append(
        svg('text', { x: center, y: 197, 'text-anchor': 'middle', class: 'analytics-gap' }, '×'),
      );
    } else if (kind === 'bar') {
      node.append(
        svg('rect', {
          x: center - barWidth / 2,
          y: y(point.value),
          width: barWidth,
          height: Math.max(0, 196 - y(point.value)),
          rx: 2,
          class: `analytics-bar ${point.className ?? ''}`,
        }),
      );
      if (point.value === 0)
        node.append(
          svg('circle', { cx: center, cy: 196, r: 3, fill: 'none', stroke: 'currentColor' }),
        );
    } else {
      node.append(
        svg('circle', {
          cx: center,
          cy: y(point.value),
          r: 3.5,
          fill: point.partial ? 'var(--surface, white)' : '#526f53',
          stroke: '#526f53',
          'stroke-width': 1.5,
        }),
      );
    }
    canvas.append(node);
    if (labels.at(-1)?.text !== point.label) labels.push({ text: point.label, x: center });
  }
  const finalLabel = labels.at(-1);
  const finalLabelLeft = finalLabel ? finalLabel.x - finalLabel.text.length * 6.5 : right;
  let previousLabelRight = -Infinity;
  for (const [index, label] of labels.entries()) {
    const anchor = index === 0 ? 'start' : index === labels.length - 1 ? 'end' : 'middle';
    const labelWidth = label.text.length * 6.5;
    const labelLeft =
      label.x - (anchor === 'start' ? 0 : anchor === 'end' ? labelWidth : labelWidth / 2);
    const labelRight = labelLeft + labelWidth;
    if (
      labelLeft >= previousLabelRight + 10 &&
      (index === 0 || index === labels.length - 1 || labelRight <= finalLabelLeft - 10)
    ) {
      canvas.append(
        svg(
          'text',
          {
            x: label.x,
            y: 223,
            'text-anchor': anchor,
            class: 'analytics-axis',
          },
          label.text,
        ),
      );
      previousLabelRight = labelRight;
    }
  }
  const tooltip = text('output', 'Focus or point to a value for details.', 'analytics-tooltip');
  tooltip.id = `${id}-tooltip`;
  tooltip.setAttribute('aria-live', 'polite');
  figure.append(canvas, tooltip);
  const navigation = target ? pager(target, page, points.length) : undefined;
  if (navigation) figure.append(navigation);
  return figure;
}
