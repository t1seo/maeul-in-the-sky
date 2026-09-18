import type { AssetColors } from '../../palette.js';

export function waterBoatHull(c: AssetColors): string {
  return (
    `<path d="M-3.6,-1.15Q-.8,-2.1 3.7,-1.25L2.7,.1Q.15,.85 -2.6,.05Z" fill="${c.boat}"/>` +
    `<path d="M-3.6,-1.15Q-.8,-2.1 3.7,-1.25Q1.6,-.25 -1.1,-.35Z" fill="${c.dock}"/>` +
    `<path d="M-2.65,-1.12Q-.45,-1.65 2.7,-1.15Q.7,-.65 -1,-.7Z" fill="${c.trunk}"/>` +
    `<path d="M-3.6,-1.15Q-.75,-.15 3.7,-1.25L3.3,-.65Q.1,.4 -3,-.5Z" fill="${c.wheat}" opacity=".45"/>` +
    `<path d="M-.95,-1.45L.3,-.7M1.25,-1.4L2.3,-.94" stroke="${c.dock}" stroke-width=".32"/>`
  );
}

export function waterBoatRig(c: AssetColors, height: number, twin: boolean): string {
  return (
    `<path d="M-.2,-1.1V${-height}" stroke="${c.trunk}" stroke-width=".25"/>` +
    `<path d="M0,${-height + 0.4}Q2.1,${-height + 1.7} 2.75,-2.1L0,-1.85Z" fill="${c.sail}"/>` +
    `<path d="M0,${-height + 0.4}Q1.25,${-height + 2} 1.4,-2L2.75,-2.1Q2.1,${-height + 1.7} 0,${-height + 0.4}Z" fill="${c.whaleBelly}" opacity=".38"/>` +
    (twin
      ? `<path d="M-.45,${-height + 1.1}Q-1.7,${-height + 1.8} -2.5,-2.4L-.45,-2Z" fill="${c.sail}"/>`
      : '') +
    `<path d="M-.25,-1.85L2.85,-2.1" stroke="${c.trunk}" stroke-width=".18"/>`
  );
}
