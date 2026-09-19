import { text } from '../app/dom.js';
import { activityPeriod, numberText } from './format.js';
import { PAGE_SIZE, pager } from './paging.js';
import type { Pages, PageTarget } from './paging.js';
import type { AnalyticsModel } from './types.js';

function table(
  caption: string,
  headers: readonly string[],
  rows: readonly (readonly string[])[],
  page = 0,
  target?: PageTarget,
): HTMLElement {
  const wrapper = text('div', '', 'analytics-table-wrap');
  const node = text('table', '', 'analytics-data-table');
  node.append(text('caption', caption));
  const head = document.createElement('thead');
  const heading = document.createElement('tr');
  for (const label of headers) {
    const cell = text('th', label);
    cell.scope = 'col';
    heading.append(cell);
  }
  head.append(heading);
  const body = document.createElement('tbody');
  for (const row of rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)) {
    const line = document.createElement('tr');
    for (const [index, value] of row.entries()) {
      if (index === 0) {
        const cell = text('th', value);
        cell.scope = 'row';
        line.append(cell);
      } else line.append(text('td', value));
    }
    body.append(line);
  }
  node.append(head, body);
  wrapper.append(node);
  const navigation = target ? pager(target, page, rows.length) : undefined;
  if (navigation) wrapper.append(navigation);
  return wrapper;
}

export function renderTables(model: AnalyticsModel, pages: Pages): DocumentFragment {
  const fragment = document.createDocumentFragment();
  const counts = model.trend.map((point) => [
    point.label,
    point.total === null ? 'No observations' : numberText(point.total),
    numberText(point.observedDays),
    numberText(point.missingDays),
    point.partial ? 'Partial period' : 'Complete',
  ]);
  fragment.append(
    table(
      'Contribution periods',
      ['Period (UTC)', 'Observed contributions', 'Observed days', 'Missing days', 'Coverage'],
      counts,
      pages['table-trend'],
      'table-trend',
    ),
  );
  const months = model.breakdown.map(({ month, activity }) => [
    month,
    activity ? activityPeriod(activity) : 'Not available',
    numberText(activity?.commits),
    numberText(activity?.pullRequests),
    numberText(activity?.issues),
    numberText(activity?.reviews),
    numberText(activity?.repositories),
    numberText(activity?.restricted),
  ]);
  fragment.append(
    table(
      'Monthly contributions · recorded intervals',
      [
        'Month',
        'Recorded UTC interval',
        'Commit contributions',
        'PRs opened',
        'Issues opened',
        'PR review contributions',
        'Repositories created',
        'Restricted contributions',
      ],
      months,
      pages['table-breakdown'],
      'table-breakdown',
    ),
  );
  fragment.append(
    table(
      'Weekday contributions',
      ['Weekday (UTC)', 'Observed contributions', 'Observed days', 'Missing days'],
      model.weekdays.map((point) => [
        point.label,
        point.total === null ? 'No observations' : numberText(point.total),
        numberText(point.observedDays),
        numberText(point.missingDays),
      ]),
    ),
  );
  return fragment;
}
