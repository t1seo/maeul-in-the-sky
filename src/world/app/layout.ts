import { calendarSeason } from '../model/dates.js';
import type { WorldSettings } from '../model/types.js';
import type { WorldSession } from './session.js';
import { cardButton, html, text } from './dom.js';
import { monthLabel } from './date-labels.js';

export const LAYOUT_LABELS = {
  archipelago: 'Monthly islands',
  island: 'One large island',
  seasonal: 'Seasonal islands',
  'seasonal-circle': 'Four-season circle',
} as const satisfies Record<WorldSettings['layout'], string>;

const LAYOUT_NOTES = {
  archipelago: 'Each month becomes an island. Explore your records one month at a time.',
  island: 'All months connect into one island, from January to December.',
  seasonal:
    'Months in the same season share an island. A full year has four islands; shorter ranges show only the seasons included.',
  'seasonal-circle':
    'One round sky island with four seasonal landscapes and waterfalls. Dates keep their own month and year; unrecorded areas remain scenery.',
} as const satisfies Record<WorldSettings['layout'], string>;

export const CALENDAR_SEASON_LABELS = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
} as const;

export function paintLayout(session: WorldSession, rebuildNavigation: boolean): void {
  const { scene, view } = session.current();
  html('map-caption').textContent =
    `${view.cursorDate.slice(0, 4)} · ${LAYOUT_LABELS[scene.settings.layout]}`;
  html('layout-note').textContent = LAYOUT_NOTES[scene.settings.layout];
  if (rebuildNavigation) {
    const months = [...new Set(scene.days.map((day) => day.monthKey))].sort();
    const multipleYears = months[0]?.slice(0, 4) !== months.at(-1)?.slice(0, 4);
    html('season-legend').replaceChildren(
      ...Object.entries(CALENDAR_SEASON_LABELS).flatMap(([season, label]) => {
        const group = months.filter(
          (month) => calendarSeason(`${month}-15`, scene.settings.hemisphere) === season,
        );
        if (group.length === 0 && scene.settings.layout !== 'seasonal-circle') return [];
        const item = text('li', '');
        item.dataset.season = season;
        item.append(
          text('strong', label),
          text(
            'span',
            group.length === 0
              ? 'Landscape only · No records'
              : group
                  .map((month, index) => {
                    const year = month.slice(0, 4);
                    const showYear =
                      multipleYears && (index === 0 || year !== group[index - 1]?.slice(0, 4));
                    return `${monthLabel(month, 'short')}${showYear ? ` ${year}` : ''}`;
                  })
                  .join(' · '),
          ),
        );
        return [item];
      }),
    );
    html('month-nav').replaceChildren(
      ...months.map((month, index) => {
        const year = month.slice(0, 4);
        const showYear = index === 0 || year !== months[index - 1]?.slice(0, 4);
        const season = calendarSeason(`${month}-15`, scene.settings.hemisphere);
        const node = cardButton(
          `${monthLabel(month, 'short')}${showYear ? ` ${year}` : ''}`,
          () => {
            const last = scene.days.filter((day) => day.monthKey === month).at(-1);
            if (last) session.update({ cursorDate: last.date, selectedId: last.id });
            session.focus({ kind: 'month', monthKey: month });
          },
        );
        node.dataset.month = month;
        node.dataset.season = season;
        node.setAttribute(
          'aria-label',
          `${monthLabel(month)} ${year} · ${CALENDAR_SEASON_LABELS[season]} scenery`,
        );
        return node;
      }),
    );
  }
  for (const node of html('month-nav').querySelectorAll<HTMLButtonElement>('button')) {
    if (node.dataset.month === view.cursorDate.slice(0, 7))
      node.setAttribute('aria-current', 'date');
    else node.removeAttribute('aria-current');
  }
}
