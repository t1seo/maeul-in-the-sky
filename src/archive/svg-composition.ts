import { rewriteCssAttribute, rewriteReferenceAttribute, rewriteStylesheet } from './svg-css.js';
import { stylesheetAttributeNames, type CssRowScope } from './svg-css-scope.js';
import { serializeCssCdata } from './svg-css-serialization.js';
import type { CssAttributeState } from './svg-css-selectors.js';
import {
  parseSvgDocument,
  rewriteTagAttributes,
  setRootAttribute,
  setRootCoordinate,
  SVG_NAMESPACE,
  type ParsedSvgDocument,
  type XmlAttribute,
  type XmlElement,
} from './svg-xml.js';

const XLINK_NAMESPACE = 'http://www.w3.org/1999/xlink';
const ROW_SCOPE_ATTRIBUTE = 'data-maeul-archive-scope';

function timingSafeId(prefix: string, id: string): string {
  const encoded = [...id]
    .map((character) => (character.codePointAt(0) ?? 0).toString(16))
    .join('_');
  return `${prefix.replaceAll('-', '_')}smil_${encoded}`;
}

function unqualifiedAttribute(element: XmlElement, name: string): XmlAttribute | undefined {
  return [...element.attributes.values()].find(
    (attribute) => attribute.prefix === '' && attribute.local === name,
  );
}

function referenceAttributeName(attribute: XmlAttribute): string | undefined {
  if (attribute.prefix === '') return attribute.local;
  if (attribute.uri === XLINK_NAMESPACE && attribute.local === 'href') return 'xlink:href';
  return undefined;
}

function createIdMap(elements: readonly XmlElement[], prefix: string): ReadonlyMap<string, string> {
  const originalIds = elements
    .map((element) => unqualifiedAttribute(element, 'id')?.value)
    .filter((id): id is string => id !== undefined);
  const timingValues = elements.flatMap((element) =>
    ['begin', 'end']
      .map((name) => unqualifiedAttribute(element, name)?.value)
      .filter((value): value is string => value !== undefined),
  );
  return new Map(
    originalIds.map((id) => [
      id,
      timingValues.some((value) =>
        value.split(';').some((timing) => timing.trim().startsWith(`${id}.`)),
      )
        ? timingSafeId(prefix, id)
        : `${prefix}${id}`,
    ]),
  );
}

function createAttributeStates(
  elements: readonly XmlElement[],
  ids: ReadonlyMap<string, string>,
): readonly CssAttributeState[] {
  return elements.flatMap((element) =>
    [...element.attributes.values()].map((attribute) => {
      const name = referenceAttributeName(attribute);
      const rewritten =
        name === undefined
          ? attribute.value
          : (rewriteReferenceAttribute(name, attribute.value, ids) ??
            rewriteCssAttribute(name, attribute.value, ids) ??
            attribute.value);
      return {
        namespace: attribute.uri,
        local: attribute.local,
        original: attribute.value,
        rewritten,
      };
    }),
  );
}

function rewriteOpenTag(
  source: string,
  element: XmlElement,
  ids: ReadonlyMap<string, string>,
): string {
  return rewriteTagAttributes(source, element, (attribute) => {
    const name = referenceAttributeName(attribute);
    if (name === undefined) return undefined;
    const reference = rewriteReferenceAttribute(name, attribute.value, ids);
    return reference ?? rewriteCssAttribute(name, attribute.value, ids);
  });
}

function isStyleElement(element: XmlElement | undefined): boolean {
  return element?.local === 'style' && element.uri === SVG_NAMESPACE;
}

function stylesheetSources(
  document: ParsedSvgDocument,
): readonly { readonly source: string; readonly xmlEntities: boolean }[] {
  const sources: { source: string; xmlEntities: boolean }[] = [];
  const stack: XmlElement[] = [];
  let elementIndex = 0;
  for (const token of document.tokens) {
    if (token.kind === 'close') {
      stack.pop();
      continue;
    }
    if (token.kind === 'open') {
      const element = document.elements[elementIndex];
      elementIndex++;
      if (element !== undefined && !element.selfClosing) stack.push(element);
      continue;
    }
    if (!isStyleElement(stack.at(-1))) continue;
    if (token.kind === 'text') sources.push({ source: token.source, xmlEntities: true });
    if (token.kind === 'cdata') sources.push({ source: token.content, xmlEntities: false });
  }
  return sources;
}

function createRowScope(document: ParsedSvgDocument, prefix: string): CssRowScope | undefined {
  const stylesheets = stylesheetSources(document);
  if (stylesheets.length === 0) return undefined;
  const reserved = new Set(
    document.elements.flatMap((element) =>
      [...element.attributes.values()].map((attribute) => attribute.local),
    ),
  );
  for (const stylesheet of stylesheets) {
    for (const name of stylesheetAttributeNames(stylesheet.source, stylesheet.xmlEntities)) {
      reserved.add(name);
    }
  }
  let attribute = ROW_SCOPE_ATTRIBUTE;
  let index = 1;
  while (reserved.has(attribute)) {
    attribute = `${ROW_SCOPE_ATTRIBUTE}-${index}`;
    index++;
  }
  return { attribute, value: prefix };
}

export function namespaceAndPositionSvg(
  source: string,
  prefix: string,
  x: number,
  y: number,
): string {
  const document = parseSvgDocument(source);
  const ids = createIdMap(document.elements, prefix);
  const attributes = createAttributeStates(document.elements, ids);
  const scope = createRowScope(document, prefix);
  const stack: XmlElement[] = [];
  let elementIndex = 0;
  let positioned = false;

  return document.tokens
    .map((token) => {
      if (token.kind === 'declaration' || token.kind === 'doctype') return '';
      if (token.kind === 'text') {
        return isStyleElement(stack.at(-1)) && scope !== undefined
          ? rewriteStylesheet(token.source, ids, attributes, scope)
          : token.source;
      }
      if (token.kind === 'cdata') {
        return isStyleElement(stack.at(-1)) && scope !== undefined
          ? serializeCssCdata(rewriteStylesheet(token.content, ids, attributes, scope, false))
          : token.source;
      }
      if (token.kind === 'close') {
        stack.pop();
        return token.source;
      }
      if (token.kind !== 'open') return token.source;

      const element = document.elements[elementIndex];
      elementIndex++;
      if (element === undefined) return token.source;
      let rewritten = rewriteOpenTag(token.source, element, ids);
      if (!positioned && element.local === 'svg' && element.uri === SVG_NAMESPACE) {
        rewritten = setRootCoordinate(
          setRootCoordinate(rewritten, element, 'x', x),
          element,
          'y',
          y,
        );
        if (scope !== undefined) {
          rewritten = setRootAttribute(rewritten, element, scope.attribute, scope.value);
        }
        positioned = true;
      }
      if (!element.selfClosing) stack.push(element);
      return rewritten;
    })
    .join('');
}
