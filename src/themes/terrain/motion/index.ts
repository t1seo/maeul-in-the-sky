import { motionId, withMotionContext, type MotionContext } from '../../../core/animation.js';

/** Static is the default for SVG rasterizers; browsers opt into the active branch. */
export function renderMotionBranches(context: MotionContext, renderBranch: () => string): string {
  if (context.mode === 'off') return withMotionContext(context, renderBranch);

  const rootId = withMotionContext(context, () => motionId('motion'));
  const staticScene = withMotionContext(
    { mode: 'off', namespace: `${context.namespace}-static` },
    renderBranch,
  );
  const activeScene = withMotionContext(
    { mode: context.mode, namespace: `${context.namespace}-active` },
    renderBranch,
  );
  const staticSelector = `#${rootId} > [data-motion-branch="static"]`;
  const activeSelector = `#${rootId} > [data-motion-branch="active"]`;
  const css =
    `${staticSelector} * { animation: none !important; }` +
    `@media (prefers-reduced-motion: no-preference) {` +
    `${staticSelector} { display: none; }` +
    `${activeSelector} { display: inline; }` +
    `}`;
  return (
    `<g id="${rootId}" data-motion="${context.mode}">` +
    `<style>${css}</style>` +
    `<g data-motion-branch="static">${staticScene}</g>` +
    `<g data-motion-branch="active" display="none">${activeScene}</g>` +
    `</g>`
  );
}
