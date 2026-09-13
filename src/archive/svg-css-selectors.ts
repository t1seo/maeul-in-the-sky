import { ident, string as cssString, walk, type AttributeSelector, type CssNode } from 'css-tree';

export type CssAttributeState = {
  readonly namespace: string;
  readonly local: string;
  readonly original: string;
  readonly rewritten: string;
};

export type CssNamespaceRegistry = {
  readonly bindings: Map<string, string>;
  readonly generated: Map<string, string>;
  readonly reserved: Set<string>;
  readonly declarationUrls: ReadonlySet<CssNode>;
};

export type AttributeSelectorRewrite =
  | { readonly kind: 'none' }
  | { readonly kind: 'selector'; readonly value: string }
  | { readonly kind: 'unsupported'; readonly message: string };

function asciiInsensitive(value: string): string {
  return value.replace(/[A-Z]/g, (character) => character.toLowerCase());
}

export function normalizedCssKeyword(name: string): string {
  return asciiInsensitive(ident.decode(name));
}

type SelectorTarget =
  | { readonly kind: 'none'; readonly local: string; readonly explicit: boolean }
  | {
      readonly kind: 'named';
      readonly local: string;
      readonly prefix: string;
      readonly uri: string;
    }
  | { readonly kind: 'wildcard'; readonly local: string };

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

function reserveSelectorPrefix(encoded: string, reserved: Set<string>): void {
  const separator = namespaceSeparator(encoded);
  if (separator < 0) return;
  const prefix = ident.decode(encoded.slice(0, separator));
  if (prefix !== '' && prefix !== '*') reserved.add(prefix);
}

export function cssNamespaceRegistry(ast: CssNode): CssNamespaceRegistry {
  const bindings = new Map<string, string>();
  const reserved = new Set<string>();
  const declarationUrls = new Set<CssNode>();
  walk(ast, (node) => {
    if (node.type === 'AttributeSelector') {
      reserveSelectorPrefix(node.name.name, reserved);
    }
    if (node.type === 'TypeSelector') {
      reserveSelectorPrefix(node.name, reserved);
    }
    if (
      node.type !== 'Atrule' ||
      normalizedCssKeyword(node.name) !== 'namespace' ||
      node.prelude === null
    ) {
      return;
    }
    const children = node.prelude.type === 'AtrulePrelude' ? node.prelude.children.toArray() : [];
    const namespace = children.at(-1);
    if (namespace?.type !== 'String' && namespace?.type !== 'Url') return;
    if (namespace.type === 'Url') declarationUrls.add(namespace);
    const prefix = children.length > 1 ? children[0] : undefined;
    if (prefix?.type === 'Identifier') {
      bindings.set(ident.decode(prefix.name), namespace.value);
      reserved.add(ident.decode(prefix.name));
    }
  });
  return { bindings, generated: new Map<string, string>(), reserved, declarationUrls };
}

export function generatedNamespaceRules(registry: CssNamespaceRegistry): string {
  return [...registry.generated]
    .map(([uri, prefix]) => `@namespace ${prefix} ${cssString.encode(uri)};`)
    .join('');
}

function generatedPrefix(registry: CssNamespaceRegistry, uri: string): string {
  const existing = [...registry.bindings].find(([, namespace]) => namespace === uri)?.[0];
  if (existing !== undefined) return existing;
  const generated = registry.generated.get(uri);
  if (generated !== undefined) return generated;
  let index = registry.generated.size;
  let prefix = `maeulNs${index}`;
  while (registry.reserved.has(prefix)) {
    index++;
    prefix = `maeulNs${index}`;
  }
  registry.bindings.set(prefix, uri);
  registry.generated.set(uri, prefix);
  registry.reserved.add(prefix);
  return prefix;
}

function selectorTarget(
  encoded: string,
  registry: CssNamespaceRegistry,
): SelectorTarget | undefined {
  const separator = namespaceSeparator(encoded);
  if (separator < 0) return { kind: 'none', local: ident.decode(encoded), explicit: false };
  const prefix = ident.decode(encoded.slice(0, separator));
  const local = ident.decode(encoded.slice(separator + 1));
  if (prefix === '') return { kind: 'none', local, explicit: true };
  if (prefix === '*') return { kind: 'wildcard', local };
  const uri = registry.bindings.get(prefix);
  return uri === undefined ? undefined : { kind: 'named', local, prefix, uri };
}

function selectorValue(node: AttributeSelector): string | undefined {
  if (node.value?.type === 'String') return node.value.value;
  return node.value?.type === 'Identifier' ? ident.decode(node.value.name) : undefined;
}

function attributeMatches(
  candidateValue: string,
  matcher: string,
  expectedValue: string,
  insensitive: boolean,
): boolean {
  const candidate = insensitive ? asciiInsensitive(candidateValue) : candidateValue;
  const expected = insensitive ? asciiInsensitive(expectedValue) : expectedValue;
  if (matcher === '=') return candidate === expected;
  if (
    expected === '' &&
    (matcher === '^=' || matcher === '$=' || matcher === '*=' || matcher === '~=')
  ) {
    return false;
  }
  if (matcher === '^=') return candidate.startsWith(expected);
  if (matcher === '$=') return candidate.endsWith(expected);
  if (matcher === '*=') return candidate.includes(expected);
  if (matcher === '~=') return candidate.split(/[\t\n\f\r ]+/).includes(expected);
  if (matcher === '|=') return candidate === expected || candidate.startsWith(`${expected}-`);
  return false;
}

function attributeName(
  target: SelectorTarget,
  namespace: string,
  registry: CssNamespaceRegistry,
): string {
  const local = ident.encode(target.local);
  if (namespace === '') {
    return target.kind === 'none' && !target.explicit ? local : `|${local}`;
  }
  const prefix = target.kind === 'named' ? target.prefix : generatedPrefix(registry, namespace);
  return `${ident.encode(prefix)}|${local}`;
}

function selectorBranch(
  name: string,
  matcher: string,
  value: string,
  flags: string | null,
): string {
  const suffix = flags === null ? '' : ` ${flags}`;
  return `[${name}${matcher}${cssString.encode(value)}${suffix}]`;
}

export function rewriteAttributeSelector(
  node: AttributeSelector,
  attributes: readonly CssAttributeState[],
  registry: CssNamespaceRegistry,
): AttributeSelectorRewrite {
  const target = selectorTarget(node.name.name, registry);
  const value = selectorValue(node);
  if (target === undefined || node.matcher === null || value === undefined) return { kind: 'none' };
  const selected = attributes.filter(
    (attribute) =>
      attribute.local === target.local &&
      (target.kind === 'wildcard' ||
        (target.kind === 'none' ? attribute.namespace === '' : attribute.namespace === target.uri)),
  );
  if (
    selected.length === 0 ||
    selected.every(({ original, rewritten }) => original === rewritten)
  ) {
    return { kind: 'none' };
  }

  const insensitive = node.flags?.toLowerCase() === 'i';
  const namespaces = [...new Set(selected.map(({ namespace }) => namespace))];
  const branches: string[] = [];
  for (const namespace of namespaces) {
    const states = selected.filter((attribute) => attribute.namespace === namespace);
    const name = attributeName(target, namespace, registry);
    if (states.every(({ original, rewritten }) => original === rewritten)) {
      branches.push(selectorBranch(name, node.matcher, value, node.flags));
      continue;
    }
    const matching = states.filter(({ original }) =>
      attributeMatches(original, node.matcher ?? '', value, insensitive),
    );
    const finalValues = [...new Set(matching.map(({ rewritten }) => rewritten))];
    const nonMatching = states.filter(
      ({ original }) => !attributeMatches(original, node.matcher ?? '', value, insensitive),
    );
    const collision = finalValues.find((finalValue) =>
      nonMatching.some(({ rewritten }) =>
        attributeMatches(rewritten, '=', finalValue, insensitive),
      ),
    );
    if (collision !== undefined) {
      return {
        kind: 'unsupported',
        message: `Attribute selector cannot preserve colliding ${target.local} value ${JSON.stringify(collision)}`,
      };
    }
    branches.push(
      ...finalValues.map((finalValue) => selectorBranch(name, '=', finalValue, node.flags)),
    );
  }
  if (branches.length === 0) {
    const state = selected[0];
    if (state === undefined) return { kind: 'none' };
    branches.push(`:not(*|*)[${attributeName(target, state.namespace, registry)}]`);
  }
  return { kind: 'selector', value: `:is(${branches.join(',')})` };
}
