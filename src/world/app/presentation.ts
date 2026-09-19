import { frameWorld, weatherForMonth } from '../model/index.js';
import type { WorldDay, WorldScene, WorldView } from '../model/types.js';
import type { WorldSession } from './session.js';
import { button, html, input, select, text } from './dom.js';
import { sourcePeriod } from './incoming.js';
import { CALENDAR_SEASON_LABELS, paintLayout } from './layout.js';
import { monthLabel } from './date-labels.js';

export const SEASON_LABELS = {
  calendar: 'Calendar seasons',
  ...CALENDAR_SEASON_LABELS,
} as const;
export const LIGHT_LABELS = { day: 'Daylight', sunset: 'Sunset', night: 'Starlight' } as const;
export const WEATHER_LABELS = {
  seasonal: 'Seasonal weather',
  clear: 'Clear',
  rain: 'Rain',
  snow: 'Snow',
} as const;
export const DAY_MS = 86_400_000;

export function dateAt(start: string, offset: number): string {
  return new Date(Date.parse(`${start}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);
}

export function dayOffset(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS);
}

export function dateLabel(date: string): string {
  return `${monthLabel(date)} ${Number(date.slice(8, 10))}, ${date.slice(0, 4)}`;
}

export function atmosphereLabel(view: WorldView, scene: WorldScene): string {
  const weather =
    view.weather === 'seasonal'
      ? `Seasonal weather (${monthLabel(view.cursorDate)}: ${WEATHER_LABELS[weatherForMonth(scene, view, view.cursorDate.slice(0, 7))]})`
      : WEATHER_LABELS[view.weather];
  return `${LIGHT_LABELS[view.lighting]} · ${weather}${view.seasonOverride === 'calendar' ? '' : ` · ${SEASON_LABELS[view.seasonOverride]} scenery`}`;
}

function showDay(day: WorldDay | undefined, cursorDate: string): void {
  const target = html('day-details');
  target.replaceChildren();
  if (!day) {
    target.append(text('p', 'No records were provided for this date.'));
    return;
  }
  if (day.date > cursorDate) {
    target.append(text('p', 'This date has not appeared yet. Move the replay forward to see it.'));
    return;
  }
  switch (day.kind) {
    case 'missing':
      target.append(text('p', 'This date is missing and does not count as zero contributions.'));
      break;
    case 'observed': {
      target.append(
        text(
          'strong',
          `${day.count.toLocaleString('en-US')} contribution${day.count === 1 ? '' : 's'}`,
        ),
      );
      target.append(
        text(
          'p',
          day.count === 0
            ? 'A quiet day. Your village landscape remains.'
            : `This day’s records grew into a tier ${day.rewardTier} landscape.`,
        ),
      );
      target.append(
        text(
          'p',
          `Last 28 days: ${day.consistency.activeDays} active · ${day.consistency.observedDays} observed${day.consistency.complete ? '' : ' (partial coverage)'}`,
        ),
      );
      break;
    }
    default:
      day satisfies never;
  }
}

export function paintWorld(session: WorldSession, rebuildNavigation = false): void {
  const current = session.current();
  const { scene, view, sourceSnapshot } = current;
  const frame = frameWorld(scene, view);
  const source = sourceSnapshot.source;
  const selectedDate = scene.entities.find((entity) => entity.id === view.selectedId)?.date;
  const selected =
    scene.days.find(
      (day) =>
        day.id === view.selectedId || day.date === view.selectedId || day.date === selectedDate,
    ) ?? scene.days.find((day) => day.date === view.cursorDate);
  const sample = source.kind === 'sample';
  html('world-title').textContent = sample ? 'My Sky World' : `${scene.username}’s Sky World`;
  html('world-source').textContent =
    `${sample ? 'Sample records' : source.kind === 'github' ? 'GitHub records' : 'Imported records'} · @${scene.username}`;
  html('world-period').textContent = `Observed ${sourcePeriod(current)}`;
  html('world-provenance').textContent =
    `Days observed: ${frame.stats.observedDays} · Missing: ${frame.stats.missingDays}${source.fetchedAt ? ` · Retrieved ${source.fetchedAt.slice(0, 10)}` : ''}${sample ? ' · Sample data, not a real account.' : ''}`;
  html('stat-contributions').textContent = frame.stats.totalContributions.toLocaleString('en-US');
  html('stat-active').textContent = String(frame.stats.activeDays);
  html('stat-streak').textContent = String(frame.stats.longestStreak);
  paintLayout(session, rebuildNavigation);
  html('replay-label').textContent = dateLabel(view.cursorDate);
  html('replay-start').textContent = scene.range.from;
  html('replay-end').textContent = scene.range.to;
  input('replay-range').max = String(Math.max(0, dayOffset(scene.range.from, scene.range.to)));
  input('replay-range').value = String(dayOffset(scene.range.from, view.cursorDate));
  input('world-date').min = scene.range.from;
  input('world-date').max = scene.range.to;
  input('world-date').value = selected?.date ?? view.cursorDate;
  showDay(selected, view.cursorDate);
  button('mode-map').setAttribute('aria-pressed', String(session.mode() === 'map'));
  button('mode-three').setAttribute('aria-pressed', String(session.mode() === 'three'));
  html('world-host').dataset.renderer = session.mode();
  document.body.dataset.lighting = view.lighting;
  for (const [id, value] of Object.entries({
    'world-layout': scene.settings.layout,
    'world-culture': scene.settings.culture,
    'world-hemisphere': scene.settings.hemisphere,
    'world-season': view.seasonOverride,
    'world-lighting': view.lighting,
    'world-weather': view.weather,
    'world-motion': view.motion,
    'world-quality': view.quality,
  }))
    select(id).value = value;
  html('season-note').textContent =
    view.seasonOverride === 'calendar'
      ? 'Seasons follow the dates in your records.'
      : `${SEASON_LABELS[view.seasonOverride]} scenery is shown. Records, seasonal rewards and island seasons are unchanged.`;
  html('weather-note').textContent =
    view.weather === 'seasonal'
      ? `Current island weather: ${WEATHER_LABELS[weatherForMonth(scene, view, view.cursorDate.slice(0, 7))]}. Each island’s sky and gentle motion follow its calendar season.`
      : `Weather set to ${WEATHER_LABELS[view.weather]}. Choose Seasonal weather to restore weather based on each island’s dates.`;
  html('photo-period').textContent = dateLabel(view.cursorDate);
  html('photo-caption').textContent = `${scene.username}’s Sky World${sample ? ' · Sample' : ''}`;
  html('photo-atmosphere').textContent = atmosphereLabel(view, scene);
  button('export-glb').disabled = !session.renderer.current()?.capabilities.glb;
  html('model-export-note').textContent =
    session.mode() === 'three'
      ? 'Save the current scene as a static 3D model.'
      : 'Switch to 3D walk to save a 3D model.';
  html('discovery-summary').textContent =
    `${frame.discoveries.length} ${frame.discoveries.length === 1 ? 'place' : 'places'} to discover`;
  html('project-summary').textContent = current.repositoryData.length
    ? `${current.repositoryData.length} public project${current.repositoryData.length === 1 ? '' : 's'}`
    : 'Public repositories and releases';
  html('world-events').textContent = frame.events.length
    ? `${frame.events.length} ${frame.events.length === 1 ? 'event or landmark is' : 'events and landmarks are'} visible in this landscape.`
    : 'Seasonal stories are waiting to unfold.';
  const follow = select('actor-follow');
  const signature = frame.actors.map((actor) => actor.id).join('|');
  if (follow.dataset.actors !== signature) {
    const names = {
      train: 'Little train',
      ferry: 'Ferry',
      wildlife: 'Woodland animal',
      resident: 'Villager',
    } as const;
    follow.replaceChildren(
      new Option('Free exploration', ''),
      ...frame.actors.map(
        (actor, index) => new Option(`${names[actor.kind]} ${index + 1}`, actor.id),
      ),
    );
    follow.dataset.actors = signature;
  }
  follow.value = view.followActorId ?? '';
}
