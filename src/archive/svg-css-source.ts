import type { CssNode } from 'css-tree';
import { InputValidationError } from '../core/settings/errors.js';
import { escapeCssXmlText } from './svg-css-serialization.js';

export type CssReplacement = {
  readonly start: number;
  readonly end: number;
  readonly value: string;
};

export type NormalizedCssSource = {
  readonly value: string;
  readonly offsets: readonly number[];
};

const XML_ENTITIES = new Map([
  ['amp', '&'],
  ['apos', "'"],
  ['gt', '>'],
  ['lt', '<'],
  ['quot', '"'],
]);
const XML_REFERENCE = /&(?:#x[\dA-Fa-f]+|#[\d]+|amp|apos|gt|lt|quot);/g;

function invalidCss(message: string): InputValidationError {
  return new InputValidationError([{ path: 'theme.svg.style', message }]);
}

function decodeXmlReference(reference: string): string {
  if (reference.startsWith('&#x')) {
    return String.fromCodePoint(Number.parseInt(reference.slice(3, -1), 16));
  }
  if (reference.startsWith('&#')) {
    return String.fromCodePoint(Number.parseInt(reference.slice(2, -1), 10));
  }
  return XML_ENTITIES.get(reference.slice(1, -1)) ?? reference;
}

export function normalizeCssSource(source: string, xmlText: boolean): NormalizedCssSource {
  if (!xmlText) {
    return {
      value: source,
      offsets: Array.from({ length: source.length + 1 }, (_, index) => index),
    };
  }
  let value = '';
  let cursor = 0;
  const offsets: number[] = [0];
  for (const match of source.matchAll(XML_REFERENCE)) {
    const reference = match[0];
    const start = match.index;
    for (let index = cursor; index < start; index++) {
      value += source[index] ?? '';
      offsets.push(index + 1);
    }
    const decoded = decodeXmlReference(reference);
    value += decoded;
    for (let index = 0; index < decoded.length; index++) {
      offsets.push(index === decoded.length - 1 ? start + reference.length : start);
    }
    cursor = start + reference.length;
  }
  for (let index = cursor; index < source.length; index++) {
    value += source[index] ?? '';
    offsets.push(index + 1);
  }
  return { value, offsets };
}

export function cssReplacement(
  normalized: NormalizedCssSource,
  node: CssNode,
  value: string,
  xmlText: boolean,
): CssReplacement {
  const location = node.loc;
  if (location === undefined) throw invalidCss('CSS token has no source position');
  const start = normalized.offsets[location.start.offset];
  const end = normalized.offsets[location.end.offset];
  if (start === undefined || end === undefined) throw invalidCss('CSS token position is invalid');
  return {
    start,
    end,
    value: xmlText ? escapeCssXmlText(value) : value,
  };
}

export function applyCssReplacements(
  source: string,
  replacements: readonly CssReplacement[],
): string {
  const ordered = [...replacements].sort((left, right) => right.start - left.start);
  let output = source;
  let previousStart = source.length;
  for (const replacement of ordered) {
    if (replacement.end > previousStart) throw invalidCss('Overlapping CSS reference tokens');
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
    previousStart = replacement.start;
  }
  return output;
}
