import { text } from '../app/dom.js';

export const PAGE_SIZE = 160;
export type PageTarget = 'trend' | 'breakdown' | 'table-trend' | 'table-breakdown';
export type Pages = Readonly<Record<PageTarget, number>>;
export const initialPages = (): Pages => ({
  trend: 0,
  breakdown: 0,
  'table-trend': 0,
  'table-breakdown': 0,
});

export function pager(target: PageTarget, page: number, length: number): HTMLElement | undefined {
  if (length <= PAGE_SIZE) return undefined;
  const node = text('nav', '', 'analytics-pager');
  node.setAttribute('aria-label', `${target.replaceAll('-', ' ')} pages`);
  for (const [label, offset] of [
    ['Previous', -1],
    ['Next', 1],
  ] as const) {
    const button = text('button', label);
    button.type = 'button';
    button.id = `analytics-${target}-${label.toLowerCase()}`;
    button.dataset.analyticsTarget = target;
    button.dataset.analyticsPage = String(page + offset);
    button.disabled = offset < 0 ? page === 0 : (page + 1) * PAGE_SIZE >= length;
    node.append(button);
  }
  node.append(
    text(
      'span',
      `${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, length)} of ${length}`,
    ),
  );
  return node;
}
