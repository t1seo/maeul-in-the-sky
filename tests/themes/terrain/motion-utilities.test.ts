import { describe, expect, it } from 'vitest';
import {
  cssKeyframes,
  currentMotionContext,
  motionId,
  motionMarkup,
  smilAnimate,
  smilAnimateTransform,
  withMotionContext,
} from '../../../src/core/animation.js';
import { renderMotionBranches } from '../../../src/themes/terrain/motion/index.js';

const animation = {
  attributeName: 'opacity',
  values: ['0.5', '1'],
  dur: '2s',
  repeatCount: 'indefinite',
};
const renderShape = (): string =>
  `<circle id="${motionId('star')}" r="4" opacity="0.5">${smilAnimate(animation)}</circle>`;

describe('C08 scoped motion creation', () => {
  it.each(['subtle', 'off'] as const)('omits utility animation when mode is %s', (mode) => {
    // Given: all supported utility animation sources.
    const context = { mode, namespace: 'utilities' };
    // When: the caller creates those fragments under the selected policy.
    const svg = withMotionContext(context, () =>
      [
        smilAnimate(animation),
        smilAnimateTransform({ type: 'rotate', values: ['0', '360'], dur: '1s', repeatCount: 1 }),
        cssKeyframes({
          name: 'pulse',
          keyframes: { '0%': { opacity: '1' } },
          duration: '1s',
          easing: 'linear',
          iterationCount: 1,
        }),
        motionMarkup('<animateMotion path="M0,0 L2,2" dur="1s"/>'),
      ].join(''),
    );
    // Then: no CSS or SMIL motion is emitted.
    expect(svg).toBe('');
  });

  it('restores the outer mode when a nested static branch completes', () => {
    // Given: the full renderer temporarily creates a static branch.
    const context = { mode: 'full', namespace: 'outer' } as const;
    // When: control returns to its caller.
    const svg = withMotionContext(
      context,
      () => withMotionContext({ mode: 'off', namespace: 'inner' }, renderShape) + renderShape(),
    );
    // Then: the static circle survives and only the outer circle animates.
    expect(svg.match(/<circle /g)).toHaveLength(2);
    expect(svg.match(/<animate /g)).toHaveLength(1);
    expect(currentMotionContext()).toEqual({ mode: 'full', namespace: '' });
  });

  it('restores the caller when rendering throws', () => {
    // Given: a rendering error.
    const failure = new Error('fixture failure');
    // When: the branch fails.
    expect(() =>
      withMotionContext({ mode: 'off', namespace: 'broken' }, () => {
        throw failure;
      }),
    ).toThrow(failure);
    // Then: future renders retain the default full policy.
    expect(currentMotionContext()).toEqual({ mode: 'full', namespace: '' });
  });

  it('encodes a namespace when IDs contain XML-sensitive characters', () => {
    // Given: arbitrary title-derived characters never become raw XML.
    const namespace = 'a" <&_';
    // When: an ID and its corresponding reference are requested.
    const id = withMotionContext({ mode: 'off', namespace }, () => motionId('gradient'));
    // Then: the identifier is safe and stable.
    expect(id).toMatch(/^[A-Za-z][A-Za-z0-9_-]*$/);
    expect(withMotionContext({ mode: 'off', namespace }, () => motionId('gradient'))).toBe(id);
  });
});

describe('C08-reduced-css-smil', () => {
  it('creates a visible static fallback with distinct IDs when motion is full', () => {
    // Given: a shape with an explicitly visible base pose.
    // When: both media branches are rendered.
    const svg = renderMotionBranches({ mode: 'full', namespace: 'scene' }, renderShape);
    // Then: media-unsupported rasterizers see static geometry, and branch IDs differ.
    expect(svg).toContain('<g data-motion-branch="static"><circle');
    expect(svg).toContain('<g data-motion-branch="active" display="none"><circle');
    expect(svg).toContain('prefers-reduced-motion: no-preference');
    const ids = Array.from(svg.matchAll(/ id="([^"]+)"/g), (match) => match[1]);
    expect(new Set(ids).size).toBe(ids.length);
    expect(svg).not.toMatch(/animate(?:Motion|Transform)?\s*\{/);
  });

  it('emits only the static scene when motion is off', () => {
    // Given / When: the user explicitly disables motion.
    const svg = renderMotionBranches({ mode: 'off', namespace: 'scene' }, renderShape);
    // Then: no CSS animation, keyframes, SMIL or redundant branch is present.
    expect(svg).toContain('<circle');
    expect(svg).not.toMatch(/animation|@keyframes|<animate|data-motion-branch/);
  });
});
