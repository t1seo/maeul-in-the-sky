import { dateTime } from '../model/dates.js';
import { html, text } from '../app/dom.js';
import { chart } from './chart.js';
import type { PlotPoint } from './chart.js';
import { activityPeriod, bucketText, monthText, numberText } from './format.js';
import type { Pages } from './paging.js';
import { renderTables } from './tables.js';
import type { AnalyticsModel } from './types.js';

export function renderAnalytics(model: AnalyticsModel, pages: Pages): void {
  const { summary, monthlySums } = model;
  html('analytics-account').textContent = `${model.username} · Activity`;
  html('analytics-period').textContent = model.range
    ? `${model.range.from} – ${model.range.to} (UTC calendar dates)`
    : 'No observed history';
  const sourceLabels = {
    sample: 'Sample data',
    github: 'GitHub contribution history',
    import: 'Imported contribution history',
  } as const;
  html('analytics-source').textContent =
    `${sourceLabels[model.source.kind]}. Original saved history, independent of replay.${model.source.fetchedAt ? ` Retrieved ${model.source.fetchedAt}.` : ''}`;
  const sumNote = monthlySums
    ? `Sum of ${monthlySums.months} recorded monthly intervals`
    : 'Not available in this snapshot';
  const metrics = [
    ['Contributions', numberText(summary.contributions), 'Total over observed calendar dates'],
    ['Commit contributions', numberText(monthlySums?.commits), sumNote],
    ['PRs opened', numberText(monthlySums?.pullRequests), sumNote],
    [
      'Active days',
      numberText(summary.activeDays),
      summary.observedDays
        ? `Longest observed streak: ${summary.longestStreak} days; ending streak: ${summary.currentStreak} days`
        : 'No observed dates',
    ],
  ];
  html('analytics-metrics').replaceChildren(
    ...metrics.map(([label, value, note]) => {
      const card = text('article', '', 'analytics-metric');
      card.append(
        text('h3', label, 'analytics-metric-label'),
        text('p', value, 'analytics-metric-value'),
        text('p', note, 'analytics-metric-note'),
      );
      return card;
    }),
  );
  const expected = summary.observedDays + summary.missingDays;
  html('analytics-coverage').textContent =
    `${summary.observedDays} of ${expected} calendar days observed${expected ? ` (${Math.round((summary.observedDays / expected) * 100)}%)` : ''}; ${summary.missingDays} missing days. Missing dates are gaps, not zero. Partial periods show known contributions only.`;
  html('analytics-availability').textContent = monthlySums
    ? `${monthlySums.months} of ${model.breakdown.length} months have commit and PR data. Totals sum these monthly records and may differ from the contribution calendar.`
    : 'Not available in this snapshot. Commit and PR counts require recorded GitHub monthly activity; daily contribution totals cannot provide this breakdown.';
  const trend: readonly PlotPoint[] = model.trend.map((point) => ({
    label: point.from.slice(5),
    description: bucketText(point),
    value: point.total,
    position: (dateTime(point.from) + dateTime(point.to)) / 2,
    partial: point.partial,
  }));
  html('analytics-trend').replaceChildren(
    chart('analytics-trend', 'Contribution rhythm', trend, 'line', pages.trend, 'trend'),
  );
  const weekdays: readonly PlotPoint[] = model.weekdays.map((point, index) => ({
    label: point.label.slice(0, 3),
    description: bucketText(point),
    value: point.total,
    position: index,
    partial: point.partial,
  }));
  html('analytics-weekdays').replaceChildren(
    chart('analytics-weekdays', 'Contributions by UTC weekday', weekdays, 'bar'),
  );
  if (!monthlySums)
    html('analytics-breakdown').replaceChildren(
      text('p', 'Not available in this snapshot', 'analytics-empty'),
    );
  else {
    const points = model.breakdown.flatMap(({ month, activity }, index) =>
      [
        { label: 'Commit contributions', key: 'commits', value: activity?.commits ?? null },
        { label: 'PRs opened', key: 'pull-requests', value: activity?.pullRequests ?? null },
      ].map((series, offset): PlotPoint => ({
        label: monthText(month),
        description: `${month} · ${series.label}: ${numberText(series.value)}${activity ? `; ${activityPeriod(activity)}` : '; no recorded breakdown'}.`,
        value: series.value,
        position: index * 3 + offset,
        partial: activity === undefined,
        className: `analytics-series-${series.key}`,
      })),
    );
    const figure = chart(
      'analytics-breakdown',
      'Monthly commit contributions and PRs opened',
      points,
      'bar',
      pages.breakdown,
      'breakdown',
    );
    figure.prepend(
      text('figcaption', 'Green: commit contributions · Gold: PRs opened', 'analytics-legend'),
    );
    html('analytics-breakdown').replaceChildren(figure);
  }
  html('analytics-table').replaceChildren(renderTables(model, pages));
}
