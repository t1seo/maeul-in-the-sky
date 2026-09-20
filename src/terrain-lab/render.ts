import { escapeXml } from '../core/svg.js';
import { createProjection, number, type Lighting } from './projection.js';
import { sceneryItems } from './scenery.js';
import { coastline, surfaceItems } from './surface.js';
import type { TerrainModel } from './types.js';

export interface LandscapeOptions {
  readonly lighting: Lighting;
  readonly density: number;
  readonly records: boolean;
}
export interface LandscapeResult {
  readonly svg: string;
  readonly assetCount: number;
  readonly showcaseCount: number;
}

export function renderLandscape(model: TerrainModel, options: LandscapeOptions): LandscapeResult {
  const projection = createProjection(model);
  const scenery = sceneryItems(model, projection, options.lighting, options.density);
  const items = [...surfaceItems(model, projection, options.lighting), ...scenery.items].sort(
    (a, b) => a.depth - b.depth || a.layer - b.layer,
  );
  const dots = model.plots
    .map((plot) => {
      const point = projection.point(plot.position);
      const date = escapeXml(plot.date);
      return `<g class="date-point" data-date="${date}" data-count="${plot.count}" transform="translate(${number(point.x)} ${number(point.y)})" role="button" tabindex="${options.records ? '0' : '-1'}" aria-label="${date}, ${plot.count}회"><title>${date} · ${plot.count}회</title><circle r="7" fill="transparent"/><circle class="date-ink" r="${plot.count ? '2.6' : '2'}" fill="${plot.count ? '#e7b969' : '#e9eedc'}" stroke="#354e46" stroke-width=".8"/></g>`;
    })
    .join('');
  const sky = options.lighting === 'night' ? ['#152b31', '#2b4649'] : ['#e7efe9', '#d0e3dd'];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="terrain-scene" viewBox="0 0 1200 840" role="group" aria-labelledby="lab-svg-title lab-svg-description" data-layout="${model.options.layout}">
    <title id="lab-svg-title">자연 지형 마을 · ${model.plots.length}일의 샘플 기여 기록</title><desc id="lab-svg-description">불규칙한 해안과 연결된 산맥, 내리막 강, 숲과 마을. 날짜 위치를 켜거나 날짜 선택 메뉴에서 원본 기록을 확인하실 수 있습니다. 원더는 전시용입니다.</desc>
    <defs><linearGradient id="lab-sky" x2="0" y2="1"><stop stop-color="${sky[0]}"/><stop offset="1" stop-color="${sky[1]}"/></linearGradient><linearGradient id="fall-water" x2="0" y2="1"><stop stop-color="#91d2d3"/><stop offset=".7" stop-color="#69bcc8" stop-opacity=".65"/><stop offset="1" stop-color="#afdcd3" stop-opacity="0"/></linearGradient></defs>
    <rect width="1200" height="840" fill="url(#lab-sky)"/>
    <g class="sky-marks" fill="none" stroke="${options.lighting === 'night' ? '#719397' : '#b6cdc4'}" opacity=".4" stroke-width="1"><path d="M60,170h40m-20,-20v40M1070,640h30m-15,-15v30M1110,110h20m-10,-10v20"/><ellipse cx="600" cy="683" rx="400" ry="45" fill="${options.lighting === 'night' ? '#0c2229' : '#a1c0b5'}" stroke="none" opacity=".22"/></g>
    <g id="landscape-view"><g class="coastal-water">${coastline(model, projection, options.lighting)}</g><g class="geography">${items.map((item) => item.markup).join('')}</g><g id="date-layer" aria-hidden="${!options.records}" opacity="${options.records ? '1' : '0'}" pointer-events="${options.records ? 'auto' : 'none'}">${dots}</g><g id="selected-marker" style="display:none" pointer-events="none"><ellipse rx="12" ry="5" fill="none" stroke="#fff9dd" stroke-width="3"/><ellipse rx="12" ry="5" fill="none" stroke="#ba7641" stroke-width="1"/><path d="M0,-9V-25m0,0l11,4-11,4" stroke="#725b37" fill="#e8bb68" stroke-width="1.5"/></g></g>
  </svg>`;
  return { svg, assetCount: scenery.assetCount, showcaseCount: scenery.showcaseCount };
}
