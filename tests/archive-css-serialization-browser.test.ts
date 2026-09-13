import { chromium, type Browser, type Page } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
import { snapshot } from './cli/fixtures.js';

const COMMENT = '/* Keep #literal and url(#paint) unchanged. */';
const LITERAL_TEXT = '<text data-literal="yes">Keep ]]&gt; boundary text</text>';
const NAMESPACE_URI = 'urn:selector]]>edge';
const SCENARIOS = [
  {
    name: 'generated namespace URI',
    rule: '[*|id="paint"] { opacity: .3 }',
    expectedPerDocument: 2,
    elements: '<rect id="paint" data-probe="plain"/><rect e:id="paint" data-probe="foreign"/>',
    expectedStyleText: NAMESPACE_URI,
  },
  {
    name: 'generated exact selector value',
    rule: '[*|id="x\\5d \\5d >y"] { opacity: .3 }',
    expectedPerDocument: 1,
    elements: '<rect id="x]]>y" data-probe="target"/>',
    expectedStyleText: 'x]]>y',
  },
] as const;
const STYLE_VARIANTS = ['text', 'cdata'] as const;

type Inspection = {
  readonly parserErrors: number;
  readonly opacities: readonly string[];
  readonly scripts: number;
  readonly handlers: number;
  readonly styleTexts: readonly string[];
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
      name: 'css-serialization',
      displayName: 'CSS serialization',
      description: 'CSS serialization boundary regression fixture',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

async function inspect(page: Page, markup: string): Promise<Inspection> {
  await page.goto(`data:image/svg+xml,${encodeURIComponent(markup)}`);
  return {
    parserErrors: await page.locator('parsererror').count(),
    opacities: await page
      .locator('[data-probe]')
      .evaluateAll((elements) => elements.map((element) => getComputedStyle(element).opacity)),
    scripts: await page.locator('script').count(),
    handlers: await page.locator('[onload],[onclick],[onerror]').count(),
    styleTexts: await page
      .locator('style')
      .evaluateAll((elements) => elements.map((element) => element.textContent ?? '')),
  };
}

describe('rewritten archive CSS serialization in Chromium', () => {
  it.each(
    SCENARIOS.flatMap((scenario) => STYLE_VARIANTS.map((variant) => ({ scenario, variant }))),
  )('preserves $scenario.name across the XML $variant boundary', async ({ scenario, variant }) => {
    // Given
    const stylesheet = `${COMMENT}${scenario.rule}`;
    const style = variant === 'cdata' ? `<![CDATA[${stylesheet}]]>` : stylesheet;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:e="${NAMESPACE_URI}"><style>${style}</style>${scenario.elements}${LITERAL_TEXT}</svg>`;
    const comparison = compose(svg);
    const page = await browser.newPage();

    try {
      // When
      const standalone = await inspect(page, svg);
      const composed = await inspect(page, comparison);

      // Then
      expect(standalone).toMatchObject({
        parserErrors: 0,
        opacities: Array.from({ length: scenario.expectedPerDocument }, () => '0.3'),
        scripts: 0,
        handlers: 0,
      });
      expect(composed).toMatchObject({
        parserErrors: 0,
        opacities: Array.from({ length: scenario.expectedPerDocument * 2 }, () => '0.3'),
        scripts: 0,
        handlers: 0,
      });
      expect(composed.styleTexts).toHaveLength(2);
      expect(composed.styleTexts.every((text) => text.includes(scenario.expectedStyleText))).toBe(
        true,
      );
      expect(comparison.split(COMMENT)).toHaveLength(3);
      expect(comparison.split(LITERAL_TEXT)).toHaveLength(3);
    } finally {
      await page.close();
    }
  });
});
