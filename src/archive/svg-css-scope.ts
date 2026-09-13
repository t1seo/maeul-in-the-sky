import {
  ident,
  parse,
  string as cssString,
  walk,
  type CssNode,
  type Selector,
  type WalkContext,
} from 'css-tree';
import { InputValidationError } from '../core/settings/errors.js';
import { escapeCssXmlText } from './svg-css-serialization.js';
import {
  applyCssReplacements,
  cssReplacement,
  normalizeCssSource,
  type CssReplacement,
  type NormalizedCssSource,
} from './svg-css-source.js';
import { normalizedCssKeyword } from './svg-css-selectors.js';

export type CssRowScope = {
  readonly attribute: string;
  readonly value: string;
};

function invalidCss(message: string): InputValidationError {
  return new InputValidationError([{ path: 'theme.svg.style', message }]);
}

function parseStylesheet(
  source: string,
  xmlEntities: boolean,
): {
  readonly ast: CssNode;
  readonly normalized: NormalizedCssSource;
} {
  const normalized = normalizeCssSource(source, xmlEntities);
  try {
    return {
      ast: parse(normalized.value, {
        context: 'stylesheet',
        parseCustomProperty: true,
        positions: true,
      }),
      normalized,
    };
  } catch (error) {
    if (error instanceof Error) throw invalidCss(`Unable to parse CSS: ${error.message}`);
    throw error;
  }
}

function namespaceSeparator(encoded: string): number {
  for (let index = encoded.length - 1; index >= 0; index--) {
    if (encoded[index] !== '|') continue;
    let backslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && encoded[cursor] === '\\'; cursor--) {
      backslashes++;
    }
    if (backslashes % 2 === 0) return index;
  }
  return -1;
}

export function stylesheetAttributeNames(
  source: string,
  xmlEntities: boolean,
): ReadonlySet<string> {
  const { ast } = parseStylesheet(source, xmlEntities);
  const names = new Set<string>();
  walk(ast, (node) => {
    if (node.type !== 'AttributeSelector') return;
    const separator = namespaceSeparator(node.name.name);
    names.add(ident.decode(node.name.name.slice(separator + 1)));
  });
  return names;
}

function selectorBoundary(scope: CssRowScope): string {
  const attribute = ident.encode(scope.attribute);
  const exact = `*|*[${attribute}=${cssString.encode(scope.value)}]`;
  return `:where(${exact},${exact} *|*)`;
}

function selectorInsertions(
  selector: Selector,
  boundary: string,
  subjectOnly: boolean,
  normalized: NormalizedCssSource,
  xmlEntities: boolean,
): readonly CssReplacement[] {
  const location = selector.loc;
  if (location === undefined) throw invalidCss('CSS selector has no source position');
  const children = selector.children.toArray();
  let lastCombinator = -1;
  for (const [index, child] of children.entries()) {
    if (child.type === 'Combinator') lastCombinator = index;
  }
  const relative = children[0]?.type === 'Combinator';
  const suffixNode = children
    .slice(lastCombinator + 1)
    .find((child) => child.type === 'PseudoElementSelector');
  const encodedBoundary = xmlEntities ? escapeCssXmlText(boundary) : boundary;
  const replacements: CssReplacement[] = [];
  if (!subjectOnly && !relative) {
    const leading = children[0];
    const normalizedOffset =
      leading?.type === 'TypeSelector' || leading?.type === 'NestingSelector'
        ? (leading.loc?.end.offset ?? location.start.offset)
        : location.start.offset;
    const start = normalized.offsets[normalizedOffset];
    if (start === undefined) throw invalidCss('CSS selector start position is invalid');
    replacements.push({ start, end: start, value: encodedBoundary });
  }
  if (subjectOnly || relative || lastCombinator >= 0) {
    const normalizedOffset = suffixNode?.loc?.start.offset ?? location.end.offset;
    const end = normalized.offsets[normalizedOffset];
    if (end === undefined) throw invalidCss('CSS selector subject position is invalid');
    replacements.push({ start: end, end, value: encodedBoundary });
  }
  return replacements;
}

function isKeyframes(name: string): boolean {
  return name === 'keyframes' || /^-[a-z]+-keyframes$/.test(name);
}

export function scopeStylesheet(source: string, scope: CssRowScope, xmlEntities: boolean): string {
  const { ast, normalized } = parseStylesheet(source, xmlEntities);
  const boundary = selectorBoundary(scope);
  const rootReplacement = `[${ident.encode(scope.attribute)}]`;
  const zeroSpecificityRootReplacement = `:where(${rootReplacement})`;
  const rootReplacements: CssReplacement[] = [];
  const selectorReplacements: CssReplacement[] = [];
  const atRules: string[] = [];
  walk(ast, {
    enter(this: WalkContext, node: CssNode) {
      if (node.type === 'Atrule') {
        atRules.push(normalizedCssKeyword(node.name));
        return;
      }
      if (
        node.type !== 'Rule' ||
        node.prelude.type !== 'SelectorList' ||
        atRules.some(isKeyframes)
      ) {
        return;
      }
      const nestedRule = this.rule !== null;
      for (const selector of node.prelude.children) {
        if (selector.type !== 'Selector') continue;
        walk(selector, (selectorNode) => {
          const keyword =
            selectorNode.type === 'PseudoClassSelector' && selectorNode.children === null
              ? normalizedCssKeyword(selectorNode.name)
              : undefined;
          if (
            keyword === 'root' ||
            (keyword === 'scope' && !atRules.includes('scope')) ||
            (selectorNode.type === 'NestingSelector' && !nestedRule)
          ) {
            rootReplacements.push(
              cssReplacement(
                normalized,
                selectorNode,
                selectorNode.type === 'NestingSelector'
                  ? zeroSpecificityRootReplacement
                  : rootReplacement,
                xmlEntities,
              ),
            );
          }
        });
        selectorReplacements.push(
          ...selectorInsertions(selector, boundary, nestedRule, normalized, xmlEntities),
        );
        walk(selector, {
          visit: 'Selector',
          enter(nestedSelector) {
            if (nestedSelector === selector) return;
            const relativePseudo =
              this.function?.type === 'PseudoClassSelector' &&
              normalizedCssKeyword(this.function.name) === 'has';
            selectorReplacements.push(
              ...selectorInsertions(
                nestedSelector,
                boundary,
                relativePseudo,
                normalized,
                xmlEntities,
              ),
            );
          },
        });
      }
    },
    leave(this: WalkContext, node: CssNode) {
      if (node.type === 'Atrule') atRules.pop();
    },
  });
  return applyCssReplacements(source, [...rootReplacements, ...selectorReplacements]);
}
