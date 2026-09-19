import { frameWorld, weatherForMonth } from '../model/index.js';
import type { WorldDay, WorldScene, WorldView } from '../model/types.js';
import type { WorldSession } from './session.js';
import { button, html, input, select, text } from './dom.js';
import { sourcePeriod } from './incoming.js';
import { CALENDAR_SEASON_LABELS, paintLayout } from './layout.js';

export const SEASON_LABELS = {
  calendar: '기록의 계절',
  ...CALENDAR_SEASON_LABELS,
} as const;
export const LIGHT_LABELS = { day: '맑은 낮', sunset: '해 질 녘', night: '별이 뜬 밤' } as const;
export const WEATHER_LABELS = {
  seasonal: '계절 따라',
  clear: '맑음',
  rain: '비',
  snow: '눈',
} as const;
export const DAY_MS = 86_400_000;

export function dateAt(start: string, offset: number): string {
  return new Date(Date.parse(`${start}T00:00:00Z`) + offset * DAY_MS).toISOString().slice(0, 10);
}

export function dayOffset(start: string, end: string): number {
  return Math.round((Date.parse(`${end}T00:00:00Z`) - Date.parse(`${start}T00:00:00Z`)) / DAY_MS);
}

export function dateLabel(date: string): string {
  return `${date.slice(0, 4)}년 ${Number(date.slice(5, 7))}월 ${Number(date.slice(8, 10))}일`;
}

export function atmosphereLabel(view: WorldView, scene: WorldScene): string {
  const weather =
    view.weather === 'seasonal'
      ? `계절 따라 (${Number(view.cursorDate.slice(5, 7))}월 ${WEATHER_LABELS[weatherForMonth(scene, view, view.cursorDate.slice(0, 7))]})`
      : WEATHER_LABELS[view.weather];
  return `${LIGHT_LABELS[view.lighting]} · ${weather}${view.seasonOverride === 'calendar' ? '' : ` · ${SEASON_LABELS[view.seasonOverride]} 연출`}`;
}

function showDay(day: WorldDay | undefined, cursorDate: string): void {
  const target = html('day-details');
  target.replaceChildren();
  if (!day) {
    target.append(text('p', '이 날짜에는 기록이 제공되지 않았습니다.'));
    return;
  }
  if (day.date > cursorDate) {
    target.append(text('p', '아직 펼치지 않은 날짜입니다. 재생 날짜를 앞으로 옮겨 보세요.'));
    return;
  }
  switch (day.kind) {
    case 'missing':
      target.append(text('p', '제공되지 않은 날짜입니다. 0회 기여로 계산하지 않습니다.'));
      break;
    case 'observed': {
      target.append(text('strong', `${day.count.toLocaleString('ko-KR')}번의 기여`));
      target.append(
        text(
          'p',
          day.count === 0
            ? '쉬어 간 날입니다. 마을의 풍경은 그대로 남아 있어요.'
            : `이날의 기록이 ${day.rewardTier}단계 풍경으로 자랐습니다.`,
        ),
      );
      target.append(
        text(
          'p',
          `최근 28일 중 ${day.consistency.activeDays}일 활동 · ${day.consistency.observedDays}일 관측${day.consistency.complete ? '' : ' (일부 기간만 관측)'}`,
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
  html('world-title').textContent = sample ? '나의 하늘 마을' : `${scene.username}님의 하늘 마을`;
  html('world-source').textContent =
    `${sample ? '샘플 기록' : source.kind === 'github' ? 'GitHub 기록' : '가져온 기록'} · @${scene.username}`;
  html('world-period').textContent = `관측 ${sourcePeriod(current)}`;
  html('world-provenance').textContent =
    `${frame.stats.observedDays}일 관측 · ${frame.stats.missingDays}일 미제공${source.fetchedAt ? ` · ${source.fetchedAt.slice(0, 10)} 수집` : ''}${sample ? ' · 실제 계정을 조회한 데이터가 아닙니다.' : ''}`;
  html('stat-contributions').textContent = frame.stats.totalContributions.toLocaleString('ko-KR');
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
      ? '기록의 날짜에 맞는 계절을 보여 줍니다.'
      : `${SEASON_LABELS[view.seasonOverride]}로 연출한 풍경입니다. 원래 기록과 계절 보상, 섬의 계절 구분은 그대로입니다.`;
  html('weather-note').textContent =
    view.weather === 'seasonal'
      ? `현재 날짜의 섬은 ${WEATHER_LABELS[weatherForMonth(scene, view, view.cursorDate.slice(0, 7))]}입니다. 각 섬은 기록의 계절에 맞는 하늘과 작은 움직임을 보여 줍니다.`
      : `${WEATHER_LABELS[view.weather]}로 연출한 풍경입니다. ‘계절 따라’를 고르면 섬마다 날짜에 맞는 날씨로 돌아갑니다.`;
  html('photo-period').textContent = dateLabel(view.cursorDate);
  html('photo-caption').textContent = `${scene.username}님의 하늘 마을${sample ? ' · 샘플' : ''}`;
  html('photo-atmosphere').textContent = atmosphereLabel(view, scene);
  button('export-glb').disabled = !session.renderer.current()?.capabilities.glb;
  html('model-export-note').textContent =
    session.mode() === 'three'
      ? '지금 펼쳐진 장면을 정적인 입체 모델로 보관합니다.'
      : '3D 모델은 3D 산책에서 저장하실 수 있습니다.';
  html('discovery-summary').textContent = `${frame.discoveries.length}개의 장소가 기다려요`;
  html('project-summary').textContent = current.repositoryData.length
    ? `${current.repositoryData.length}개의 공개 프로젝트`
    : '공개 저장소와 릴리스';
  html('world-events').textContent = frame.events.length
    ? `지금 풍경에 ${frame.events.length}개의 행사와 기념 장소가 있습니다.`
    : '계절의 이야기를 기다리고 있어요.';
  const follow = select('actor-follow');
  const signature = frame.actors.map((actor) => actor.id).join('|');
  if (follow.dataset.actors !== signature) {
    const names = {
      train: '작은 열차',
      ferry: '나룻배',
      wildlife: '숲속 동물',
      resident: '마을 주민',
    } as const;
    follow.replaceChildren(
      new Option('자유롭게 둘러보기', ''),
      ...frame.actors.map(
        (actor, index) => new Option(`${names[actor.kind]} ${index + 1}`, actor.id),
      ),
    );
    follow.dataset.actors = signature;
  }
  follow.value = view.followActorId ?? '';
}
