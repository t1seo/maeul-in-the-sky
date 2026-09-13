import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { createArchive } from '../src/core/archive/comparison.js';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { snapshot } from './cli/fixtures.js';

let browser: Browser;
beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});
afterAll(async () => {
  await browser?.close();
});

function compose(svg: string): string {
  return renderArchiveComparison(
    createArchive([snapshot(2024), snapshot(2025)]),
    {
      name: 'custom',
      displayName: 'Custom',
      description: 'Regression',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

describe('custom archive SVG semantics in Chromium', () => {
  it('preserves XML comments, processing instructions, CDATA, text, and quoted root values', () => {
    // Given
    const processing = `<?theme note='Keep <svg fake> and id="literal"'?>`;
    const comment = '<!-- Keep id="literal" and url(#paint) -->';
    const cdata = '<![CDATA[Keep id="literal" and url(#paint)]]>';
    const text = '<text>Keep id="literal" and url(#paint)</text>';
    const svg = `${processing}${comment}<svg xmlns='http://www.w3.org/2000/svg' aria-label="literal x='900' y='800' url(#paint)" data-note='Keep > quoted root'>${cdata}${text}<style>@media (prefers-reduced-motion:reduce) { #paint { fill: red } }</style><rect id='paint' width='20' height='20'/></svg>`;

    // When
    const result = compose(svg);

    // Then
    expect(result.split(processing)).toHaveLength(3);
    expect(result.split(comment)).toHaveLength(3);
    expect(result.split(cdata)).toHaveLength(3);
    expect(result.split(text)).toHaveLength(3);
    expect(result.split(`aria-label="literal x='900' y='800' url(#paint)"`)).toHaveLength(3);
    expect(result).toContain('data-note=\'Keep > quoted root\' x="0" y="94"');
    expect(result).toContain("id='archive-dark-0-paint'");
    expect(result).toContain('#archive-dark-0-paint { fill: red }');
  });

  it('positions the actual document roots after comments containing SVG-looking text', async () => {
    // Given
    const comment = '<!-- Keep <svg fake> and id="literal" as text -->';
    const svg = `${comment}<svg xmlns='http://www.w3.org/2000/svg' width='420' height='360'><rect width='20' height='20'/></svg>`;
    const page = await browser.newPage();
    try {
      // When
      const result = compose(svg);
      await page.setContent(result);
      const roots = await page.locator('svg > g > svg').evaluateAll((nodes) =>
        nodes.map((node) => ({
          x: node.getAttribute('x'),
          y: node.getAttribute('y'),
          top: node.getBoundingClientRect().top,
          bottom: node.getBoundingClientRect().bottom,
        })),
      );

      // Then
      expect(roots.map(({ x, y }) => ({ x, y }))).toEqual([
        { x: '0', y: '94' },
        { x: '0', y: '484' },
      ]);
      expect((roots[1]?.top ?? 0) - (roots[0]?.top ?? 0)).toBe(390);
      expect(roots[0]?.bottom ?? Infinity).toBeLessThanOrEqual(roots[1]?.top ?? -Infinity);
      expect(result.split(comment)).toHaveLength(3);
    } finally {
      await page.close();
    }
  });

  it('keeps paint references attached to their original gradients with prefix-shaped IDs', async () => {
    // Given
    const svg = `<svg xmlns='http://www.w3.org/2000/svg'><defs><linearGradient id='marker'><stop stop-color='red'/></linearGradient><linearGradient id='archive-dark-0-marker'><stop stop-color='blue'/></linearGradient></defs><rect id='painted' width='20' height='20' fill='url(#marker)'/></svg>`;
    const page = await browser.newPage();
    try {
      // When
      await page.setContent(compose(svg));
      const paintServers = await page.locator('rect[id$="-painted"]').evaluateAll((nodes) =>
        nodes.map((node) => {
          const id = node.getAttribute('fill')?.match(/^url\(#(.+)\)$/)?.[1];
          return id
            ? document.getElementById(id)?.querySelector('stop')?.getAttribute('stop-color')
            : null;
        }),
      );

      // Then
      expect(paintServers).toEqual(['red', 'red']);
    } finally {
      await page.close();
    }
  });

  it('preserves independent click-triggered and chained SMIL animation in each annual row', async () => {
    // Given
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='360'><rect id='trigger.part' x='20' y='10' width='20' height='20'><animate id='grow.part' attributeName='width' from='20' to='100' dur='1s' fill='freeze' begin='5s; trigger.part.click'/></rect><rect id='after' x='20' y='60' width='10' height='20'><animate attributeName='width' from='10' to='90' dur='1s' fill='freeze' begin='grow.part.end' end='trigger.part.click+5s'/></rect></svg>`;
    const page = await browser.newPage();
    try {
      // When
      await page.setContent(compose(svg));
      const state = await page.evaluate(() => {
        const root = document.querySelector('svg');
        if (!(root instanceof SVGSVGElement)) throw new TypeError('Missing SVG document');
        const rows = [...document.querySelectorAll('svg > g > svg')];
        const firstRow = rows[0];
        const secondRow = rows[1];
        const firstTrigger = firstRow?.querySelector('rect:first-of-type');
        const firstAfter = firstRow?.querySelector('rect:nth-of-type(2)');
        const secondTrigger = secondRow?.querySelector('rect:first-of-type');
        if (
          !(firstRow instanceof SVGSVGElement) ||
          !(secondRow instanceof SVGSVGElement) ||
          !(firstTrigger instanceof SVGRectElement) ||
          !(firstAfter instanceof SVGRectElement) ||
          !(secondTrigger instanceof SVGRectElement)
        ) {
          throw new TypeError('Missing animation rectangles');
        }
        root.pauseAnimations();
        root.setCurrentTime(0);
        firstRow.pauseAnimations();
        secondRow.pauseAnimations();
        firstRow.setCurrentTime(0);
        secondRow.setCurrentTime(0);
        firstTrigger.dispatchEvent(new MouseEvent('click'));
        firstRow.setCurrentTime(1.5);
        secondRow.setCurrentTime(1.5);
        const referentsExist = [...document.querySelectorAll('animate')].flatMap((animation) =>
          ['begin', 'end'].flatMap((attribute) =>
            (animation.getAttribute(attribute) ?? '')
              .split(';')
              .map((timing) => timing.trim())
              .filter((timing) => timing.includes('.'))
              .map(
                (timing) =>
                  document.getElementById(timing.slice(0, timing.lastIndexOf('.'))) !== null,
              ),
          ),
        );
        return {
          widths: [
            firstTrigger.width.animVal.value,
            firstAfter.width.animVal.value,
            secondTrigger.width.animVal.value,
          ],
          referentsExist,
        };
      });

      // Then
      expect(state.referentsExist).toEqual([true, true, true, true, true, true]);
      expect(state.widths[0]).toBe(100);
      expect(state.widths[1]).toBeCloseTo(50, 0);
      expect(state.widths[2]).toBe(20);
    } finally {
      await page.close();
    }
  });
});
