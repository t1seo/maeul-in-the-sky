import { calendarSeason } from '../model/dates.js';
import type { WorldSettings } from '../model/types.js';
import type { WorldSession } from './session.js';
import { cardButton, html, text } from './dom.js';

export const LAYOUT_LABELS = {
  archipelago: '월별 군도',
  island: '하나의 큰 섬',
  seasonal: '사계절 군도',
} as const satisfies Record<WorldSettings['layout'], string>;

const LAYOUT_NOTES = {
  archipelago: '한 달이 하나의 섬이 됩니다. 월별 풍경을 오가며 기록을 둘러보세요.',
  island: '월별 땅이 하나로 이어집니다. 한 해의 1월부터 12월까지 한 섬에서 만날 수 있어요.',
  seasonal:
    '같은 계절의 달을 한 섬으로 모읍니다. 한 해는 네 섬, 일부 기간은 해당 계절만 펼쳐집니다.',
} as const satisfies Record<WorldSettings['layout'], string>;

export const CALENDAR_SEASON_LABELS = {
  spring: '봄',
  summer: '여름',
  autumn: '가을',
  winter: '겨울',
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
        if (group.length === 0) return [];
        const item = text('li', '');
        item.dataset.season = season;
        item.append(
          text('strong', label),
          text(
            'span',
            group
              .map((month, index) => {
                const year = month.slice(0, 4);
                const showYear =
                  multipleYears && (index === 0 || year !== group[index - 1]?.slice(0, 4));
                return `${showYear ? `${year}년 ` : ''}${Number(month.slice(5))}월`;
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
          `${showYear ? `${year.slice(2)}년 ` : ''}${Number(month.slice(5))}월`,
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
          `${year}년 ${Number(month.slice(5))}월 · ${CALENDAR_SEASON_LABELS[season]} 풍경`,
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
