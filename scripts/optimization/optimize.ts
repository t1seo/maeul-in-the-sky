import { optimize, type CustomPlugin, type PluginConfig, type XastElement } from 'svgo';
import { roundAbsolutePath } from './path-numbers.js';

export type Candidate = 'identity' | 'geometry' | 'geometry-path' | 'svgo-numeric' | 'svgo-path';

const geometryAttributes: Readonly<Record<string, readonly string[]>> = {
  circle: ['cx', 'cy', 'r'],
  ellipse: ['cx', 'cy', 'rx', 'ry'],
  rect: ['x', 'y', 'width', 'height', 'rx', 'ry'],
  line: ['x1', 'y1', 'x2', 'y2'],
  polygon: ['points'],
  polyline: ['points'],
};
const numeric = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?$/;
const lengthAttributes = new Set(['r', 'rx', 'ry', 'width', 'height']);

function round(value: string, preserveTiny: boolean): string {
  if (!numeric.test(value)) return value;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  const rounded = Number(parsed.toFixed(2));
  return preserveTiny && parsed !== 0 && rounded === 0 ? value : String(rounded);
}

function roundPoints(value: string): string {
  const values = value.trim().split(/[\s,]+/);
  if (values.length < 4 || values.length % 2 !== 0 || !values.every((v) => numeric.test(v)))
    return value;
  return value.replace(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g, (part) => round(part, false));
}

function animated(node: XastElement, name: string): boolean {
  return node.children.some(
    (child) =>
      child.type === 'element' &&
      ['animate', 'set', 'animateTransform', 'animateMotion'].includes(child.name) &&
      child.attributes.attributeName === name,
  );
}

const geometryPlugin: CustomPlugin = {
  name: 'known-geometry-two-decimals',
  fn: () => ({
    element: {
      enter(node) {
        if (node.name === 'g' && node.attributes.transform && !animated(node, 'transform')) {
          const value = node.attributes.transform;
          const match = /^translate\(([^()]*)\)$/.exec(value);
          if (match) {
            const values = match[1].trim().split(/[\s,]+/);
            if (
              values.length >= 1 &&
              values.length <= 2 &&
              values.every((part) => numeric.test(part))
            ) {
              node.attributes.transform = `translate(${values.map((part) => round(part, false)).join(',')})`;
            }
          }
        }
        for (const name of geometryAttributes[node.name] ?? []) {
          const value = node.attributes[name];
          if (value === undefined || animated(node, name)) continue;
          node.attributes[name] =
            name === 'points' ? roundPoints(value) : round(value, lengthAttributes.has(name));
        }
      },
    },
  }),
};

const pathPlugin: PluginConfig = {
  name: 'convertPathData',
  params: {
    floatPrecision: 2,
    applyTransforms: false,
    applyTransformsStroked: false,
    straightCurves: false,
    convertToQ: false,
    convertToZ: false,
    smartArcRounding: false,
    removeUseless: false,
    forceAbsolutePath: true,
  },
};

const pathNumbers: CustomPlugin = {
  name: 'absolute-path-numbers',
  fn: () => ({
    element: {
      enter(node) {
        if (node.name === 'path' && node.attributes.d && !animated(node, 'd'))
          node.attributes.d = roundAbsolutePath(node.attributes.d);
      },
    },
  }),
};

/** Build-only experiment. Caller must apply the corpus-specific acceptance gate. */
export function optimizeSvgArtifact(svg: string, candidate: Candidate = 'geometry'): string {
  if (candidate === 'identity') return svg;
  const paths = new Map<XastElement, string>();
  const hideAnimatedPaths: CustomPlugin = {
    name: 'hide-animated-paths',
    fn: () => ({
      element: {
        enter(node) {
          if (node.attributes.d && animated(node, 'd')) {
            paths.set(node, node.attributes.d);
            delete node.attributes.d;
          }
        },
      },
    }),
  };
  const restoreAnimatedPaths: CustomPlugin = {
    name: 'restore-animated-paths',
    fn: () => ({
      element: {
        enter(node) {
          const original = paths.get(node);
          if (original !== undefined) node.attributes.d = original;
        },
      },
    }),
  };
  const plugins: PluginConfig[] =
    candidate === 'svgo-numeric'
      ? [
          {
            name: 'cleanupNumericValues',
            params: { floatPrecision: 2, convertToPx: false, defaultPx: false },
          },
        ]
      : candidate === 'svgo-path'
        ? [geometryPlugin, hideAnimatedPaths, pathPlugin, restoreAnimatedPaths]
        : candidate === 'geometry-path'
          ? [geometryPlugin, pathNumbers]
          : [geometryPlugin];
  return optimize(svg, { plugins, multipass: false }).data;
}
