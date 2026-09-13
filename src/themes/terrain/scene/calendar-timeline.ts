import type { Hemisphere, TerrainLayout } from '../../../core/render-options.js';
import type { SceneCell, TerrainScene } from '../../../core/scene-types.js';
import { svgElement, svgNumber, svgText } from '../../../core/svg.js';
import type { TerrainPalette100 } from '../palette.js';

const FONT = "'Segoe UI', system-ui, sans-serif";
const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;
const SEASON_NAMES = ['Winter', 'Spring', 'Summer', 'Autumn'] as const;

type SeasonName = (typeof SEASON_NAMES)[number];

type CalendarCue = {
  readonly date: string;
  readonly month: string;
  readonly monthName: string;
  readonly season: SeasonName;
  readonly position: number;
};

type PositionedCalendarCue = CalendarCue & {
  readonly label: string;
  readonly labelWidth: number;
  readonly x: number;
};

type TimelineGeometry = {
  readonly x: number;
  readonly width: number;
  readonly lineY: number;
  readonly labelY: number;
  readonly maximumCues: number;
};

function seasonForMonth(month: number, hemisphere: Hemisphere): SeasonName {
  const northernIndex = Math.floor((month % 12) / 3);
  const index = hemisphere === 'south' ? (northernIndex + 2) % 4 : northernIndex;
  return SEASON_NAMES[index] ?? 'Winter';
}

function cueForCell(cell: SceneCell, hemisphere: Hemisphere): CalendarCue {
  const month = cell.date.slice(0, 7);
  const monthNumber = Number(cell.date.slice(5, 7));
  return {
    date: cell.date,
    month,
    monthName: MONTH_NAMES[monthNumber - 1] ?? month,
    season: seasonForMonth(monthNumber, hemisphere),
    position: cell.week + cell.day / 7,
  };
}

export function deriveCalendarCues(
  cells: readonly SceneCell[],
  hemisphere: Hemisphere,
): readonly CalendarCue[] {
  const firstByMonth = new Map<string, SceneCell>();
  for (const cell of cells) {
    const month = cell.date.slice(0, 7);
    const existing = firstByMonth.get(month);
    if (!existing || cell.date < existing.date) firstByMonth.set(month, cell);
  }
  return [...firstByMonth.values()]
    .sort((left, right) => left.date.localeCompare(right.date))
    .map((cell) => cueForCell(cell, hemisphere));
}

function geometry(layout: TerrainLayout): TimelineGeometry {
  return layout === 'card'
    ? { x: 24, width: 372, lineY: 67, labelY: 62, maximumCues: 5 }
    : { x: 315, width: 503, lineY: 21, labelY: 14, maximumCues: 6 };
}

function labelsOverlap(left: PositionedCalendarCue, right: PositionedCalendarCue): boolean {
  return left.x + left.labelWidth / 2 + 4 > right.x - right.labelWidth / 2;
}

function samplePositionedCues(
  cues: readonly PositionedCalendarCue[],
  maximum: number,
): readonly PositionedCalendarCue[] {
  if (cues.length <= maximum) return cues;
  const sampled: PositionedCalendarCue[] = [];
  for (let index = 0; index < maximum; index++) {
    const cue = cues[Math.round((index * (cues.length - 1)) / (maximum - 1))];
    if (cue && sampled.at(-1)?.month !== cue.month) sampled.push(cue);
  }
  return sampled;
}

function positionCalendarCues(
  scene: TerrainScene,
  layout: TimelineGeometry,
): readonly PositionedCalendarCue[] {
  const cues = deriveCalendarCues(scene.cells, scene.settings.hemisphere);
  if (cues.length === 0) return [];
  let firstPosition = Number.POSITIVE_INFINITY;
  let lastPosition = Number.NEGATIVE_INFINITY;
  for (const cell of scene.cells) {
    const position = cell.week + cell.day / 7;
    firstPosition = Math.min(firstPosition, position);
    lastPosition = Math.max(lastPosition, position);
  }
  const inset = 28;
  const usableWidth = layout.width - inset * 2;
  const fontSize = scene.settings.layout === 'card' ? 7 : 8;
  const positioned = cues.map((cue) => {
    const ratio =
      lastPosition === firstPosition
        ? 0.5
        : (cue.position - firstPosition) / (lastPosition - firstPosition);
    const label = `${cue.monthName} · ${cue.season}`;
    return {
      ...cue,
      label,
      labelWidth: label.length * fontSize * 0.52,
      x: layout.x + inset + usableWidth * ratio,
    };
  });
  const seasonal = positioned.filter(
    (cue, index) => index === 0 || cue.season !== positioned[index - 1]?.season,
  );
  const finalCue = positioned.at(-1);
  if (finalCue && seasonal.at(-1)?.month !== finalCue.month) seasonal.push(finalCue);
  const candidates = samplePositionedCues(seasonal, layout.maximumCues);
  const first = candidates[0];
  const last = candidates.at(-1);
  if (!first || !last || first.month === last.month) return first ? [first] : [];
  const selected: PositionedCalendarCue[] = [first];
  for (const cue of candidates.slice(1, -1)) {
    const previous = selected.at(-1);
    if (previous && !labelsOverlap(previous, cue)) selected.push(cue);
  }
  while (selected.length > 1) {
    const previous = selected.at(-1);
    if (!previous || !labelsOverlap(previous, last)) break;
    selected.pop();
  }
  selected.push(last);
  return selected;
}

export function renderCalendarTimeline(scene: TerrainScene, palette: TerrainPalette100): string {
  const layout = geometry(scene.settings.layout);
  const cues = positionCalendarCues(scene, layout);
  const label = scene.fromDate
    ? `Calendar timeline from ${scene.fromDate} to ${scene.toDate}. ` +
      'Month and season cues follow supplied contribution dates.'
    : 'Calendar timeline. No dates supplied.';
  const line = svgElement('line', {
    x1: layout.x,
    y1: layout.lineY,
    x2: layout.x + layout.width,
    y2: layout.lineY,
    stroke: palette.text.secondary,
    'stroke-opacity': 0.45,
    'stroke-width': 0.8,
  });
  if (cues.length === 0) {
    return svgElement(
      'g',
      { class: 'calendar-timeline', role: 'group', 'aria-label': label },
      line +
        svgText(layout.x + layout.width / 2, layout.labelY, 'No dates supplied', {
          'font-family': FONT,
          'font-size': 8,
          'text-anchor': 'middle',
          fill: palette.text.secondary,
        }),
    );
  }
  const markers = cues
    .map((cue) => {
      return svgElement(
        'g',
        {
          class: 'calendar-cue',
          transform: `translate(${svgNumber(cue.x)} 0)`,
          'data-date': cue.date,
          'data-month': cue.month,
          'data-season': cue.season,
          role: 'img',
          'aria-label': `${cue.month}, ${cue.season}; first supplied date ${cue.date}`,
        },
        svgElement('circle', {
          cx: 0,
          cy: layout.lineY,
          r: 2.2,
          fill: palette.text.accent,
          stroke: palette.text.primary,
          'stroke-width': 0.6,
        }) +
          svgText(0, layout.labelY, cue.label, {
            'font-family': FONT,
            'font-size': scene.settings.layout === 'card' ? 7 : 8,
            'text-anchor': 'middle',
            fill: palette.text.secondary,
          }),
      );
    })
    .join('');
  return svgElement(
    'g',
    { class: 'calendar-timeline', role: 'group', 'aria-label': label },
    line + markers,
  );
}
