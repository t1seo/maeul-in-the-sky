import type { SnapshotV1 } from '../../core/snapshot-types.js';
import { dialog, select } from '../app/dom.js';
import type { WorldSession } from '../app/session.js';
import { monthText } from './format.js';
import { setupChartInteraction } from './interaction.js';
import { buildAnalytics } from './model.js';
import { initialPages } from './paging.js';
import type { PageTarget } from './paging.js';
import { renderAnalytics } from './render.js';
import type { AnalyticsModel, Granularity } from './types.js';

function granularity(value: string): Granularity {
  switch (value) {
    case 'day':
    case 'week':
    case 'month':
      return value;
    default:
      return 'week';
  }
}

export function setupAnalytics(
  session: WorldSession,
  signal: AbortSignal,
): { readonly refresh: () => void } {
  const month = select('analytics-month');
  const grouping = select('analytics-granularity');
  const root = dialog('analytics-dialog');
  let source: SnapshotV1 | undefined;
  let model: AnalyticsModel | undefined;
  let selection = '';
  let group: Granularity | undefined;
  let pages = initialPages();
  let width = 0;

  function refresh(): void {
    if (signal.aborted) return;
    const current = session.current().sourceSnapshot;
    const nextGroup = granularity(grouping.value);
    const dataChanged = current !== source || month.value !== selection || nextGroup !== group;
    if (!dataChanged && width === root.clientWidth) return;
    if (current !== source) {
      const available = buildAnalytics(current);
      const previous = month.value;
      month.replaceChildren(
        new Option('All history', ''),
        ...available.months.map((key) => new Option(monthText(key), key)),
      );
      month.value = available.months.includes(previous) ? previous : '';
    }
    source = current;
    selection = month.value;
    group = nextGroup;
    width = root.clientWidth;
    if (dataChanged) {
      model = buildAnalytics(current, selection, group);
      pages = initialPages();
    }
    if (model) renderAnalytics(model, pages);
  }

  month.addEventListener('change', refresh, { signal });
  grouping.addEventListener('change', refresh, { signal });
  setupChartInteraction(root, signal);
  const observer = new ResizeObserver(() => {
    if (root.open && model) refresh();
  });
  if (!signal.aborted) observer.observe(root);
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
  root.addEventListener(
    'click',
    (event) => {
      const button =
        event.target instanceof Element
          ? event.target.closest('button[data-analytics-target]')
          : null;
      if (!(button instanceof HTMLButtonElement) || button.disabled || !model) return;
      const target = button.dataset.analyticsTarget;
      let key: PageTarget;
      switch (target) {
        case 'trend':
        case 'breakdown':
        case 'table-trend':
        case 'table-breakdown':
          key = target;
          break;
        default:
          return;
      }
      const page = Number(button.dataset.analyticsPage);
      if (!Number.isInteger(page) || page < 0) return;
      pages = { ...pages, [key]: page };
      const focusId = button.id;
      renderAnalytics(model, pages);
      const next = document.getElementById(focusId);
      if (next instanceof HTMLButtonElement && !next.disabled) next.focus();
      else
        root
          .querySelector<HTMLButtonElement>(`button[data-analytics-target="${key}"]:not(:disabled)`)
          ?.focus();
    },
    { signal },
  );
  return { refresh };
}
