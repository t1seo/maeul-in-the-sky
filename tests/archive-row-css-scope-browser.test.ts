import { chromium, type Browser, type Page } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
import type { ColorMode } from '../src/core/types.js';
import { snapshot } from './cli/fixtures.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
const COLORS = {
  dark: {
    2024: ['rgb(255, 0, 0)', 'rgb(128, 0, 0)'],
    2025: ['rgb(0, 0, 255)', 'rgb(0, 0, 128)'],
  },
  light: {
    2024: ['rgb(0, 128, 0)', 'rgb(0, 64, 0)'],
    2025: ['rgb(255, 165, 0)', 'rgb(128, 82, 0)'],
  },
} as const;

type PaintInspection = {
  readonly parserErrors: number;
  readonly rows: readonly {
    readonly year: string | null;
    readonly rootId: string;
    readonly scopeMarkers: readonly (readonly [string, string])[];
    readonly rootIdState: string;
    readonly originalMarkerState: string;
    readonly escapedRowStyle: string;
    readonly scopeRootState: string;
    readonly nestingRootState: string;
    readonly explicitScopeState: string;
    readonly scopeSpecificity: string;
    readonly nestingSpecificity: string;
    readonly fill: string;
    readonly fillTarget: string | null;
    readonly fillColor: string | null;
    readonly stroke: string;
    readonly strokeTarget: string | null;
    readonly strokeColor: string | null;
  }[];
  readonly styles: readonly string[];
};

let browser: Browser;

beforeAll(async () => {
  browser = await chromium.launch({ headless: true });
});

afterAll(async () => {
  await browser?.close();
});

function themeSvg(year: 2024 | 2025, mode: ColorMode): string {
  const [fillColor, strokeColor] = COLORS[mode][year];
  const rootAttributes =
    year === 2024 ? ' id="theme.root:2024"' : ' data-maeul-archive-scope="original"';
  const stylesheet = `@namespace s "${SVG_NAMESPACE}";@namespace "${SVG_NAMESPACE}";
s|rect:is([data-painted], [data-unused]):not([data-disabled]) { fill: url("#fallback") }
@media (min-width: 1px) { s|rect:is([data-painted], [data-unused]):not([data-disabled]) { fill: url("#fill") } }
@supports (display: block) { g { & > s|rect:is([data-painted], [data-unused]):not([data-disabled]) { stroke: url("#stroke") } } }
svg { & ~ svg [data-painted] { --escaped-row-style: yes } }
${year === 2024 ? ':root[id] { --root-id-state: present }' : ':root:not([id]) { --root-id-state: absent }:root[data-maeul-archive-sc\\6f pe="original"] { --original-marker-state: preserved }'}
:scope { --scope-root-state: preserved; --scope-specificity: scope }
svg { --scope-specificity: type }
& { --nesting-root-state: preserved; --nesting-specificity: nesting }
svg { --nesting-specificity: type }
@scope (svg) { :scope { --explicit-scope-state: preserved } }
@keyframes rowPulse { from { opacity: .91 } to { opacity: .92 } }`;
  const style = year === 2024 ? stylesheet.replaceAll('&', '&amp;') : `<![CDATA[${stylesheet}]]>`;
  return `<svg xmlns="${SVG_NAMESPACE}"${rootAttributes} viewBox="0 0 10 10"><style>${style}</style><defs><linearGradient id="fallback"><stop stop-color="rgb(1, 2, 3)"/></linearGradient><linearGradient id="fill"><stop stop-color="${fillColor}"/></linearGradient><linearGradient id="stroke"><stop stop-color="${strokeColor}"/></linearGradient></defs><g><rect data-painted="${year}" width="10" height="10"/></g></svg>`;
}

function compose(): { readonly dark: string; readonly light: string } {
  return renderArchiveComparison(
    createArchive([snapshot(2024), snapshot(2025)]),
    {
      name: 'row-css-scope',
      displayName: 'Row CSS scope',
      description: 'Cross-row CSS paint regression fixture',
      render: (data) => {
        const year = data.year === 2024 ? 2024 : 2025;
        return { dark: themeSvg(year, 'dark'), light: themeSvg(year, 'light') };
      },
    },
    'shared-p90',
  );
}

async function inspect(page: Page, markup: string): Promise<PaintInspection> {
  await page.goto(`data:image/svg+xml,${encodeURIComponent(markup)}`);
  return page.evaluate(() => {
    const targetId = (value: string): string | null =>
      /^url\(["']?#([^"')]+)["']?\)$/.exec(value)?.[1] ?? null;
    const paintColor = (id: string | null): string | null =>
      id === null
        ? null
        : (document.getElementById(id)?.querySelector('stop')?.getAttribute('stop-color') ?? null);
    return {
      parserErrors: document.getElementsByTagName('parsererror').length,
      rows: [...document.querySelectorAll('[data-painted]')].map((element) => {
        const style = getComputedStyle(element);
        const root = element.closest('svg');
        const scopeMarkers =
          root?.getAttributeNames().filter((name) => name.startsWith('data-maeul-archive-scope')) ??
          [];
        const fillTarget = targetId(style.fill);
        const strokeTarget = targetId(style.stroke);
        return {
          year: element.getAttribute('data-painted'),
          rootId: root?.id ?? '',
          scopeMarkers: scopeMarkers.map((name): readonly [string, string] => [
            name,
            root?.getAttribute(name) ?? '',
          ]),
          rootIdState:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--root-id-state'),
          originalMarkerState:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--original-marker-state'),
          escapedRowStyle: style.getPropertyValue('--escaped-row-style'),
          scopeRootState:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--scope-root-state'),
          nestingRootState:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--nesting-root-state'),
          explicitScopeState:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--explicit-scope-state'),
          scopeSpecificity:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--scope-specificity'),
          nestingSpecificity:
            root === null ? '' : getComputedStyle(root).getPropertyValue('--nesting-specificity'),
          fill: style.fill,
          fillTarget,
          fillColor: paintColor(fillTarget),
          stroke: style.stroke,
          strokeTarget,
          strokeColor: paintColor(strokeTarget),
        };
      }),
      styles: [...document.querySelectorAll('style')].map((element) => element.textContent ?? ''),
    };
  });
}

describe('archive row stylesheet scope in Chromium', () => {
  it.each(['dark', 'light'] as const)(
    'keeps declaration order and conditional paint URLs attached to each %s row',
    async (mode) => {
      // Given
      const comparison = compose()[mode];
      const page = await browser.newPage();

      try {
        // When
        const result = await inspect(page, comparison);

        // Then
        expect(result.parserErrors).toBe(0);
        expect(result.rows).toEqual([
          {
            year: '2024',
            rootId: `archive-${mode}-0-theme.root:2024`,
            scopeMarkers: [['data-maeul-archive-scope', `archive-${mode}-0-`]],
            rootIdState: 'present',
            originalMarkerState: '',
            escapedRowStyle: '',
            scopeRootState: 'preserved',
            nestingRootState: 'preserved',
            explicitScopeState: 'preserved',
            scopeSpecificity: 'scope',
            nestingSpecificity: 'type',
            fill: `url("#archive-${mode}-0-fill")`,
            fillTarget: `archive-${mode}-0-fill`,
            fillColor: COLORS[mode][2024][0],
            stroke: `url("#archive-${mode}-0-stroke")`,
            strokeTarget: `archive-${mode}-0-stroke`,
            strokeColor: COLORS[mode][2024][1],
          },
          {
            year: '2025',
            rootId: '',
            scopeMarkers: [
              ['data-maeul-archive-scope', 'original'],
              ['data-maeul-archive-scope-1', `archive-${mode}-1-`],
            ],
            rootIdState: 'absent',
            originalMarkerState: 'preserved',
            escapedRowStyle: '',
            scopeRootState: 'preserved',
            nestingRootState: 'preserved',
            explicitScopeState: 'preserved',
            scopeSpecificity: 'scope',
            nestingSpecificity: 'type',
            fill: `url("#archive-${mode}-1-fill")`,
            fillTarget: `archive-${mode}-1-fill`,
            fillColor: COLORS[mode][2025][0],
            stroke: `url("#archive-${mode}-1-stroke")`,
            strokeTarget: `archive-${mode}-1-stroke`,
            strokeColor: COLORS[mode][2025][1],
          },
        ]);
        expect(result.styles).toHaveLength(2);
        expect(
          result.styles.every((style) => /@keyframes rowPulse\s*\{\s*from\s*\{/.test(style)),
        ).toBe(true);
        expect(result.styles.every((style) => !/:where\([^)]*\)\s*from/.test(style))).toBe(true);
      } finally {
        await page.close();
      }
    },
  );
});
