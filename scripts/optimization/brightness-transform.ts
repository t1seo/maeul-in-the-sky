export type BrightnessRepresentation = 'fractional' | 'integer';

export type BrightnessChange = {
  readonly sourceFill: string;
  readonly targetFill: string;
  readonly sourceTag: string;
  readonly targetTag: string;
};

export type BrightnessTransformResult = {
  readonly svg: string;
  readonly changes: readonly BrightnessChange[];
};

type AttributeSpan = {
  readonly name: string;
  readonly value: string;
  readonly start: number;
  readonly end: number;
  readonly valueStart: number;
  readonly valueEnd: number;
};

const TARGET_STYLE = 'filter:brightness(1.3)';
const BRIGHTNESS = 1.3;

function tagEnd(svg: string, start: number): number {
  let quote: '"' | "'" | undefined;
  for (let index = start; index < svg.length; index++) {
    const character = svg[index];
    if (quote) {
      if (character === quote) quote = undefined;
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index + 1;
    }
  }
  throw new TypeError(`Unterminated polygon start tag at byte ${start}`);
}

function attributes(tag: string): readonly AttributeSpan[] {
  const spans: AttributeSpan[] = [];
  let index = '<polygon'.length;
  while (index < tag.length) {
    const whitespaceStart = index;
    while (/\s/.test(tag[index] ?? '')) index++;
    if (tag[index] === '>' || (tag[index] === '/' && tag[index + 1] === '>')) break;
    const nameStart = index;
    while (/[^\s=/>]/.test(tag[index] ?? '')) index++;
    const name = tag.slice(nameStart, index);
    while (/\s/.test(tag[index] ?? '')) index++;
    if (!name || tag[index] !== '=') throw new TypeError(`Unsupported polygon attribute: ${tag}`);
    index++;
    while (/\s/.test(tag[index] ?? '')) index++;
    const quote = tag[index];
    if (quote !== '"' && quote !== "'") {
      throw new TypeError(`Unquoted polygon attribute ${name}`);
    }
    const valueStart = ++index;
    while (index < tag.length && tag[index] !== quote) index++;
    if (tag[index] !== quote) throw new TypeError(`Unterminated polygon attribute ${name}`);
    const valueEnd = index;
    index++;
    spans.push({
      name,
      value: tag.slice(valueStart, valueEnd),
      start: whitespaceStart,
      end: index,
      valueStart,
      valueEnd,
    });
  }
  return spans;
}

function solidRgb(value: string): readonly [number, number, number] | undefined {
  const longHex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value);
  if (longHex) {
    return [
      Number.parseInt(longHex[1], 16),
      Number.parseInt(longHex[2], 16),
      Number.parseInt(longHex[3], 16),
    ];
  }
  const shortHex = /^#([\da-f])([\da-f])([\da-f])$/i.exec(value);
  if (shortHex) {
    return [
      Number.parseInt(`${shortHex[1]}${shortHex[1]}`, 16),
      Number.parseInt(`${shortHex[2]}${shortHex[2]}`, 16),
      Number.parseInt(`${shortHex[3]}${shortHex[3]}`, 16),
    ];
  }
  const rgb = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i.exec(value);
  if (!rgb) return undefined;
  const channels = rgb.slice(1).map(Number);
  if (channels.some((channel) => channel > 255)) return undefined;
  return [channels[0], channels[1], channels[2]];
}

function precomputedFill(
  channels: readonly [number, number, number],
  representation: BrightnessRepresentation,
): string {
  const multiplied = channels.map((channel) => Math.min(255, channel * BRIGHTNESS));
  const output =
    representation === 'integer'
      ? multiplied.map(Math.round)
      : multiplied.map((channel) => Number(channel.toFixed(4)));
  return `rgb(${output.join(',')})`;
}

function rewriteTag(
  tag: string,
  representation: BrightnessRepresentation,
): BrightnessChange | undefined {
  const spans = attributes(tag);
  const fill = spans.find((span) => span.name === 'fill');
  const opacity = spans.find((span) => span.name === 'opacity');
  const style = spans.find((span) => span.name === 'style');
  if (!fill || opacity?.value !== '0.3' || style?.value !== TARGET_STYLE) return undefined;
  const channels = solidRgb(fill.value);
  if (!channels) return undefined;
  const targetFill = precomputedFill(channels, representation);
  const replacements = [
    { start: fill.valueStart, end: fill.valueEnd, value: targetFill },
    { start: style.start, end: style.end, value: '' },
  ].sort((left, right) => right.start - left.start);
  let targetTag = tag;
  for (const replacement of replacements) {
    targetTag =
      targetTag.slice(0, replacement.start) + replacement.value + targetTag.slice(replacement.end);
  }
  return { sourceFill: fill.value, targetFill, sourceTag: tag, targetTag };
}

export function precomputeWaterBrightness(
  svg: string,
  representation: BrightnessRepresentation,
): BrightnessTransformResult {
  const output: string[] = [];
  const changes: BrightnessChange[] = [];
  let cursor = 0;
  while (cursor < svg.length) {
    const start = svg.indexOf('<polygon', cursor);
    if (start === -1) break;
    const delimiter = svg[start + '<polygon'.length];
    if (delimiter !== undefined && !/[\s/>]/.test(delimiter)) {
      output.push(svg.slice(cursor, start + '<polygon'.length));
      cursor = start + '<polygon'.length;
      continue;
    }
    const end = tagEnd(svg, start);
    const sourceTag = svg.slice(start, end);
    const change = rewriteTag(sourceTag, representation);
    output.push(svg.slice(cursor, start), change?.targetTag ?? sourceTag);
    if (change) changes.push(change);
    cursor = end;
  }
  output.push(svg.slice(cursor));
  return { svg: output.join(''), changes };
}
