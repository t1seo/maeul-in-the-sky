import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { optimize, querySelectorAll } from 'svgo';
import type { XastElement, XastRoot } from 'svgo';

const SMIL = new Set(['animate', 'animateMotion', 'animateTransform', 'set']);
const hasAnimation = (declarations: string) =>
  [...declarations.matchAll(/(?:^|;)\s*(?:-webkit-)?animation(?:-name)?\s*:([^;]+)/gi)].some(
    (match) => !/^(?:none|initial|inherit|unset)\b/i.test(match[1].trim()),
  );

/** Structural targets, not computed/cascaded browser animations or a frame-cost estimate. */
export function measureSvg(svg: string) {
  const elements: XastElement[] = [];
  let root: XastRoot | undefined;
  optimize(svg, {
    plugins: [
      {
        name: 'measure-only',
        fn: (tree) => {
          root = tree;
          return {
            element: {
              enter: (element) => {
                elements.push(element);
              },
            },
          };
        },
      },
    ],
  });
  if (!root || elements[0]?.name !== 'svg') throw new SyntaxError('Expected an SVG document');
  const ids = new Set<string>();
  const duplicateIds = new Set<string>();
  const references = new Set<string>();
  const externalReferences = new Set<string>();
  const targets = new Set<XastElement>();
  const unsupportedSelectors = new Set<string>();
  let cssKeyframes = 0;
  let scripts = 0;
  let eventHandlers = 0;
  const textOf = (element: XastElement): string =>
    element.children
      .map((child): string => {
        if (child.type === 'text' || child.type === 'cdata') return child.value;
        if (child.type === 'element') return textOf(child);
        return '';
      })
      .join('');
  const addUrl = (url: string) => {
    if (url.startsWith('#')) references.add(url.slice(1));
    else externalReferences.add(url);
  };
  const scanUrls = (value: string) => {
    for (const match of value.matchAll(/url\(\s*['"]?([^\s)'"\\]+)['"]?\s*\)/g)) addUrl(match[1]);
  };
  for (const element of elements) {
    const id = element.attributes.id;
    if (id) {
      if (ids.has(id)) duplicateIds.add(id);
      ids.add(id);
    }
    if (element.name === 'script') scripts++;
    if (hasAnimation(element.attributes.style ?? '')) targets.add(element);
    for (const [name, value] of Object.entries(element.attributes)) {
      scanUrls(value);
      if (name === 'href' || name === 'xlink:href') addUrl(value);
      if (name === 'aria-labelledby' || name === 'aria-describedby') {
        for (const reference of value.split(/\s+/).filter(Boolean)) references.add(reference);
      }
      if (name === 'begin' || name === 'end') {
        for (const match of value.matchAll(/(?:^|;)\s*([\w-]+)\.[a-zA-Z]/g))
          references.add(match[1]);
      }
      if (/^on/i.test(name)) eventHandlers++;
    }
    if (element.name !== 'style') continue;
    const css = textOf(element).replace(/\/\*[\s\S]*?\*\//g, '');
    scanUrls(css);
    cssKeyframes += [...css.matchAll(/@(?:-webkit-)?keyframes\s/g)].length;
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!hasAnimation(rule[2])) continue;
      const selector = rule[1].trim();
      try {
        for (const match of querySelectorAll(root, selector)) {
          if (match.type === 'element') targets.add(match);
        }
      } catch (error) {
        if (!(error instanceof Error)) throw error;
        unsupportedSelectors.add(selector);
      }
    }
  }
  return {
    rawBytes: Buffer.byteLength(svg),
    gzipBytes: gzipSync(svg, { level: 9 }).byteLength,
    sha256: createHash('sha256').update(svg).digest('hex'),
    elements: elements.length,
    cssTargets: targets.size,
    cssKeyframes,
    smilElements: elements.filter((node) => SMIL.has(node.name)).length,
    duplicateIds: [...duplicateIds].sort(),
    danglingReferences: [...references].filter((id) => !ids.has(id)).sort(),
    externalReferences: [...externalReferences].sort(),
    unsupportedSelectors: [...unsupportedSelectors].sort(),
    scripts,
    eventHandlers,
    viewBox: elements[0].attributes.viewBox ?? '',
    title: elements
      .filter((node) => node.name === 'title')
      .map(textOf)
      .join('\n'),
    description: elements
      .filter((node) => node.name === 'desc')
      .map(textOf)
      .join('\n'),
  };
}
export type SvgMetrics = ReturnType<typeof measureSvg>;
