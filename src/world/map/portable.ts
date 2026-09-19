import { SaxesParser } from 'saxes';
import { escapeXml, svgNumber } from '../../core/svg.js';

type PaintState = { readonly opacity: number; readonly fill: number; readonly stroke: number };
const PAINTED = new Set([
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polygon',
  'polyline',
  'text',
  'tspan',
  'use',
]);

export function portableSvg(source: string): string {
  const parser = new SaxesParser();
  const states: PaintState[] = [];
  const result: string[] = [];
  parser.on('opentag', (tag) => {
    const parent = states.at(-1) ?? { opacity: 1, fill: 1, stroke: 1 };
    const attributes = { ...tag.attributes };
    const state = {
      opacity: parent.opacity * Number(attributes.opacity ?? 1),
      fill: Number(attributes['fill-opacity'] ?? parent.fill),
      stroke: Number(attributes['stroke-opacity'] ?? parent.stroke),
    };
    states.push(state);
    delete attributes.opacity;
    if (PAINTED.has(tag.name) && state.opacity !== 1) {
      attributes['fill-opacity'] = svgNumber(state.fill * state.opacity);
      attributes['stroke-opacity'] = svgNumber(state.stroke * state.opacity);
    }
    const values = Object.entries(attributes)
      .map(([key, value]) => ` ${key}="${escapeXml(value)}"`)
      .join('');
    result.push(`<${tag.name}${values}${tag.isSelfClosing ? '/>' : '>'}`);
  });
  parser.on('closetag', (tag) => {
    states.pop();
    if (!tag.isSelfClosing) result.push(`</${tag.name}>`);
  });
  parser.on('text', (value) => result.push(escapeXml(value)));
  parser.on('cdata', (value) => result.push(escapeXml(value)));
  parser.write(source).close();
  return result.join('');
}
