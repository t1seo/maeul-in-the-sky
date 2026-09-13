import { optimize, type XastElement } from 'svgo';

export function svgContract(svg: string) {
  const ids: string[] = [];
  const references: string[] = [];
  const protectedNodes: string[] = [];
  const protectedAttributes: string[] = [];
  let viewBox = '';
  let elements = 0;
  optimize(svg, {
    plugins: [
      {
        name: 'inspect-contract',
        fn: () => ({
          element: {
            enter(node: XastElement) {
              elements++;
              if (node.name === 'svg') viewBox = node.attributes.viewBox ?? '';
              if (node.attributes.id) ids.push(node.attributes.id);
              if (
                [
                  'title',
                  'desc',
                  'text',
                  'style',
                  'animate',
                  'animateMotion',
                  'animateTransform',
                  'set',
                ].includes(node.name)
              ) {
                protectedNodes.push(JSON.stringify(node));
              }
              for (const [name, value] of Object.entries(node.attributes)) {
                if (
                  name === 'id' ||
                  name === 'class' ||
                  name === 'style' ||
                  name.startsWith('aria-') ||
                  name.startsWith('data-')
                ) {
                  protectedAttributes.push(`${node.name}:${name}=${value}`);
                }
                if (name === 'href' || name === 'xlink:href')
                  references.push(value.replace(/^#/, ''));
                if (name === 'aria-labelledby' || name === 'aria-describedby')
                  references.push(...value.split(/\s+/));
                for (const match of value.matchAll(/url\(["']?#([^)'"\s]+)["']?\)/g))
                  references.push(match[1]);
                if (name === 'begin' || name === 'end') {
                  for (const match of value.matchAll(/(?:^|;)\s*([a-zA-Z_][\w-]*)\./g))
                    references.push(match[1]);
                }
              }
            },
          },
        }),
      },
    ],
  });
  return {
    viewBox,
    ids,
    references,
    protectedNodes,
    protectedAttributes,
    elements,
    missingReferences: references.filter((id) => !ids.includes(id)),
    duplicateIds: ids.length - new Set(ids).size,
  };
}

export function compareContracts(before: string, after: string) {
  const a = svgContract(before);
  const b = svgContract(after);
  return {
    preserved: [
      'viewBox',
      'ids',
      'references',
      'protectedNodes',
      'protectedAttributes',
      'elements',
    ].every((key) => JSON.stringify(Reflect.get(a, key)) === JSON.stringify(Reflect.get(b, key))),
    inputMissingReferences: a.missingReferences,
    outputMissingReferences: b.missingReferences,
    inputDuplicateIds: a.duplicateIds,
    outputDuplicateIds: b.duplicateIds,
  };
}
