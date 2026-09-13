import { chromium, type Browser, type Page } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
import { snapshot } from './cli/fixtures.js';

const NAMESPACE_RULES = [
  { name: 'uppercase', rule: '@NAMESPACE link "http://www.w3.org/1999/xlink";' },
  { name: 'mixed case', rule: '@NaMeSpAcE link "http://www.w3.org/1999/xlink";' },
  { name: 'escaped', rule: '@\\6e amespace link "http://www.w3.org/1999/xlink";' },
] as const;

const PRELUDE_RULES = [
  {
    name: 'uppercase import then layer',
    charset: 'CHARSET',
    importName: 'IMPORT',
    layer: 'LAYER',
    order: 'import-layer',
  },
  {
    name: 'mixed-case layer then import',
    charset: 'ChArSeT',
    importName: 'ImPoRt',
    layer: 'LaYeR',
    order: 'layer-import',
  },
  {
    name: 'escaped layer without import',
    charset: '\\63 harset',
    importName: '\\69 mport',
    layer: '\\6c ayer',
    order: 'layer-only',
  },
] as const;

const NAMESPACE_URL_RULES = [
  {
    name: 'lowercase named text',
    declaration: '@namespace m url("#shape");',
    selector: '[m|id="foreign"]',
    element: '<rect m:id="foreign" data-probe="target"/>',
    cdata: false,
  },
  {
    name: 'uppercase default text',
    declaration: '@NAMESPACE url("#shape");',
    selector: 'rect',
    element: '<m:rect data-probe="target"/>',
    cdata: false,
  },
  {
    name: 'mixed-case named CDATA',
    declaration: '@NaMeSpAcE m url("#shape");',
    selector: '[m|id="foreign"]',
    element: '<rect m:id="foreign" data-probe="target"/>',
    cdata: true,
  },
  {
    name: 'escaped default CDATA',
    declaration: '@\\6e amespace url("#shape");',
    selector: 'rect',
    element: '<m:rect data-probe="target"/>',
    cdata: true,
  },
] as const;

type Inspection = {
  readonly parserErrors: number;
  readonly opacities: readonly string[];
  readonly strokeWidths: readonly string[];
  readonly hrefs: readonly (string | null)[];
  readonly paintFills: readonly string[];
};

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
      name: 'css-atrules',
      displayName: 'CSS at-rules',
      description: 'CSS at-rule normalization regression fixture',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

async function inspect(page: Page, markup: string): Promise<Inspection> {
  await page.goto(`data:image/svg+xml,${encodeURIComponent(markup)}`);
  return page.locator('[data-probe="target"]').evaluateAll((elements) => ({
    parserErrors: document.getElementsByTagName('parsererror').length,
    opacities: elements.map((element) => getComputedStyle(element).opacity),
    strokeWidths: elements.map((element) => getComputedStyle(element).strokeWidth),
    hrefs: elements.map((element) =>
      element.getAttributeNS('http://www.w3.org/1999/xlink', 'href'),
    ),
    paintFills: [...document.querySelectorAll('[data-painted]')].map(
      (element) => getComputedStyle(element).fill,
    ),
  }));
}

describe('custom archive CSS at-rule normalization in Chromium', () => {
  it.each(NAMESPACE_RULES)(
    'keeps qualified href selectors attached for $name namespace rules',
    async ({ rule }) => {
      // Given
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:link="http://www.w3.org/1999/xlink"><style>${rule}[link|href^="#sha"] { opacity: .3 }</style><path id="shape"/><use data-probe="target" link:href="#shape"/></svg>`;
      const comparison = compose(svg);
      const page = await browser.newPage();

      try {
        // When
        const standalone = await inspect(page, svg);
        const composed = await inspect(page, comparison);

        // Then
        expect(standalone).toMatchObject({ parserErrors: 0, opacities: ['0.3'] });
        expect(composed).toMatchObject({ parserErrors: 0, opacities: ['0.3', '0.3'] });
        expect(composed.hrefs).toEqual(['#archive-dark-0-shape', '#archive-dark-1-shape']);
        expect(comparison.split(rule)).toHaveLength(3);
      } finally {
        await page.close();
      }
    },
  );

  it.each(PRELUDE_RULES)(
    'inserts generated namespace rules at the valid boundary around adjacent $name prelude statements',
    async ({ charset, importName, layer, order }) => {
      // Given
      const importedCss = encodeURIComponent('[data-imported="yes"] { stroke-width: 7 }');
      const charsetRule = `@${charset} "UTF-8";`;
      const importRule = `@${importName} url("data:text/css,${importedCss}");`;
      const layerRule = `@${layer} base;`;
      const preludeOrder = {
        'import-layer': `${importRule}${layerRule}`,
        'layer-import': `${layerRule}${importRule}`,
        'layer-only': layerRule,
      } as const;
      const prelude = `${charsetRule}${preludeOrder[order]}`;
      const expectedStrokeWidth = order === 'layer-only' ? '1px' : '7px';
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:link="http://www.w3.org/1999/xlink"><style>${prelude}[*|href^="#sha"] { opacity: .3 }</style><path id="shape"/><use data-probe="target" data-imported="yes" link:href="#shape"/></svg>`;
      const comparison = compose(svg);
      const page = await browser.newPage();

      try {
        // When
        const standalone = await inspect(page, svg);
        const composed = await inspect(page, comparison);
        const styles = [...comparison.matchAll(/<style>([\s\S]*?)<\/style>/g)].map(
          (match) => match[1] ?? '',
        );

        // Then
        expect(standalone).toMatchObject({
          parserErrors: 0,
          opacities: ['0.3'],
          strokeWidths: [expectedStrokeWidth],
        });
        expect(composed).toMatchObject({
          parserErrors: 0,
          opacities: ['0.3', '0.3'],
          strokeWidths: [expectedStrokeWidth, expectedStrokeWidth],
        });
        expect(styles).toHaveLength(2);
        expect(
          styles.every((style) => {
            const namespaceOffset = style.indexOf('@namespace maeulNs');
            const afterRequiredPrelude =
              namespaceOffset > style.indexOf(charsetRule) &&
              namespaceOffset > style.indexOf(layerRule) &&
              (order === 'layer-only' || namespaceOffset > style.indexOf(importRule));
            return order === 'import-layer'
              ? namespaceOffset > style.indexOf(importRule) &&
                  namespaceOffset < style.indexOf(layerRule)
              : afterRequiredPrelude;
          }),
        ).toBe(true);
        expect(comparison.split(charsetRule)).toHaveLength(3);
        expect(comparison.split(layerRule)).toHaveLength(3);
        if (order !== 'layer-only') expect(comparison.split(importRule)).toHaveLength(3);
      } finally {
        await page.close();
      }
    },
  );

  it.each(NAMESPACE_URL_RULES)(
    'preserves $name namespace names while rewriting ordinary paint URLs',
    async ({ declaration, selector, element, cdata }) => {
      // Given
      const paintRule = '*|*[data-painted] { fill: url("#paint") }';
      const stylesheet = `${declaration}${selector} { opacity: .3 }${paintRule}`;
      const style = cdata ? `<![CDATA[${stylesheet}]]>` : stylesheet;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:m="#shape"><style>${style}</style><defs><linearGradient id="paint"><stop stop-color="red"/></linearGradient></defs><rect id="shape"/><rect data-painted="yes"/>${element}</svg>`;
      const comparison = compose(svg);
      const page = await browser.newPage();

      try {
        // When
        const standalone = await inspect(page, svg);
        const composed = await inspect(page, comparison);

        // Then
        expect(standalone).toMatchObject({ parserErrors: 0, opacities: ['0.3'] });
        expect(composed).toMatchObject({ parserErrors: 0, opacities: ['0.3', '0.3'] });
        expect(standalone.paintFills).toEqual(['url("#paint")']);
        expect(composed.paintFills).toHaveLength(2);
        expect(composed.paintFills.every((fill) => fill.includes('#archive-dark-'))).toBe(true);
        expect(comparison.split(declaration)).toHaveLength(3);
      } finally {
        await page.close();
      }
    },
  );
});
