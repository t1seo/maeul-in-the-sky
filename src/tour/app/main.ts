import { loadTourModel } from '../model/load.js';
import type { TourRenderer } from '../render/renderer.js';
import { WorldDataError } from '../../world/data/errors.js';
import { InputValidationError } from '../../core/settings/errors.js';
import { renderTerrainScene } from '../../themes/terrain/scene/render.js';
import type { TourModel } from '../types.js';
import { announce, buttonElement, canvasElement, element, replaceCanvas } from './dom.js';
import { bindControls } from './controls.js';
import { presentVillage } from './presentation.js';
import { WildlifeLoadError } from '../wildlife/download.js';
import { AuthoredLoadError } from '../authored/download.js';
import type { TourAssets } from './assets.js';

export function mountTour(pageUrl = location.href, options: { readonly assetBaseUrl?: URL } = {}) {
  const lifetime = new AbortController();
  let request: AbortController | null = null;
  let renderer: TourRenderer | null = null;
  let assets: TourAssets | null = null;
  let controls: ReturnType<typeof bindControls> | null = null;
  let fallbackUrl: string | null = null;
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false;
  const motionChanged = (): void => {
    renderer?.setReducedMotion(media.matches);
    element('motion-note').textContent = media.matches
      ? 'Reduced motion is on. The scenery stays still and viewpoint changes are instant.'
      : 'Start the guided tour to travel slowly through the seasons.';
  };
  const fail = (message: string): void => {
    element('loading-screen').hidden = false;
    element('loading-title').textContent = 'The village could not open';
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
    assets?.dispose();
    controls = null;
    renderer = null;
    assets = null;
    replaceCanvas('village');
    if (fallbackUrl) URL.revokeObjectURL(fallbackUrl);
    fallbackUrl = null;
    element('fallback-image').hidden = true;
    request = new AbortController();
    const current = request;
    element('loading-screen').hidden = false;
    element('loading-title').textContent = 'On the way to your village';
    element('loading-message').textContent = 'Bringing your contribution history to life.';
    element('loading-screen').querySelector('progress')?.removeAttribute('hidden');
    element('retry').hidden = true;
    element('fallback-link').hidden = true;
    let loaded: TourModel | null = null;
    try {
      const { model, source } = await loadTourModel({ pageUrl, signal: current.signal });
      loaded = model;
      const [{ createTourRenderer }, { loadTourAssets }] = await Promise.all([
        import('../render/renderer.js'),
        import('./assets.js'),
      ]);
      const loadedAssets = await loadTourAssets(
        model,
        options.assetBaseUrl ?? new URL('../models/', import.meta.url),
        current.signal,
      );
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      if (current.signal.aborted || disposed) {
        loadedAssets.dispose();
        return;
      }
      assets = loadedAssets;
      presentVillage(model, source);
      renderer = createTourRenderer(canvasElement('village'), model, {
        reducedMotion: media.matches,
        onChange: () => controls?.refresh(),
        onNavigationFrame: () => controls?.refreshNavigation(),
        onError: fail,
        wildlife: assets.wildlife,
        authored: assets.authored,
      });
      controls = bindControls(renderer, model);
      motionChanged();
      element('loading-screen').hidden = true;
      document.title = `@${model.scene.username}'s village tour · Maeul`;
      announce(
        'Welcome to your village. Choose a season, start walking, or pick a place on the map.',
      );
    } catch (error) {
      if (current.signal.aborted || disposed) return;
      renderer?.dispose();
      assets?.dispose();
      renderer = null;
      assets = null;
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
            ? 'Village history was not found. Check that the snapshot link is public.'
            : error.code === 'too_large'
              ? 'This village history exceeds the download size limit.'
              : 'Village history could not load. Check the public GitHub snapshot link and your connection.',
        );
      } else if (error instanceof WildlifeLoadError || error instanceof AuthoredLoadError) {
        fail(error.message);
      } else if (error instanceof InputValidationError) {
        fail('This village history has an invalid format. Use a snapshot JSON exported by Maeul.');
      } else {
        fail(
          'The 3D village could not open. Try a current version of Chrome with WebGL enabled. You can still view the original Calendar village.',
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
    assets?.dispose();
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
