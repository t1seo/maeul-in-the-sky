import { gzipSync } from 'node:zlib';
import { describe, expect, it } from 'vitest';
import { measureSvg } from '../../scripts/benchmark/svg-metrics.js';

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10" aria-labelledby="title desc">
<title id="title">A &amp; B</title><desc id="desc">Accessible scene</desc>
<defs><linearGradient id="paint"/></defs><style>
@keyframes drift { from {opacity:0} to {opacity:1} }
.cloud, .also {animation:drift 2s infinite} @media(prefers-reduced-motion:reduce){*{animation:none}}
</style><g class="cloud also" fill="url(#paint)"><path/><animate attributeName="opacity" dur="1s"/></g>
<g class="cloud"/><path style="animation:drift 1s infinite"/><use href="#paint"/></svg>`;

describe('semantic SVG measurements', () => {
  it('measures UTF-8/gzip bytes and XML elements without changing the input', () => {
    const result = measureSvg(svg);
    expect(result.rawBytes).toBe(Buffer.byteLength(svg));
    expect(result.gzipBytes).toBe(gzipSync(svg, { level: 9 }).byteLength);
    expect(result.elements).toBe(12);
    expect(result.title).toBe('A & B');
    expect(result.description).toBe('Accessible scene');
    expect(result.viewBox).toBe('0 0 10 10');
  });
  it('counts unique CSS target elements independently from SMIL and keyframes', () => {
    const result = measureSvg(svg);
    expect(result.cssTargets).toBe(3);
    expect(result.cssKeyframes).toBe(1);
    expect(result.smilElements).toBe(1);
  });
  it('resolves local CSS/paint/href/accessibility references against actual IDs', () => {
    expect(measureSvg(svg).danglingReferences).toEqual([]);
    const broken =
      '<svg aria-labelledby="absent"><g id="x"/><g id="x"/><use href="#missing"/><path fill="url(#paint)"/><animate begin="clock.end"/><image href="https://example.com/a.png"/></svg>';
    const result = measureSvg(broken);
    expect(result.duplicateIds).toEqual(['x']);
    expect(result.danglingReferences).toEqual(['absent', 'clock', 'missing', 'paint']);
    expect(result.externalReferences).toEqual(['https://example.com/a.png']);
  });
  it('rejects malformed XML instead of treating regex matches as a parsed document', () => {
    expect(() => measureSvg('<svg><g></svg>')).toThrow();
  });
  it('does not mistake whitespace before animation:none for an animation target', () => {
    const staticSvg =
      '<svg><style>* { animation: none !important; }</style><path style="animation: none"/></svg>';
    expect(measureSvg(staticSvg).cssTargets).toBe(0);
  });
});
