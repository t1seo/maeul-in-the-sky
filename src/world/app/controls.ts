import { z } from 'zod';
import type { WorldSession } from './session.js';
import { action, button, click, html, input, select, status } from './dom.js';
import { dateAt, dayOffset } from './presentation.js';

export function setupControls(session: WorldSession, signal: AbortSignal): () => void {
  let playback: number | undefined;
  const stop = (): void => {
    if (playback !== undefined) window.clearInterval(playback);
    playback = undefined;
    button('replay-play').textContent = '재생';
    button('replay-play').setAttribute('aria-pressed', 'false');
  };
  const seek = (date: string): void => {
    const day = session.current().scene.days.find((item) => item.date === date);
    if (!day) {
      status('이 세계 안의 날짜를 선택해 주세요.', true);
      return;
    }
    session.update({ cursorDate: date, selectedId: day.id, followActorId: undefined });
  };
  const change = (id: string, task: (value: string) => void | Promise<void>): void => {
    select(id).addEventListener('change', () => action(() => task(select(id).value)), { signal });
  };
  click('mode-map', () => session.switchRenderer('map'), signal);
  click('mode-three', () => session.switchRenderer('three'), signal);
  click('reset-view', () => session.reset(), signal);
  for (const [id, multiplier] of [
    ['zoom-in', 1.3],
    ['zoom-out', 1 / 1.3],
  ] as const) {
    click(
      id,
      () => {
        const { camera } = session.current().view;
        session.update({
          camera: { ...camera, zoom: Math.max(0.2, Math.min(12, camera.zoom * multiplier)) },
        });
      },
      signal,
    );
  }
  change('world-layout', (value) =>
    session.rebuild({ layout: z.enum(['archipelago', 'island', 'seasonal']).parse(value) }),
  );
  change('world-culture', (value) =>
    session.rebuild({ culture: z.enum(['classic', 'korean']).parse(value) }),
  );
  change('world-hemisphere', (value) =>
    session.rebuild({ hemisphere: z.enum(['north', 'south']).parse(value) }),
  );
  change('world-season', (value) =>
    session.update({
      seasonOverride: z.enum(['calendar', 'spring', 'summer', 'autumn', 'winter']).parse(value),
    }),
  );
  change('world-lighting', (value) =>
    session.update({ lighting: z.enum(['day', 'sunset', 'night']).parse(value) }),
  );
  change('world-weather', (value) =>
    session.update({ weather: z.enum(['seasonal', 'clear', 'rain', 'snow']).parse(value) }),
  );
  change('world-motion', (value) =>
    session.update({ motion: z.enum(['full', 'subtle', 'off']).parse(value) }),
  );
  change('world-quality', (value) =>
    session.update({ quality: z.enum(['low', 'high']).parse(value) }),
  );
  change('actor-follow', (actorId) => {
    if (!actorId) {
      session.update({ followActorId: undefined, focus: { kind: 'world' } });
      return;
    }
    const actor = session.current().scene.actors.find((item) => item.id === actorId);
    if (actor) session.focus({ kind: 'actor', actorId: actor.id });
  });
  input('world-date').addEventListener(
    'change',
    () =>
      action(() => {
        stop();
        seek(input('world-date').value);
      }),
    { signal },
  );
  input('replay-range').addEventListener(
    'input',
    () =>
      action(() => {
        stop();
        const { range } = session.current().scene;
        const offset = z.coerce
          .number()
          .int()
          .min(0)
          .max(dayOffset(range.from, range.to))
          .parse(input('replay-range').value);
        seek(dateAt(range.from, offset));
      }),
    { signal },
  );
  click(
    'focus-date',
    () => {
      const date = input('world-date').value;
      if (session.current().scene.days.some((day) => day.date === date))
        session.focus({ kind: 'day', date });
    },
    signal,
  );
  click(
    'replay-play',
    () => {
      if (playback !== undefined) {
        stop();
        return;
      }
      const { scene, view } = session.current();
      if (!scene.days.length) return;
      if (view.cursorDate >= scene.range.to) seek(scene.range.from);
      button('replay-play').textContent = '일시 정지';
      button('replay-play').setAttribute('aria-pressed', 'true');
      playback = window.setInterval(() => {
        action(() => {
          const current = session.current();
          if (current.view.cursorDate >= current.scene.range.to) {
            stop();
            return;
          }
          seek(dateAt(current.view.cursorDate, 1));
        });
      }, 650);
    },
    signal,
  );
  const unsubscribe = session.subscribe((change) => {
    if (change === 'scene') stop();
  });
  document.addEventListener(
    'visibilitychange',
    () => {
      if (document.hidden) stop();
    },
    { signal },
  );
  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  media.addEventListener(
    'change',
    () => {
      if (media.matches) {
        stop();
        session.update({ motion: 'off' });
      }
    },
    { signal },
  );
  html('world-host').addEventListener(
    'keydown',
    (event) => {
      if (event.target !== html('world-host')) return;
      if (event.key === 'Home') {
        event.preventDefault();
        session.reset();
      }
    },
    { signal },
  );
  return () => {
    stop();
    unsubscribe();
  };
}
