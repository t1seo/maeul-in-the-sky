import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chromium, type Browser } from '@playwright/test';
import { renderArchiveComparison } from '../src/archive/comparison.js';
import { createArchive } from '../src/core/archive/comparison.js';
import { snapshot } from './cli/fixtures.js';

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
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
      name: 'xml-semantics',
      displayName: 'XML semantics',
      description: 'XML namespacing regression fixture',
      render: () => ({ dark: svg, light: svg }),
    },
    'shared-p90',
  ).dark;
}

describe('custom archive XML semantics in standalone SVG', () => {
  it('composes qualified roots and normalized references without nested document wrappers', async () => {
    // Given
    const declaration = "<?xml version='1.0' encoding='UTF-8'?>";
    const doctype = '<!DOCTYPE s:svg>';
    const processing = "<?theme keep='ordinary processing instruction'?>";
    const svg = `${declaration}${doctype}<!-- preserved -->${processing}
<s:svg xmlns:s='${SVG_NAMESPACE}' xmlns:xlink='http://www.w3.org/1999/xlink' data-theme-root='true' X='17' Y='19' width='420' height='360'>
  <s:style>#sh&#x61;pe { fill: rgb(255, 0, 0) }</s:style>
  <s:defs><s:linearGradient id='pa&#x69;nt'><s:stop stop-color='rgb(0, 0, 255)'/></s:linearGradient></s:defs>
  <s:path id='sh&#97;pe' d='M0 0h10v10z'/>
  <s:rect id='painted' x='20' width='10' height='10' fill='url(#paint)'/>
  <s:use id='copy' xlink:href='#sh&#x61;pe' x='40'/>
  <s:rect id="safe&#x22; onload=&#x22;alert(1)" x='60' width='10' height='10'/>
</s:svg>`;
    const result = compose(svg);
    const page = await browser.newPage();

    try {
      // When
      await page.goto(`data:image/svg+xml,${encodeURIComponent(result)}`);
      const state = await page.evaluate((namespace) => {
        const parserErrors = document.getElementsByTagName('parsererror').length;
        const roots = [...document.getElementsByTagNameNS(namespace, 'svg')]
          .filter((element) => element.getAttribute('data-theme-root') === 'true')
          .map((element) => ({
            nodeName: element.nodeName,
            x: element.getAttribute('x'),
            y: element.getAttribute('y'),
            upperX: element.getAttribute('X'),
            upperY: element.getAttribute('Y'),
            top: element.getBoundingClientRect().top,
          }));
        const shapes = [...document.querySelectorAll('[id$="-shape"]')];
        const painted = [...document.querySelectorAll('[id$="-painted"]')].map((element) => {
          const fill = element.getAttribute('fill') ?? '';
          const target = /^url\(#(.+)\)$/.exec(fill)?.[1];
          return target
            ? document.getElementById(target)?.querySelector('stop')?.getAttribute('stop-color')
            : null;
        });
        const copies = [...document.querySelectorAll('[id$="-copy"]')].map((element) => {
          const reference = element.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
          return reference?.startsWith('#')
            ? document.getElementById(reference.slice(1)) !== null
            : false;
        });
        return {
          parserErrors,
          roots,
          shapeFill: shapes.map((element) => getComputedStyle(element).fill),
          painted,
          copies,
          scripts: document.scripts.length,
          handlers: document.querySelectorAll('[onload],[onclick],[onerror]').length,
          suspiciousIds: [...document.querySelectorAll('[id*="onload"]')].map(
            (element) => element.id,
          ),
        };
      }, SVG_NAMESPACE);

      // Then
      expect(state.parserErrors).toBe(0);
      expect(
        state.roots.map(({ nodeName, x, y, upperX, upperY }) => ({
          nodeName,
          x,
          y,
          upperX,
          upperY,
        })),
      ).toEqual([
        { nodeName: 's:svg', x: '0', y: '94', upperX: '17', upperY: '19' },
        { nodeName: 's:svg', x: '0', y: '484', upperX: '17', upperY: '19' },
      ]);
      expect((state.roots[1]?.top ?? 0) - (state.roots[0]?.top ?? 0)).toBe(390);
      expect(state.shapeFill).toEqual(['rgb(255, 0, 0)', 'rgb(255, 0, 0)']);
      expect(state.painted).toEqual(['rgb(0, 0, 255)', 'rgb(0, 0, 255)']);
      expect(state.copies).toEqual([true, true]);
      expect(state.scripts).toBe(0);
      expect(state.handlers).toBe(0);
      expect(state.suspiciousIds).toHaveLength(2);
      expect(result).not.toContain(declaration);
      expect(result).not.toContain(doctype);
      expect(result.split(processing)).toHaveLength(3);
    } finally {
      await page.close();
    }
  });
});
