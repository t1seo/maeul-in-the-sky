import { afterEach, expect, test } from 'vitest';
import pageHtml from '../../../docs/demo/world/index.html?raw';
import { chart } from '../../../src/world/analytics/chart.js';
import { buildAnalytics } from '../../../src/world/analytics/model.js';
import { initialPages } from '../../../src/world/analytics/paging.js';
import { renderAnalytics } from '../../../src/world/analytics/render.js';
import { snapshot } from '../analytics/fixtures.js';

afterEach(() => document.body.replaceChildren());

test.each(['week', 'month'] as const)(
  'marks clipped %s totals even without missing dates',
  (granularity) => {
    const parsed = new DOMParser().parseFromString(pageHtml, 'text/html');
    for (const script of parsed.querySelectorAll('script')) script.remove();
    document.body.replaceChildren(...parsed.body.childNodes);
    const source = snapshot(
      Array.from({ length: 8 }, (_, day) => [`2024-01-0${day + 1}`, 1] as const),
    );
    renderAnalytics(buildAnalytics(source, '', granularity), initialPages());
    const points = [...document.querySelectorAll('#analytics-trend .analytics-point')];
    expect(points.length).toBeGreaterThan(0);
    for (const point of points) {
      expect(point.getAttribute('aria-label')).toContain('partial period');
      expect(point.getAttribute('data-partial')).toBe('true');
      expect(point.querySelector('circle')?.getAttribute('fill')).toBe('var(--surface, white)');
    }
  },
);

test.each([240, 360, 440])(
  'keeps all 13 monthly bar pairs separate within a %ipx plot',
  (width) => {
    const host = document.createElement('div');
    host.id = 'paired-bars';
    host.style.width = `${width}px`;
    document.body.append(host);
    const points = Array.from({ length: 26 }, (_, index) => ({
      label: String(Math.floor(index / 2)),
      description: `Monthly series ${index}`,
      value: index + 1,
      position: Math.floor(index / 2) * 3 + (index % 2),
      partial: false,
    }));
    host.append(chart(host.id, 'Monthly commit and PR contributions', points, 'bar'));
    const bars = [...host.querySelectorAll<SVGRectElement>('.analytics-bar')];
    expect(bars).toHaveLength(26);
    let previousRight = 58;
    for (const bar of bars) {
      const left = Number(bar.getAttribute('x'));
      expect(left).toBeGreaterThanOrEqual(previousRight);
      previousRight = left + Number(bar.getAttribute('width'));
    }
    expect(previousRight).toBeCloseTo(width - 18, 6);
  },
);
