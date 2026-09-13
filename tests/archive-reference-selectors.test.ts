import { chromium, type Browser } from '@playwright/test';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { namespaceAndPositionSvg } from '../src/archive/svg-composition.js';
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
      name: 'reference-selectors',
      displayName: 'Reference selectors',
      description: 'CSS attribute selector regression fixture',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

const nonCssSpace = '\u00a0';
const svg = `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' xmlns:f='urn:foreign'>
<style>
[*|id="wild"] { --wild-id: yes }
[maeulNs0|href="#shape"] { --reserved-prefix: bad }
[*|href="#shape"] { opacity: .4 }
[href^="#prefix"] { --prefix: yes }
[|href$="suffix"] { --suffix: yes }
[href*="middle"] { --contains: yes }
[href~="#word"] { --word: yes }
[href|="#lang"] { --dash: yes }
[href^="#CASE" i] { --insensitive: yes }
[href^="#CASE" s] { --sensitive: bad }
[href^="https://"] { --external: yes }
[href^=""] { --empty-prefix: bad }
[href$=""] { --empty-suffix: bad }
[href*=""] { --empty-contains: bad }
[fill^="url(#paint"] { stroke: rgb(0, 255, 0) }
[href^="#specific"] { fill: rgb(255, 0, 0) }
.specific { fill: rgb(0, 0, 255) }
</style>
<style>
@namespace xlink "http://www.w3.org/1999/xlink";
@namespace foreign "urn:foreign";
[xlink|href^="#sha"] { stroke-width: 7 }
[foreign|href^="#sha"] { --foreign: yes }
</style>
<defs><linearGradient id='paint'/></defs>
<path id='shape'/><path id='prefix-target'/><path id='target-suffix'/><path id='middle-target'/>
<path id='word tail'/><path id='word${nonCssSpace}tail'/><path id='lang-ko'/><path id='case-target'/><path id='specific-target'/>
<rect id='wild' data-probe='wild-id'/>
<rect id='other' f:id='wild' data-probe='mixed-id'/>
<use data-probe='wild-href' xlink:href='#shape'/>
<use data-probe='named-xlink' xlink:href='#shape'/>
<use data-probe='prefix' href='#prefix-target'/>
<use data-probe='suffix' href='#target-suffix'/>
<use data-probe='contains' href='#middle-target'/>
<use data-probe='word' href='#word tail'/>
<use data-probe='word-unicode' href='#word${nonCssSpace}tail'/>
<use data-probe='dash' href='#lang-ko'/>
<use data-probe='flags' href='#case-target'/>
<use data-probe='external' href='https://example.test/image.svg#shape'/>
<rect data-probe='paint' fill='url(#paint)'/>
<use class='specific' data-probe='specificity' href='#specific-target'/>
<use data-probe='foreign' f:href='#shape'/>
<use data-probe='mixed' f:href='#shape' xlink:href='#prefix-target'/>
<use data-probe='negative' f:href='#archive-dark-0-shape' xlink:href='#prefix-target'/>
</svg>`;

type Probe = Readonly<Record<string, readonly string[]>>;

async function readProbes(markup: string): Promise<Probe> {
  const page = await browser.newPage();
  try {
    await page.goto(`data:image/svg+xml,${encodeURIComponent(markup)}`);
    return await page.locator('[data-probe]').evaluateAll((elements) => {
      const probes: Record<string, string[]> = {};
      for (const element of elements) {
        const style = getComputedStyle(element);
        const custom = (name: string) => style.getPropertyValue(name).trim();
        const probe = element.getAttribute('data-probe') ?? '';
        const observed =
          probe === 'wild-id' || probe === 'mixed-id'
            ? custom('--wild-id')
            : probe === 'wild-href'
              ? `${style.opacity}|${custom('--reserved-prefix')}`
              : probe === 'mixed'
                ? style.opacity
                : probe === 'named-xlink'
                  ? style.strokeWidth
                  : probe === 'prefix'
                    ? custom('--prefix')
                    : probe === 'suffix'
                      ? custom('--suffix')
                      : probe === 'contains'
                        ? custom('--contains')
                        : probe === 'word' || probe === 'word-unicode'
                          ? custom('--word')
                          : probe === 'dash'
                            ? custom('--dash')
                            : probe === 'flags'
                              ? `${custom('--insensitive')}|${custom('--sensitive')}`
                              : probe === 'external'
                                ? `${custom('--external')}|${custom('--empty-prefix')}|${custom('--empty-suffix')}|${custom('--empty-contains')}`
                                : probe === 'paint'
                                  ? style.stroke
                                  : probe === 'specificity'
                                    ? style.fill
                                    : probe === 'foreign'
                                      ? custom('--foreign')
                                      : `${style.opacity}|${custom('--foreign')}`;
        const values = probes[probe] ?? [];
        values.push(observed);
        probes[probe] = values;
      }
      return probes;
    });
  } finally {
    await page.close();
  }
}

async function readOpacity(markup: string): Promise<string> {
  const page = await browser.newPage();
  try {
    await page.goto(`data:image/svg+xml,${encodeURIComponent(markup)}`);
    return await page
      .locator('[data-probe="target"]')
      .evaluate((element) => getComputedStyle(element).opacity);
  } finally {
    await page.close();
  }
}

describe('rewritten XML reference attribute selectors', () => {
  it('preserves standalone matches, non-matches, namespaces, flags, operators, and specificity', async () => {
    // Given
    const standalone = await readProbes(svg);

    // When
    const result = compose(svg);
    const composed = await readProbes(result);

    // Then
    expect(Object.keys(composed)).toEqual(Object.keys(standalone));
    for (const [probe, expected] of Object.entries(standalone)) {
      expect(composed[probe], probe).toEqual([expected[0], expected[0]]);
    }
    expect(standalone['wild-id']).toEqual(['yes']);
    expect(standalone['mixed-id']).toEqual(['yes']);
    expect(standalone['wild-href']).toEqual(['0.4|']);
    expect(standalone['named-xlink']).toEqual(['7px']);
    expect(standalone.prefix).toEqual(['yes']);
    expect(standalone.suffix).toEqual(['yes']);
    expect(standalone.contains).toEqual(['yes']);
    expect(standalone.word).toEqual(['yes']);
    expect(standalone['word-unicode']).toEqual(['']);
    expect(standalone.dash).toEqual(['yes']);
    expect(standalone.flags).toEqual(['yes|']);
    expect(standalone.external).toEqual(['yes|||']);
    expect(standalone.paint).toEqual(['rgb(0, 255, 0)']);
    expect(standalone.specificity).toEqual(['rgb(0, 0, 255)']);
    expect(standalone.foreign).toEqual(['yes']);
    expect(standalone.mixed).toEqual(['0.4']);
    expect(standalone.negative).toEqual(['1|']);
    expect(result).toContain('@namespace maeulNs1 ');
    expect(result).not.toContain('@namespace maeulNs0 ');
  });

  it.each([
    {
      name: 'default namespace never-match branch',
      source:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:h="http://www.w3.org/1999/xhtml"><style>@namespace "http://www.w3.org/2000/svg"; *|*[data-probe="target"][id^="archive-dark"] {opacity:.3}</style><foreignObject><h:div id="ordinary" data-probe="target"/></foreignObject></svg>',
    },
    {
      name: 'escaped namespace separator',
      source:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:l="http://www.w3.org/1999/xlink"><style>@namespace l "http://www.w3.org/1999/xlink"; [l\\|href="#shape"] {opacity:.3}</style><path id="shape"/><use data-probe="target" l:href="#shape"/></svg>',
    },
    {
      name: 'generated namespace type-selector prefix',
      source:
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:h="http://www.w3.org/1999/xhtml"><style>maeulNs0|div {opacity:.2} [*|id="paint"] {stroke:red}</style><rect id="paint"/><foreignObject><h:div h:id="paint" data-probe="target"/></foreignObject></svg>',
    },
  ])('does not create a false positive for $name', async ({ source }) => {
    // Given
    const standalone = await readOpacity(source);

    // When
    const rewritten = namespaceAndPositionSvg(source, 'archive-dark-0-', 0, 0);
    const composed = await readOpacity(rewritten);

    // Then
    expect(standalone).toBe('1');
    expect(composed).toBe(standalone);
  });
});
