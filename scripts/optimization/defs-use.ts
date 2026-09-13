import { optimize, type XastElement, type XastRoot } from 'svgo';
import { sha256 } from './measure.js';

function isStaticPine(node: XastElement): boolean {
  if (node.name !== 'g' || Object.keys(node.attributes).join() !== 'transform') return false;
  if (!/^translate\([\d., -]+\)$/.test(node.attributes.transform)) return false;
  if (
    node.children.length !== 7 ||
    node.children.some(
      (child) =>
        child.type !== 'element' ||
        child.children.length > 0 ||
        child.attributes.id ||
        child.attributes.class ||
        child.attributes.style,
    )
  )
    return false;
  const first = node.children[0];
  const silhouette = node.children[2];
  return (
    first.type === 'element' &&
    first.name === 'ellipse' &&
    first.attributes.cy === '-0.2' &&
    silhouette.type === 'element' &&
    silhouette.name === 'polygon' &&
    ['0,-8.5 -2.8,-2 2.8,-2', '0,-5.5 -3.2,-1.5 3.2,-1.5', '1,-8.5 -1.8,-3 3.8,-3'].includes(
      silhouette.attributes.points,
    )
  );
}

export function shareStaticPines(svg: string): string {
  const groups = new Map<string, XastElement[]>();
  let rootElement: XastElement | undefined;
  const namespace = `opt-pine-${sha256(svg).slice(0, 12)}`;
  return optimize(svg, {
    plugins: [
      {
        name: 'static-pine-experiment',
        fn: (_root: XastRoot) => ({
          element: {
            enter(node) {
              if (node.name === 'svg' && rootElement === undefined) rootElement = node;
              if (!isStaticPine(node)) return;
              const key = JSON.stringify(node.children);
              const matches = groups.get(key);
              if (matches) matches.push(node);
              else groups.set(key, [node]);
            },
            exit(node) {
              if (node !== rootElement) return;
              const definitions: XastElement[] = [];
              for (const matches of groups.values()) {
                if (matches.length < 2) continue;
                const id = `${namespace}-${definitions.length}`;
                definitions.push({
                  type: 'element',
                  name: 'g',
                  attributes: { id },
                  children: matches[0].children,
                });
                for (const match of matches)
                  match.children = [
                    { type: 'element', name: 'use', attributes: { href: `#${id}` }, children: [] },
                  ];
              }
              if (definitions.length)
                node.children.unshift({
                  type: 'element',
                  name: 'defs',
                  attributes: {},
                  children: definitions,
                });
            },
          },
        }),
      },
    ],
  }).data;
}
