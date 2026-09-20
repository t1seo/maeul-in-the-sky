import { element, select } from './dom.js';
import { createProjection, number } from './projection.js';
import type { Biome, TerrainModel } from './types.js';

const BIOMES: Readonly<Record<Biome, string>> = {
  sand: '해안',
  meadow: '초지',
  forest: '숲',
  rock: '바위 능선',
  snow: '눈 덮인 고지대',
};

export function inspectDate(model: TerrainModel, date: string): void {
  const plot = model.plots.find((entry) => entry.date === date);
  if (!plot) {
    element('selected-date').textContent = '날짜를 선택해주세요';
    element('selected-count').textContent = '기록을 확인해보세요';
    element('selected-place').textContent = '이 날짜가 머무는 곳을 보여드립니다.';
    for (const marker of document.querySelectorAll('.date-point'))
      marker.setAttribute('aria-pressed', 'false');
    const marker = document.getElementById('selected-marker');
    if (marker instanceof SVGElement) marker.style.display = 'none';
    return;
  }
  element('selected-date').textContent = plot.date;
  element('selected-count').textContent = `${plot.count.toLocaleString('ko-KR')}회 기여`;
  element('selected-place').textContent =
    `${BIOMES[plot.position.biome]}에 놓인 원본 기록${plot.count === 0 ? ' · 관측된 0회입니다.' : ' · 합성 샘플'}`;
  select('day-picker').value = date;
  for (const marker of document.querySelectorAll('.date-point'))
    marker.setAttribute('aria-pressed', String(marker.getAttribute('data-date') === date));
  const marker = document.getElementById('selected-marker');
  if (marker instanceof SVGElement) {
    const point = createProjection(model).point(plot.position);
    marker.setAttribute('transform', `translate(${number(point.x)} ${number(point.y)})`);
    marker.style.display = '';
  }
}

export function fillDatePicker(model: TerrainModel): void {
  const picker = select('day-picker');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = '날짜를 선택해주세요';
  picker.replaceChildren(
    placeholder,
    ...model.plots.map((plot) => {
      const option = document.createElement('option');
      option.value = plot.date;
      option.textContent = `${plot.date} · ${plot.count}회`;
      return option;
    }),
  );
}
