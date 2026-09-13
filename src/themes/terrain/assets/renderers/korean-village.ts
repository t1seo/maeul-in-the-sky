import type { AssetColors } from '../../palette.js';

/** Original small-scale giwa roof and timber frame, drawn for Maeul's isometric tiles. */
export function svgHanok(x: number, y: number, c: AssetColors, v: number): string {
  const roof = ['#42566a', '#526b76', '#3d4d60'][v % 3];
  return (
    `<g transform="translate(${x},${y})" data-style="korean">` +
    `<path d="M-6,0 L0,3 L7,-0.5 L1,-3.5Z" fill="${c.rock}"/>` +
    `<path d="M-5,-1 L0,1.5 L0,-5.2 L-5,-7.3Z" fill="#eee0bc"/>` +
    `<path d="M0,1.5 L6,-1.5 L6,-7.5 L0,-5.2Z" fill="#d6c8a9"/>` +
    `<g data-part="wooden-lattice" stroke="${c.trunk}" stroke-width="0.5" fill="none">` +
    `<path d="M-5,-7 L-5,-1 M0,-5.2 L0,1.5 M6,-7.4 L6,-1.5 M-5,-4.8 L0,-2.4 L6,-5.4"/>` +
    `<path d="M1,-4.7 L4.8,-6.6 L4.8,-2.6 L1,-0.7Z M2.2,-5.3 L2.2,-1.3 M3.5,-6 L3.5,-2"/>` +
    `</g><g data-part="giwa-roof">` +
    `<path d="M-8,-7.2 Q-5,-7.6 -2,-11 L3,-13 Q4,-9.8 8,-9.1 L1,-5.7 Q-4,-5.7 -8,-7.2Z" fill="${roof}" stroke="#293a49" stroke-width="0.45"/>` +
    `<path d="M-2,-11 L3,-13 M-8,-7.2 Q-3,-6.5 1,-5.7 L8,-9.1" fill="none" stroke="#a7b5b6" stroke-width="0.65"/>` +
    `<path d="M-4.8,-8.2 L1.2,-10.9 M-3,-7.5 L2.5,-10.1 M-1,-6.9 L4.4,-9.5 M1,-6.6 L6.1,-9" stroke="#829598" stroke-width="0.3"/>` +
    `</g></g>`
  );
}

export function svgPavilion(x: number, y: number, c: AssetColors, v: number): string {
  const roof = ['#3d5960', '#4e6179', '#526a60'][v % 3];
  return (
    `<g transform="translate(${x},${y})" data-style="korean">` +
    `<path d="M-6,0 L0,3 L6,0 L0,-3Z" fill="${c.rock}"/>` +
    `<path d="M-5,-1 L0,1.5 L5,-1 L0,-3.5Z" fill="#b48e64"/>` +
    `<g data-part="open-pillars" stroke="#815334" stroke-width="0.8">` +
    `<path d="M-4.4,-1.3 V-7.6 M0,0.8 V-5.6 M4.4,-1.3 V-7.6 M0,-3.4 V-9.4"/>` +
    `</g><path d="M-5,-6.7 L0,-4.4 L5,-6.7" stroke="#5f8b6c" stroke-width="1.1" fill="none"/>` +
    `<g data-part="giwa-roof"><path d="M-7,-7 Q-3.8,-7.3 0,-13 Q3.8,-7.3 7,-7 L0,-4.7Z" fill="${roof}" stroke="#304a4d" stroke-width="0.45"/>` +
    `<path d="M-7,-7 L0,-4.7 L7,-7 M0,-12.5 V-11" fill="none" stroke="#9badb0" stroke-width="0.6"/></g>` +
    `<path d="M-4,-1.7 L0,0.3 L4,-1.7" fill="none" stroke="#a8784a" stroke-width="0.6"/></g>`
  );
}

export function svgStoneWall(x: number, y: number, c: AssetColors, v: number): string {
  const stones = [c.rock, '#a89d85', '#aeb3a5'];
  return (
    `<g transform="translate(${x},${y})" data-style="korean" data-part="stacked-stones">` +
    `<path d="M-7,-1 L5,5 L7,4 L-5,-2Z" fill="#716f60"/>` +
    `<path d="M-7,-1 V-5 L5,1 V5Z" fill="${stones[v % 3]}" stroke="#666c64" stroke-width="0.4"/>` +
    `<path d="M5,1 L7,0 V4 L5,5Z" fill="#778276"/>` +
    `<path d="M-7,-3 L5,3 M-4,-3.5 V-1.5 M1,-1 V1 M-2,-0.5 V1.5 M3,2 V4" stroke="#67756d" stroke-width="0.45"/>` +
    `<path d="M-7,-5 L-5,-6 L7,0 L5,1Z" fill="#4e6264" stroke="#364d4d" stroke-width="0.4"/>` +
    `<path d="M-4,-4.5 L-2,-5 M0,-2.5 L2,-3 M4,-0.5 L6,-1" stroke="#8ea09b" stroke-width="0.4"/></g>`
  );
}

export function svgOnggi(x: number, y: number, c: AssetColors, v: number): string {
  const glaze = ['#785139', '#624b3f', '#925e3c'][v % 3];
  return (
    `<g transform="translate(${x},${y})" data-style="korean" data-part="earthenware-jars">` +
    `<path d="M-6,0 L0,3 L6,0 L0,-3Z" fill="${c.rock}"/>` +
    `<g fill="${glaze}" stroke="#49372b" stroke-width="0.45">` +
    `<path d="M-4.7,-3.9 Q-6,-1 -4.5,0 Q-3,0.8 -1.6,-0.2 Q-0.4,-2 -1.8,-4Z"/>` +
    `<ellipse cx="-3.2" cy="-4" rx="1.7" ry="0.55"/>` +
    `<path d="M0.1,-5.9 Q-1.5,-2.6 0.2,-0.7 Q2,0.4 3.8,-1.2 Q5,-3.7 3.5,-6Z"/>` +
    `<ellipse cx="1.8" cy="-6" rx="1.85" ry="0.65"/>` +
    `<path d="M2.1,0 Q1.8,-1.7 2.5,-2.5 L4.9,-2.5 Q5.8,-0.8 4.8,0.7 Q3.5,1.3 2.1,0Z"/>` +
    `<ellipse cx="3.7" cy="-2.5" rx="1.3" ry="0.45"/></g>` +
    `<path d="M-4.5,-2.7 Q-4.8,-1.7 -4.2,-0.8 M0.2,-4.5 Q-0.2,-2.9 0.4,-1.8" stroke="#bb9470" stroke-width="0.55" fill="none"/></g>`
  );
}
