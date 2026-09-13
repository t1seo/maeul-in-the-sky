import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
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
      name: 'css-semantics',
      displayName: 'CSS semantics',
      description: 'CSS namespacing regression fixture',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

describe('custom archive CSS semantics in standalone SVG', () => {
  it('keeps escaped and Unicode selectors attached through nested and pseudo rules', async () => {
    // Given
    const comment = '/* Keep #마을, url(#paint.dot), and #abcdef unchanged here. */';
    const literal = 'content: "#마을 url(#paint.dot)"';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:link='http://www.w3.org/1999/xlink' width='420' height='360'>
<style><![CDATA[
${comment}
@namespace link "http://www.w3.org/1999/xlink";
@media (min-width: 0px) {
  :is(#마을, #accent\\.dot) { fill: rgb(255, 0, 0) }
  #colon\\:id { stroke: rgb(0, 255, 0) }
  #\\31 23hex { opacity: 0.25 }
  [id="target.dot"] { stroke-width: 7 }
  [link|href="#shape.dot"] { opacity: 0.4 }
  #painted { fill: url("#paint.dot") }
}
.literal::before { ${literal}; color: #abcdef }
]]></style>
<defs><linearGradient id='paint.dot'><stop stop-color='rgb(0, 0, 255)'/></linearGradient></defs>
<rect id='마을' x='0' y='0' width='10' height='10'/>
<rect id='accent.dot' x='15' y='0' width='10' height='10'/>
<rect id='colon:id' x='30' y='0' width='10' height='10'/>
<rect id='123hex' x='45' y='0' width='10' height='10'/>
<rect id='target.dot' x='60' y='0' width='10' height='10'/>
<path id='shape.dot' d='M0 0h5v5z'/>
<use id='ref.user' link:href='#shape.dot' x='75'/>
<rect id='painted' x='90' y='0' width='10' height='10'/>
</svg>`;
    const result = compose(svg);
    const page = await browser.newPage();

    try {
      // When
      await page.goto(`data:image/svg+xml,${encodeURIComponent(result)}`);
      const rows = await page.evaluate(() => {
        const values = (suffix: string, property: string) =>
          [...document.querySelectorAll(`[id$="-${suffix}"]`)].map((element) =>
            getComputedStyle(element).getPropertyValue(property),
          );
        const painted = [...document.querySelectorAll('[id$="-painted"]')].map((element) => {
          const fill = getComputedStyle(element).fill;
          const target = /#([^"')]+)/.exec(fill)?.[1];
          return {
            fill,
            stop: target
              ? document.getElementById(target)?.querySelector('stop')?.getAttribute('stop-color')
              : null,
          };
        });
        return {
          unicodeFill: values('마을', 'fill'),
          dottedFill: values('accent.dot', 'fill'),
          colonStroke: values('colon:id', 'stroke'),
          numericOpacity: values('123hex', 'opacity'),
          targetStrokeWidth: values('target.dot', 'stroke-width'),
          referenceOpacity: values('ref.user', 'opacity'),
          painted,
        };
      });

      // Then
      expect(rows.unicodeFill).toEqual(['rgb(255, 0, 0)', 'rgb(255, 0, 0)']);
      expect(rows.dottedFill).toEqual(['rgb(255, 0, 0)', 'rgb(255, 0, 0)']);
      expect(rows.colonStroke).toEqual(['rgb(0, 255, 0)', 'rgb(0, 255, 0)']);
      expect(rows.numericOpacity).toEqual(['0.25', '0.25']);
      expect(rows.targetStrokeWidth).toEqual(['7px', '7px']);
      expect(rows.referenceOpacity).toEqual(['0.4', '0.4']);
      expect(rows.painted.map(({ stop }) => stop)).toEqual(['rgb(0, 0, 255)', 'rgb(0, 0, 255)']);
      expect(rows.painted.every(({ fill }) => fill.includes('archive-dark-'))).toBe(true);
      expect(result.split(comment)).toHaveLength(3);
      expect(result.split(literal)).toHaveLength(3);
      expect(
        result.split('.literal::before { content: "#마을 url(#paint.dot)"; color: #abcdef }'),
      ).toHaveLength(3);
    } finally {
      await page.close();
    }
  });

  it('leaves exact selectors for foreign-namespace attributes unchanged', async () => {
    // Given
    const rule = '@namespace metadata "urn:metadata"; [metadata|id="paint"] { fill: red }';
    const foreignStyle = '<m:style>#paint { fill: lime }</m:style>';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:m='urn:metadata' width='420' height='360'><style>${rule}</style>${foreignStyle}<defs><linearGradient id='paint'/></defs><rect data-probe='foreign' m:id='paint' width='20' height='20' fill='blue'/></svg>`;
    const result = compose(svg);
    const page = await browser.newPage();

    try {
      // When
      await page.goto(`data:image/svg+xml,${encodeURIComponent(svg)}`);
      const standaloneFill = await page
        .locator('[data-probe="foreign"]')
        .evaluate((element) => getComputedStyle(element).fill);
      await page.goto(`data:image/svg+xml,${encodeURIComponent(result)}`);
      const composedFills = await page
        .locator('[data-probe="foreign"]')
        .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).fill));

      // Then
      expect(standaloneFill).toBe('rgb(255, 0, 0)');
      expect(composedFills).toEqual(['rgb(255, 0, 0)', 'rgb(255, 0, 0)']);
      expect(result.split('@namespace metadata "urn:metadata";')).toHaveLength(3);
      expect(result.split('[metadata|id="paint"] { fill: red }')).toHaveLength(3);
      expect(result.split(foreignStyle)).toHaveLength(3);
    } finally {
      await page.close();
    }
  });

  it('preserves custom-property colors and non-exact ID attribute selector matches', async () => {
    // Given
    const customProperty = '.variable { --tone: #f00; fill: var(--tone) }';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='420' height='360'><style>[id^="pa"] { fill: red } [id="CASE" i] { stroke: lime } [id$="suffix"] { opacity: 0.3 } [id~="two"] { stroke-width: 4 } [id|="lang"] { fill: aqua } ${customProperty}</style><rect id='paint' data-probe='prefix' width='10' height='10' fill='blue'/><rect id='case' data-probe='case' x='15' width='10' height='10' stroke='blue'/><rect id='prefix-suffix' data-probe='suffix' x='30' width='10' height='10'/><rect id='two words' data-probe='word' x='45' width='10' height='10'/><rect id='lang-ko' data-probe='dash' x='60' width='10' height='10'/><rect id='variable' class='variable' data-probe='variable' x='75' width='10' height='10'/></svg>`;
    const result = compose(svg);
    const page = await browser.newPage();

    try {
      // When
      await page.goto(`data:image/svg+xml,${encodeURIComponent(result)}`);
      const styles = await page.locator('[data-probe]').evaluateAll((elements) =>
        Object.fromEntries(
          elements.map((element) => {
            const style = getComputedStyle(element);
            return [
              element.getAttribute('data-probe') ?? '',
              {
                fill: style.fill,
                stroke: style.stroke,
                strokeWidth: style.strokeWidth,
                opacity: style.opacity,
              },
            ];
          }),
        ),
      );

      // Then
      expect(styles.prefix?.fill).toBe('rgb(255, 0, 0)');
      expect(styles.case?.stroke).toBe('rgb(0, 255, 0)');
      expect(styles.suffix?.opacity).toBe('0.3');
      expect(styles.word?.strokeWidth).toBe('4px');
      expect(styles.dash?.fill).toBe('rgb(0, 255, 255)');
      expect(styles.variable?.fill).toBe('rgb(255, 0, 0)');
      expect(result.split(customProperty)).toHaveLength(3);
    } finally {
      await page.close();
    }
  });
});
