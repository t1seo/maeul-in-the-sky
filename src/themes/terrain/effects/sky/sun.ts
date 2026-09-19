import { motionId } from '../../../../core/animation.js';

export function luminousSun(x: number, y: number): string {
  const surface = motionId('sky-sun-surface');
  const halo = motionId('sky-sun-halo');
  const rays = Array.from({ length: 12 }, (_, index) => {
    const tip = index % 3 === 0 ? 16 : 13.5;
    return `<path d="M-.65-10.8Q0-10.3.65-10.8L.3-${tip}Q0-${tip + 0.8}-.3-${tip}Z" transform="rotate(${index * 30})"/>`;
  }).join('');
  return (
    `<g class="sky-sun" transform="translate(${x.toFixed(2)} ${y.toFixed(2)})">` +
    `<defs><radialGradient id="${halo}"><stop stop-color="#ffe5a4" stop-opacity=".65"/>` +
    `<stop offset=".48" stop-color="#ffd273" stop-opacity=".2"/><stop offset="1" stop-color="#ffd273" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="${surface}" cx="34%" cy="26%" r="76%">` +
    `<stop stop-color="#fffbe5"/><stop offset=".42" stop-color="#ffe999"/>` +
    `<stop offset=".8" stop-color="#ffc550"/><stop offset="1" stop-color="#eaa045"/></radialGradient></defs>` +
    `<circle r="22" fill="url(#${halo})"/>` +
    `<g class="sun-corona" fill="#e6a950" opacity=".48">${rays}</g>` +
    `<circle r="9.5" fill="none" stroke="#ffd68d" stroke-width=".45" opacity=".45"/>` +
    `<circle class="sun-body" r="8" fill="url(#${surface})"/>` +
    `<path d="M-6.6-2.5A7 7 0 0 1 2.4-6.7" fill="none" stroke="#fffbea" stroke-width=".55" opacity=".9"/>` +
    `</g>`
  );
}
