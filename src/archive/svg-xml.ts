import { SaxesParser } from 'saxes';
import { InputValidationError } from '../core/settings/errors.js';

export const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

export type XmlAttribute = {
  readonly name: string;
  readonly local: string;
  readonly prefix: string;
  readonly uri: string;
  readonly value: string;
};

export type XmlElement = {
  readonly name: string;
  readonly local: string;
  readonly uri: string;
  readonly selfClosing: boolean;
  readonly attributes: ReadonlyMap<string, XmlAttribute>;
};

export type XmlToken =
  | { readonly kind: 'open'; readonly source: string; readonly name: string }
  | { readonly kind: 'close'; readonly source: string; readonly name: string }
  | {
      readonly kind: 'text' | 'comment' | 'pi' | 'doctype' | 'declaration';
      readonly source: string;
    }
  | { readonly kind: 'cdata'; readonly source: string; readonly content: string };

export type ParsedSvgDocument = {
  readonly tokens: readonly XmlToken[];
  readonly elements: readonly XmlElement[];
};

type AttributeRewriter = (attribute: XmlAttribute) => string | undefined;

const ATTRIBUTE_PATTERN = /(\s)([^\s=/>]+)(\s*=\s*)(["'])([\s\S]*?)\4/g;

function invalidXml(message: string): InputValidationError {
  return new InputValidationError([{ path: 'theme.svg', message }]);
}

function findMarkupEnd(source: string, start: number, declaration: boolean): number {
  let quote: string | undefined;
  let subsetDepth = 0;
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (quote !== undefined) {
      if (character === quote) quote = undefined;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (declaration && character === '[') subsetDepth++;
    else if (declaration && character === ']') subsetDepth = Math.max(0, subsetDepth - 1);
    else if (character === '>' && subsetDepth === 0) return index + 1;
  }
  return source.length;
}

function scanMarkup(source: string): readonly XmlToken[] {
  const tokens: XmlToken[] = [];
  let cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf('<', cursor);
    if (opening < 0) {
      tokens.push({ kind: 'text', source: source.slice(cursor) });
      break;
    }
    if (opening > cursor) tokens.push({ kind: 'text', source: source.slice(cursor, opening) });
    if (source.startsWith('<!--', opening)) {
      const close = source.indexOf('-->', opening + 4);
      const end = close < 0 ? source.length : close + 3;
      tokens.push({ kind: 'comment', source: source.slice(opening, end) });
      cursor = end;
      continue;
    }
    if (source.startsWith('<![CDATA[', opening)) {
      const close = source.indexOf(']]>', opening + 9);
      const end = close < 0 ? source.length : close + 3;
      tokens.push({
        kind: 'cdata',
        source: source.slice(opening, end),
        content: source.slice(opening + 9, close < 0 ? source.length : close),
      });
      cursor = end;
      continue;
    }
    if (source.startsWith('<?', opening)) {
      const close = source.indexOf('?>', opening + 2);
      const end = close < 0 ? source.length : close + 2;
      const tokenSource = source.slice(opening, end);
      tokens.push({
        kind: /^<\?xml(?:\s|\?>)/.test(tokenSource) ? 'declaration' : 'pi',
        source: tokenSource,
      });
      cursor = end;
      continue;
    }
    if (source.startsWith('<!', opening)) {
      const end = findMarkupEnd(source, opening + 2, true);
      tokens.push({ kind: 'doctype', source: source.slice(opening, end) });
      cursor = end;
      continue;
    }
    const end = findMarkupEnd(source, opening + 1, false);
    const tag = source.slice(opening, end);
    const match = /^<\s*(\/?)\s*([^\s/>]+)/.exec(tag);
    if (match === null || match[2] === undefined) {
      tokens.push({ kind: 'text', source: tag });
      cursor = end;
      continue;
    }
    tokens.push({
      kind: match[1] === '/' ? 'close' : 'open',
      source: tag,
      name: match[2],
    });
    cursor = end;
  }
  return tokens;
}

function semanticElements(source: string): readonly XmlElement[] {
  const elements: XmlElement[] = [];
  const parser = new SaxesParser({ xmlns: true });
  parser.on('opentag', (tag) => {
    const attributes = new Map(
      Object.values(tag.attributes).map((attribute) => [
        attribute.name,
        {
          name: attribute.name,
          local: attribute.local,
          prefix: attribute.prefix,
          uri: attribute.uri,
          value: attribute.value,
        },
      ]),
    );
    elements.push({
      name: tag.name,
      local: tag.local,
      uri: tag.uri,
      selfClosing: tag.isSelfClosing,
      attributes,
    });
  });
  try {
    parser.write(source).close();
  } catch (error) {
    if (error instanceof Error) throw invalidXml(`Malformed SVG XML: ${error.message}`);
    throw error;
  }
  return elements;
}

export function parseSvgDocument(source: string): ParsedSvgDocument {
  const tokens = scanMarkup(source);
  const elements = semanticElements(source);
  const lexicalOpenCount = tokens.filter((token) => token.kind === 'open').length;
  if (lexicalOpenCount !== elements.length) throw invalidXml('Unable to align SVG XML tokens');
  const root = elements[0];
  if (root === undefined || root.local !== 'svg' || root.uri !== SVG_NAMESPACE) {
    throw invalidXml('Theme output must have an SVG namespace document element');
  }
  return { tokens, elements };
}

function escapeAttributeValue(value: string, quote: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll(quote, quote === '"' ? '&quot;' : '&apos;');
}

export function rewriteTagAttributes(
  source: string,
  element: XmlElement,
  rewrite: AttributeRewriter,
): string {
  return source.replace(
    ATTRIBUTE_PATTERN,
    (attribute, space: string, name: string, equals: string, quote: string) => {
      const semantic = element.attributes.get(name);
      if (semantic === undefined) return attribute;
      const value = rewrite(semantic);
      return value === undefined
        ? attribute
        : `${space}${name}${equals}${quote}${escapeAttributeValue(value, quote)}${quote}`;
    },
  );
}

export function setRootAttribute(
  source: string,
  element: XmlElement,
  name: string,
  value: string,
): string {
  const current = [...element.attributes.values()].find(
    (attribute) => attribute.prefix === '' && attribute.local === name,
  );
  if (current !== undefined) {
    return rewriteTagAttributes(source, element, (attribute) =>
      attribute.name === current.name ? value : undefined,
    );
  }
  const closingLength = /\/\s*>$/.test(source) ? 2 : 1;
  return `${source.slice(0, -closingLength)} ${name}="${value}"${source.slice(-closingLength)}`;
}

export function setRootCoordinate(
  source: string,
  element: XmlElement,
  name: 'x' | 'y',
  value: number,
): string {
  return setRootAttribute(source, element, name, String(value));
}
