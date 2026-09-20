import { sampleSnapshot } from '../demo/sample.js';
import { clamp } from '../utils/math.js';
import { element, input, select } from './dom.js';
import { fillDatePicker, inspectDate } from './inspection.js';
import { buildTerrainModel } from './model.js';
import { renderLandscape } from './render.js';
import type { Lighting } from './projection.js';
import type { TerrainLayout, TerrainOptions } from './types.js';

const CAPTIONS: Readonly<Record<TerrainLayout, string>> = {
  island: '하나의 넓은 섬에 해안 마을, 숲, 능선이 함께 놓입니다.',
  archipelago: '네 개의 서로 다른 섬 사이로 빈 공간을 두어 풍경을 나눕니다.',
  valley: '두 능선 사이의 낮은 땅과 물길을 중심으로 마을이 이어집니다.',
};

function main(): void {
  const days = sampleSnapshot().weeks.flatMap((week) => week.days);
  let options: TerrainOptions = { layout: 'island', seed: 41, relief: 1, roughness: 0.65 };
  let model = buildTerrainModel(days, options);
  let lighting: Lighting = 'day';
  let density = 0.7;
  let records = false;
  let comparing = false;
  let zoom = 1;
  let selectedDate = '';
  const scene = element('scene');
  fillDatePicker(model);
  element('metric-days').textContent = `${days.length}일`;
  element('metric-total').textContent =
    `${days.reduce((total, day) => total + day.count, 0).toLocaleString('ko-KR')}회`;
  element('metric-active').textContent = `${days.filter((day) => day.count > 0).length}일`;

  const updateZoom = (): void => {
    document
      .getElementById('landscape-view')
      ?.setAttribute('transform', `translate(600 420) scale(${zoom}) translate(-600 -420)`);
    const preview = scene.querySelector('img');
    if (preview) preview.style.transform = `scale(${zoom})`;
    element('reset-view').textContent =
      zoom === 1 ? '전체 보기' : `${Math.round(zoom * 100)}% · 복원`;
  };
  const draw = (): void => {
    document.documentElement.dataset.lighting = lighting;
    element('lighting').setAttribute('aria-pressed', String(lighting === 'night'));
    element('lighting').textContent = lighting === 'night' ? '낮 풍경' : '밤 풍경';
    element('compare').setAttribute('aria-pressed', String(comparing));
    element('compare').textContent = comparing ? '자연 지형으로 돌아가기' : '기존 달력형 비교';
    element('seed-label').textContent = `Seed ${options.seed}`;
    if (comparing) {
      const preview = document.createElement('img');
      preview.className = 'calendar-preview';
      preview.alt = '현재 프로젝트의 달력형 Terrain: 자연 지형과 동일한 원본 샘플 기여 기록';
      preview.src = `./calendar-${lighting === 'day' ? 'light' : 'dark'}.svg`;
      scene.replaceChildren(preview);
      element('layout-caption').textContent =
        '같은 날짜와 기여량을 기존 주·요일 배치로 표현한 실제 SVG입니다.';
      element('scene-status').textContent = `${days.length}일 보존 · 기존 달력형`;
    } else {
      const result = renderLandscape(model, { lighting, density, records });
      scene.innerHTML = result.svg;
      element('layout-caption').textContent = CAPTIONS[options.layout];
      element('scene-status').textContent =
        `${model.plots.length}일 보존 · 풍경 에셋 ${result.assetCount}개 · 전시 원더 ${result.showcaseCount}개`;
      if (selectedDate) inspectDate(model, selectedDate);
    }
    updateZoom();
  };
  const rebuild = (): void => {
    model = buildTerrainModel(days, options);
    comparing = false;
    zoom = 1;
    draw();
  };
  for (const radio of document.querySelectorAll('input[name="layout"]')) {
    radio.addEventListener('change', () => {
      if (!(radio instanceof HTMLInputElement)) return;
      const layout = radio.value;
      if (layout !== 'island' && layout !== 'archipelago' && layout !== 'valley') return;
      options = { ...options, layout };
      rebuild();
    });
  }
  for (const id of ['relief', 'coast', 'density']) {
    input(id).addEventListener('input', () => {
      element(`${id}-value`).textContent = `${input(id).value}%`;
    });
    input(id).addEventListener('change', () => {
      if (id === 'density') {
        density = input(id).valueAsNumber / 100;
        comparing = false;
        draw();
      } else {
        options = {
          ...options,
          relief: input('relief').valueAsNumber / 100,
          roughness: input('coast').valueAsNumber / 100,
        };
        rebuild();
      }
    });
  }
  element('shuffle').addEventListener('click', () => {
    options = { ...options, seed: options.seed + 17 };
    rebuild();
  });
  element('lighting').addEventListener('click', () => {
    lighting = lighting === 'day' ? 'night' : 'day';
    draw();
  });
  element('compare').addEventListener('click', () => {
    comparing = !comparing;
    zoom = 1;
    draw();
  });
  input('records').addEventListener('change', () => {
    records = input('records').checked;
    comparing = false;
    draw();
  });
  element('zoom-in').addEventListener('click', () => {
    zoom = clamp(zoom + 0.2, 0.6, 2.2);
    updateZoom();
  });
  element('zoom-out').addEventListener('click', () => {
    zoom = clamp(zoom - 0.2, 0.6, 2.2);
    updateZoom();
  });
  element('reset-view').addEventListener('click', () => {
    zoom = 1;
    updateZoom();
  });
  select('day-picker').addEventListener('change', () => {
    selectedDate = select('day-picker').value;
    if (comparing) {
      comparing = false;
      draw();
    }
    inspectDate(model, selectedDate);
  });
  const chooseMarker = (event: Event): void => {
    if (event instanceof KeyboardEvent && event.key !== 'Enter' && event.key !== ' ') return;
    const target = event.target;
    if (!(target instanceof Element)) return;
    const date = target.closest('[data-date]')?.getAttribute('data-date');
    if (!date) return;
    if (event instanceof KeyboardEvent) event.preventDefault();
    selectedDate = date;
    inspectDate(model, date);
  };
  scene.addEventListener('click', chooseMarker);
  scene.addEventListener('keydown', chooseMarker);
  draw();
}

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  element('render-error').hidden = false;
  element('render-error').textContent =
    `풍경을 준비하지 못했습니다. 새로고침해주세요. (${message})`;
  element('scene-status').textContent = '풍경을 불러오지 못했습니다.';
}
