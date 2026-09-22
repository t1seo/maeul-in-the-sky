import { loadTourModel } from '../model/load.js';
import type { TourRenderer } from '../render/renderer.js';
import { WorldDataError } from '../../world/data/errors.js';
import { InputValidationError } from '../../core/settings/errors.js';
import { renderTerrainScene } from '../../themes/terrain/scene/render.js';
import type { TourModel } from '../types.js';
import { announce, buttonElement, canvasElement, element, replaceCanvas } from './dom.js';
import { bindControls } from './controls.js';
import { presentVillage } from './presentation.js';

export function mountTour(pageUrl = location.href) {
  const lifetime = new AbortController();
  let request: AbortController | null = null;
  let renderer: TourRenderer | null = null;
  let controls: ReturnType<typeof bindControls> | null = null;
  let fallbackUrl: string | null = null;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  const motionChanged = (): void => {
    renderer?.setReducedMotion(media.matches);
    element('motion-note').textContent = media.matches
      ? '기기의 동작 줄이기 설정에 따라 풍경은 정지하고 시점은 즉시 이동합니다.'
      : '마을 투어를 누르면 계절을 따라 천천히 이동합니다.';
  };
  const fail = (message: string): void => {
    element('loading-screen').hidden = false;
    element('loading-title').textContent = '잠시, 마을 입구에서';
    element('loading-message').textContent = message;
    element('loading-screen').querySelector('progress')?.setAttribute('hidden', '');
    element('retry').hidden = false;
    element('fallback-link').hidden = false;
    announce(message);
  };
  const load = async (): Promise<void> => {
    request?.abort();
    controls?.dispose();
    renderer?.dispose();
    controls = null;
    renderer = null;
    replaceCanvas('village');
    if (fallbackUrl) URL.revokeObjectURL(fallbackUrl);
    fallbackUrl = null;
    element('fallback-image').hidden = true;
    request = new AbortController();
    const current = request;
    element('loading-screen').hidden = false;
    element('loading-title').textContent = '마을로 가는 길';
    element('loading-message').textContent = '기록 속 풍경을 펼치고 있습니다.';
    element('loading-screen').querySelector('progress')?.removeAttribute('hidden');
    element('retry').hidden = true;
    element('fallback-link').hidden = true;
    let loaded: TourModel | null = null;
    try {
      const { model, source } = await loadTourModel({ pageUrl, signal: current.signal });
      loaded = model;
      const { createTourRenderer } = await import('../render/renderer.js');
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (current.signal.aborted || disposed) return;
      presentVillage(model, source);
      renderer = createTourRenderer(canvasElement('village'), model, {
        reducedMotion: media.matches,
        onChange: () => controls?.refresh(),
        onError: fail,
      });
      controls = bindControls(renderer, model);
      motionChanged();
      element('loading-screen').hidden = true;
      document.title = `@${model.scene.username}의 마을 산책 · Maeul`;
      announce('마을에 도착했습니다. 계절을 선택하거나 직접 걸어보세요.');
    } catch (error) {
      if (current.signal.aborted || disposed) return;
      if (loaded) {
        fallbackUrl = URL.createObjectURL(
          new Blob([renderTerrainScene(loaded.scene, 'light', { motion: 'off' })], {
            type: 'image/svg+xml',
          }),
        );
        const image = element('fallback-image');
        image.setAttribute('src', fallbackUrl);
        image.hidden = false;
      }
      if (error instanceof WorldDataError) {
        fail(
          error.code === 'not_found'
            ? '마을 기록을 찾지 못했습니다. 공개된 snapshot 링크인지 확인해 주세요.'
            : error.code === 'too_large'
              ? '이 마을 기록은 불러오기 용량을 초과했습니다.'
              : '마을 기록을 불러오지 못했습니다. 공개된 GitHub snapshot 주소와 연결을 확인해 주세요.',
        );
      } else if (error instanceof InputValidationError) {
        fail(
          '마을 기록의 형식이 올바르지 않습니다. Maeul에서 내보낸 snapshot JSON을 사용해 주세요.',
        );
      } else {
        fail(
          '3D 마을을 열지 못했습니다. WebGL을 지원하는 최신 Chrome에서 다시 열어 주세요. Calendar 마을은 계속 볼 수 있습니다.',
        );
      }
    }
  };
  buttonElement('retry').addEventListener(
    'click',
    () => {
      void load();
    },
    { signal: lifetime.signal },
  );
  media.addEventListener('change', motionChanged, { signal: lifetime.signal });
  const dispose = (): void => {
    if (disposed) return;
    disposed = true;
    lifetime.abort();
    request?.abort();
    controls?.dispose();
    renderer?.dispose();
    if (fallbackUrl) URL.revokeObjectURL(fallbackUrl);
  };
  window.addEventListener(
    'pagehide',
    (event) => {
      if (event.persisted) renderer?.navigation.stop();
      else dispose();
    },
    { signal: lifetime.signal },
  );
  void load();
  return { dispose, reload: load, inspect: () => renderer?.inspect() ?? null };
}

if (typeof document !== 'undefined' && document.getElementById('tour-app')) mountTour();
