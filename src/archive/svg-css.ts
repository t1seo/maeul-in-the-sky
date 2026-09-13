import { ident, parse, url, walk, type CssNode } from 'css-tree';
import { InputValidationError } from '../core/settings/errors.js';
import {
  applyCssReplacements,
  cssReplacement,
  normalizeCssSource,
  type CssReplacement,
  type NormalizedCssSource,
} from './svg-css-source.js';
import {
  cssNamespaceRegistry,
  generatedNamespaceRules,
  normalizedCssKeyword,
  rewriteAttributeSelector,
  type CssAttributeState,
  type CssNamespaceRegistry,
} from './svg-css-selectors.js';
import { escapeCssXmlText } from './svg-css-serialization.js';
import { scopeStylesheet, type CssRowScope } from './svg-css-scope.js';
const IDREF_LIST_ATTRIBUTES = new Set([
  'aria-controls',
  'aria-describedby',
  'aria-labelledby',
  'aria-owns',
  'headers',
]);
const SINGLE_IDREF_ATTRIBUTES = new Set(['aria-activedescendant', 'aria-details', 'for']);
const CSS_VALUE_ATTRIBUTES =
  /^(clip-path|cursor|fill|filter|marker(?:-(end|mid|start))?|mask|stroke)$/;

function invalidCss(message: string): InputValidationError {
  return new InputValidationError([{ path: 'theme.svg.style', message }]);
}

function rewriteFragment(value: string, ids: ReadonlyMap<string, string>): string {
  if (!value.startsWith('#')) return value;
  const mapped = ids.get(value.slice(1));
  return mapped === undefined ? value : `#${mapped}`;
}

function rewriteIdList(value: string, ids: ReadonlyMap<string, string>): string {
  return value.replace(/[^\s]+/g, (id) => ids.get(id) ?? id);
}

export function rewriteTiming(value: string, ids: ReadonlyMap<string, string>): string {
  const candidates = [...ids.keys()].sort((left, right) => right.length - left.length);
  return value.replace(/[^;]+/g, (timing) => {
    const leading = timing.match(/^\s*/)?.[0] ?? '';
    const trailing = timing.match(/\s*$/)?.[0] ?? '';
    const core = timing.slice(leading.length, timing.length - trailing.length);
    const id = candidates.find((candidate) => core.startsWith(`${candidate}.`));
    if (id === undefined) return timing;
    return `${leading}${ids.get(id) ?? id}${core.slice(id.length)}${trailing}`;
  });
}

export function rewriteReferenceAttribute(
  name: string,
  value: string,
  ids: ReadonlyMap<string, string>,
): string | undefined {
  if (name === 'id') return ids.get(value) ?? value;
  if (name === 'href' || name === 'xlink:href') return rewriteFragment(value, ids);
  if (IDREF_LIST_ATTRIBUTES.has(name)) return rewriteIdList(value, ids);
  if (SINGLE_IDREF_ATTRIBUTES.has(name)) return ids.get(value) ?? value;
  if (name === 'begin' || name === 'end') return rewriteTiming(value, ids);
  return undefined;
}

function addReplacement(
  replacements: CssReplacement[],
  normalized: NormalizedCssSource,
  node: CssNode,
  value: string,
  xmlText: boolean,
): void {
  replacements.push(cssReplacement(normalized, node, value, xmlText));
}

function collectReplacement(
  replacements: CssReplacement[],
  normalized: NormalizedCssSource,
  node: CssNode,
  ids: ReadonlyMap<string, string>,
  selectors: boolean,
  xmlText: boolean,
  attributes: readonly CssAttributeState[],
  namespaces: CssNamespaceRegistry,
): void {
  if (node.type === 'Raw' && /#|url\s*\(/i.test(node.value)) {
    throw invalidCss('Unsupported raw CSS contains an ID reference');
  }
  if (selectors && node.type === 'IdSelector') {
    const mapped = ids.get(ident.decode(node.name));
    if (mapped !== undefined) {
      addReplacement(replacements, normalized, node, `#${ident.encode(mapped)}`, xmlText);
    }
    return;
  }
  if (node.type === 'Url') {
    if (namespaces.declarationUrls.has(node)) return;
    const mapped = rewriteFragment(node.value, ids);
    if (mapped !== node.value) {
      addReplacement(replacements, normalized, node, url.encode(mapped), xmlText);
    }
    return;
  }
  if (!selectors || node.type !== 'AttributeSelector' || node.value === null) {
    return;
  }
  const rewrite = rewriteAttributeSelector(node, attributes, namespaces);
  if (rewrite.kind === 'unsupported') throw invalidCss(rewrite.message);
  if (rewrite.kind === 'selector') {
    addReplacement(replacements, normalized, node, rewrite.value, xmlText);
  }
}

function namespaceInsertionOffset(ast: CssNode): number {
  if (ast.type !== 'StyleSheet') return 0;
  let preImportOffset = 0;
  let importOffset: number | undefined;
  for (const node of ast.children) {
    if (node.type !== 'Atrule') break;
    const name = normalizedCssKeyword(node.name);
    const allowed =
      name === 'charset' || name === 'import' || (name === 'layer' && node.block === null);
    if (!allowed) break;
    const end = node.loc?.end.offset;
    if (end === undefined) continue;
    if (name === 'import') {
      importOffset = end;
    } else if (importOffset === undefined) {
      preImportOffset = end;
    }
  }
  return importOffset ?? preImportOffset;
}

function rewriteCss(
  source: string,
  ids: ReadonlyMap<string, string>,
  context: 'stylesheet' | 'declarationList' | 'value',
  xmlEntities: boolean,
  attributes: readonly CssAttributeState[],
): string {
  const normalized = normalizeCssSource(source, xmlEntities);
  let ast: CssNode;
  try {
    ast = parse(normalized.value, { context, parseCustomProperty: true, positions: true });
  } catch (error) {
    if (error instanceof Error) throw invalidCss(`Unable to parse CSS: ${error.message}`);
    throw error;
  }
  const replacements: CssReplacement[] = [];
  const namespaces = cssNamespaceRegistry(ast);
  walk(ast, (node) =>
    collectReplacement(
      replacements,
      normalized,
      node,
      ids,
      context === 'stylesheet',
      xmlEntities,
      attributes,
      namespaces,
    ),
  );
  const namespaceRules = generatedNamespaceRules(namespaces);
  if (namespaceRules !== '') {
    const normalizedOffset = namespaceInsertionOffset(ast);
    const offset = normalized.offsets[normalizedOffset];
    if (offset === undefined) throw invalidCss('CSS namespace insertion position is invalid');
    replacements.push({
      start: offset,
      end: offset,
      value: xmlEntities ? escapeCssXmlText(namespaceRules) : namespaceRules,
    });
  }
  return applyCssReplacements(source, replacements);
}

export function rewriteStylesheet(
  source: string,
  ids: ReadonlyMap<string, string>,
  attributes: readonly CssAttributeState[],
  scope: CssRowScope,
  xmlEntities = true,
): string {
  const rewritten = rewriteCss(source, ids, 'stylesheet', xmlEntities, attributes);
  return scopeStylesheet(rewritten, scope, xmlEntities);
}

export function rewriteCssAttribute(
  name: string,
  source: string,
  ids: ReadonlyMap<string, string>,
): string | undefined {
  if (name === 'style') return rewriteCss(source, ids, 'declarationList', false, []);
  return CSS_VALUE_ATTRIBUTES.test(name) ? rewriteCss(source, ids, 'value', false, []) : undefined;
}
