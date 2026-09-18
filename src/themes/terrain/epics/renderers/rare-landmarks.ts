import { motionMarkup } from '../../../../core/animation.js';
import type { AssetColors } from '../../palette.js';

export function renderVolcano(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cy=".5" rx="6.1" ry="1" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-6.4,.2-4.1,-3.7-2.3,-9 1.3,-9.6 3.3,-5.7 6.2,.6 1.5,1.3Z" fill="${c.rock}"/>` +
    `<path d="M1.3,-9.6 3.3,-5.7 6.2,.6 1.5,1.3-.2,-4.9Z" fill="${c.boulder}"/>` +
    `<path d="M-4.5,-2.5-2.3,-7.7-2.7,-3.6-1.5,-.5ZM2.3,-5.9 2.8,-2.8 4.2,-.4 3.3,-3.5Z" fill="${c.shadow}" opacity=".3"/>` +
    `<ellipse cx="-.5" cy="-8.9" rx="2.1" ry=".85" fill="${c.trunk}"/>` +
    `<path d="M-2.1,-9Q-.5,-9.7 1.2,-9L.6,-7.7 1.3,-6.2 .7,-4.1 2.5,-1.7 1.2,-2.1-.3,-4 .2,-6.4-.5,-7.6Q-1.9,-7.9-2.1,-9Z" fill="${c.campfireFlame}"/>` +
    `<path d="M-1.7,-9Q-.6,-9.3 .8,-8.9L-.2,-8.4 .5,-6.2 .1,-5.2 .1,-7.3Z" fill="${c.torchFlame}"/>` +
    `<path d="M-.9,-10Q-2.1,-10.5-1,-11.4-2.1,-12.2-.8,-12.8 .3,-13.6 1.2,-12.4 2.6,-12.1 1.5,-11 .9,-10.5 .3,-10Z" fill="${c.rock}" opacity=".6"/>` +
    `<path d="M-2.9,-.3-3.7,-1.4-4.7,-.7ZM3.4,.7 4.4,-.4 5.4,.7Z" fill="${c.boulder}"/>` +
    `</g>`
  );
}

export function renderGiantMushroom(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cy=".4" rx="3.6" ry=".7" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-1.4,-5.3 1,-5.4Q.6,-2.7 2.1,-.2 1.1,1-1.8,.4-.7,-2-1.4,-5.3Z" fill="${c.mushroom}"/>` +
    `<path d="M.4,-5.2 1,-5.4Q.6,-2.7 2.1,-.2L.7,.5Q-.1,-2.1 .4,-5.2Z" fill="${c.wallShade}"/>` +
    `<path d="M-2.1,-3.5Q-.1,-2.6 1.5,-3.8L1.3,-3Q-.2,-2.3-1.5,-2.9Z" fill="${c.mushroom}"/>` +
    `<path d="M-5.3,-5.7Q-.5,-8 5.2,-6.1 4.6,-3.7-.4,-4.2-4.4,-4-5.3,-5.7Z" fill="${c.wallShade}"/>` +
    `<path d="M-4.1,-5.1-.9,-4.5M-2.5,-5.7-.5,-4.5M2.1,-5.7 .2,-4.5M4,-5.2 .5,-4.5" stroke="${c.mushroom}" stroke-width=".3"/>` +
    `<path d="M-5.3,-5.7Q-4.8,-8.9-1.8,-9.8 1.1,-10.8 3.5,-8.7 5,-7.6 5.2,-6.1 3.1,-5.1 .2,-5.3-2.9,-4.6-5.3,-5.7Z" fill="${c.mushroomCap}"/>` +
    `<path d="M-4.7,-6.7Q-3.7,-9.1-1.7,-9.5 .6,-10.1 1.8,-9.3L.4,-8.7Q-2.4,-9.1-4.7,-6.7Z" fill="${c.coral}"/>` +
    `<path d="M-3.3,-7.9Q-2.8,-8.7-2.1,-8.1-1.8,-7.1-3,-7.2ZM.1,-9Q.8,-9.5 1.4,-8.8 1,-8 .3,-8.2ZM1.6,-6.8Q2,-7.8 3.1,-7.3 3.5,-6.4 2.3,-6.3ZM-1.2,-6.2Q-.7,-6.9-.1,-6.3-.1,-5.7-.9,-5.7Z" fill="${c.mushroom}"/>` +
    `</g>`
  );
}

export function renderColosseum(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<ellipse cy=".8" rx="6.1" ry="1.1" fill="${c.shadow}" opacity="0.15"/>` +
    `<path d="M-6,-3.6Q-6,-6.1 0,-6.1L2.7,-5.8 2.7,-4.8 4.2,-4.5 4.2,-3.8 6,-3.2V-.1Q0,2.8-6,-.1Z" fill="${c.wallShade}"/>` +
    `<path d="M-6,-3.6Q-6,-6.1 0,-6.1L2.7,-5.8 2.7,-5.3Q-3.7,-6-5.2,-3.3Z" fill="${c.church}"/>` +
    `<ellipse cx=".1" cy="-3.4" rx="4.7" ry="1.6" fill="${c.trunk}"/>` +
    `<ellipse cx=".1" cy="-2.9" rx="3.7" ry=".9" fill="${c.path}"/>` +
    `<path d="M-6,-3.6Q0,-.8 6,-3.2V-.1Q0,2.8-6,-.1Z" fill="${c.epicMarble}"/>` +
    `<path d="M3,-2.3 6,-3.2V-.1L3,1Z" fill="${c.wallShade}"/>` +
    `<path d="M-5,-1.8V-2.6Q-4.5,-3.1-4,-2.3V-1.4ZM-2.9,-1V-2Q-2.3,-2.7-1.7,-1.8V-.8ZM-.6,-.6V-1.6Q0,-2.4 .6,-1.6V-.6ZM1.7,-.8V-1.8Q2.3,-2.7 2.9,-2V-1ZM4,-1.4V-2.3Q4.5,-3.1 5,-2.6V-1.8Z" fill="${c.trunk}"/>` +
    `<path d="M-4.9,-.1V-.8Q-4.4,-1.4-3.9,-.5V.3ZM-2.7,.7V-.2Q-2.2,-.8-1.6,0V.9ZM-.5,1V.1Q0,-.6 .6,.1V1ZM1.7,.9V0Q2.2,-.8 2.8,-.2V.7ZM4,.3V-.5Q4.5,-1.4 5,-.8V-.1Z" fill="${c.boulder}"/>` +
    `<path d="M-5.6,-1.4Q0,1.1 5.6,-1.1" stroke="${c.church}" stroke-width=".35" fill="none"/>` +
    `</g>`
  );
}

export function renderPagoda(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.7,-.3 0,-1.5 3.8,-.2 3.8,.6 0,1.5-3.7,.6Z" fill="${c.wallShade}"/>` +
    `<path d="M-2.8,-3.7 .1,-4.5 2.8,-3.7V-.2L0,.7-2.8,-.2ZM-2,-7.2 0,-7.9 2,-7.2V-4L0,-3.4-2,-4ZM-1.3,-10.6 0,-11 1.3,-10.6V-7.5L0,-7-1.3,-7.5Z" fill="${c.epicMarble}"/>` +
    `<path d="M0,-4.5 2.8,-3.7V-.2L0,.7ZM0,-7.9 2,-7.2V-4L0,-3.4ZM0,-11 1.3,-10.6V-7.5L0,-7Z" fill="${c.wallShade}"/>` +
    `<path d="M-5,-4.1Q-3.7,-3.9-.2,-6 3,-4.1 5,-4.1L4.4,-3.2 .1,-2.4-4.4,-3.2ZM-4,-7.7Q-2.6,-7.5 0,-9.5 2.7,-7.5 4,-7.7L3.4,-6.8 0,-6.2-3.4,-6.8ZM-2.9,-11Q-1.6,-10.9 0,-12.6 1.8,-10.9 2.9,-11L2.4,-10.2 0,-9.7-2.4,-10.2Z" fill="${c.trunk}"/>` +
    `<path d="M-5,-4.1Q-3.7,-3.9-.2,-6 3,-4.1 5,-4.1L0,-3.1ZM-4,-7.7Q-2.6,-7.5 0,-9.5 2.7,-7.5 4,-7.7L0,-6.9ZM-2.9,-11Q-1.6,-10.9 0,-12.6 1.8,-10.9 2.9,-11L0,-10.3Z" fill="${c.roofA}"/>` +
    `<path d="M-5,-4.1-.2,-6 0,-3.1ZM-4,-7.7 0,-9.5V-6.9ZM-2.9,-11 0,-12.6V-10.3Z" fill="${c.roofB}"/>` +
    `<path d="M-1.5,-.1V-1.9Q-1,-2.5-.5,-1.9V.2ZM-.9,-4.2V-5.7H-.3V-4ZM-.5,-7.6V-8.6H0V-7.5Z" fill="${c.trunk}"/>` +
    `<path d="M0,-12.4V-14.2M-.5,-13H.5M-.35,-13.7H.35" stroke="${c.epicGold}" stroke-width=".3"/>` +
    `</g>`
  );
}

export function renderTorii(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-5,.1-4.6,-.9-3.1,-.9-2.8,.4-4,.8ZM2.8,.4 3.1,-.9 4.6,-.9 5,.1 4,.8Z" fill="${c.boulder}"/>` +
    `<path d="M-4.6,.1-4,-7.7-2.9,-7.8-3.4,.2ZM3.4,.2 2.9,-7.8 4,-7.7 4.6,.1Z" fill="${c.roofA}"/>` +
    `<path d="M-4.6,.1-4,-7.7-3.6,-7.7-4.1,.1ZM3.4,.2 2.9,-7.8 3.3,-7.7 3.9,.1Z" fill="${c.roofB}"/>` +
    `<path d="M-6.1,-8.9Q0,-7.5 6.1,-8.9L5.7,-7.4Q0,-6.5-5.7,-7.4Z" fill="${c.roofA}"/>` +
    `<path d="M-6.2,-9.1Q0,-7.9 6.2,-9.1L6,-8.5Q0,-7.2-6,-8.5Z" fill="${c.trunk}"/>` +
    `<path d="M-4.9,-6.1 4.9,-6.1V-5.4H-4.9ZM-.4,-7.6H.4V-5.3H-.4Z" fill="${c.roofA}"/>` +
    `<path d="M-3.3,-5.1Q0,-3.4 3.3,-5.1" stroke="${c.wheat}" stroke-width=".35" fill="none"/>` +
    `<path d="M-1.9,-4.6-2.2,-3.9-1.7,-3.6-1.9,-3.1-1.2,-3.6-1.7,-4ZM1,-4.3 .7,-3.6 1.2,-3.3 1,-2.8 1.7,-3.3 1.2,-3.7Z" fill="${c.sail}"/>` +
    `<path d="M-.7,-7H.7V-5.9H-.7Z" fill="${c.epicGold}"/>` +
    `</g>`
  );
}

export function renderEiffelTower(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-4,.5-3.8,-.4-2.2,-.5-2,.5ZM2,.5 2.2,-.5 3.8,-.4 4,.5Z" fill="${c.wallShade}"/>` +
    `<path d="M-3.8,0Q-2.1,-3.9-1,-8.6L-.4,-12.6H.4L1,-8.6Q2.1,-3.9 3.8,0H2.6Q1.8,-2.7 0,-2.9-1.8,-2.7-2.6,0ZM-1.8,-4H1.8L.8,-7.8H-.8Z" fill="${c.boulder}" fill-rule="evenodd"/>` +
    `<path d="M-3.8,0Q-2.1,-3.9-1,-8.6L-.4,-12.6H0L-.5,-8.3-2.9,0Z" fill="${c.rock}"/>` +
    `<path d="M-.6,-7.7 .9,-6.2-1.3,-4.6M.6,-7.7-.9,-6.2 1.3,-4.6M-1.6,-3.4-2.7,-1.4M1.6,-3.4 2.7,-1.4" stroke="${c.rock}" stroke-width=".35" fill="none"/>` +
    `<path d="M-2.4,-4.5H2.4V-3.8H-2.4ZM-1.3,-8.6H1.3V-8H-1.3ZM-.7,-12.7H.7V-12H-.7Z" fill="${c.rock}"/>` +
    `<path d="M-2.4,-4.5H2.4M-1.3,-8.6H1.3" stroke="${c.epicMarble}" stroke-width=".2"/>` +
    `<path d="M-.2,-12.7V-14.3H.2V-12.7Z" fill="${c.boulder}"/>` +
    `<path d="M0,-14.2V-15.1" stroke="${c.epicGold}" stroke-width=".25"/>` +
    `</g>`
  );
}

export function renderWindmillGrand(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.5,.3-2.8,-.8 2.7,-.8 3.5,.3 0,1.1Z" fill="${c.boulder}"/>` +
    `<path d="M-2.7,0-1.8,-8.5 1.7,-8.5 2.8,0 0,.7Z" fill="${c.windmill}"/>` +
    `<path d="M.5,-8.5H1.7L2.8,0 0,.7Z" fill="${c.wallShade}"/>` +
    `<path d="M-2.2,-8.4-.2,-10.8 2.2,-8.4 .3,-7.8Z" fill="${c.roofA}"/>` +
    `<path d="M-2.2,-8.4-.2,-10.8 .3,-7.8Z" fill="${c.roofB}"/>` +
    `<path d="M-1.5,.2V-1.8Q-.8,-2.7-.1,-1.8V.5ZM-.7,-4.5V-5.7H.2V-4.5Z" fill="${c.trunk}"/>` +
    `<path d="M-3,-3 0,-2.2 3,-3V-2.4L0,-1.6-3,-2.4Z" fill="${c.boat}"/>` +
    `<path d="M-2.7,-3.9V-3M-1.4,-3.5V-2.6M1.5,-3.6V-2.7M2.7,-3.9V-3" stroke="${c.fence}" stroke-width=".3"/>` +
    `<g transform="translate(0,-7.5)"><g>` +
    `<path d="M-.25,-6H.25V6H-.25ZM-6,-.25H6V.25H-6Z" fill="${c.trunk}"/>` +
    `<path d="M.2,-1 .2,-5.8 1.15,-5.8 1.05,-1ZM1,.2 5.8,.2 5.8,1.15 1,1.05ZM-.2,1-.2,5.8-1.15,5.8-1.05,1ZM-1,-.2-5.8,-.2-5.8,-1.15-1,-1.05Z" fill="${c.windBlade}"/>` +
    `<path d="M.3,-2H1.1M.3,-3.4H1.1M.3,-4.8H1.1M2,.3V1.1M3.4,.3V1.1M4.8,.3V1.1M-.3,2H-1.1M-.3,3.4H-1.1M-.3,4.8H-1.1M-2,-.3V-1.1M-3.4,-.3V-1.1M-4.8,-.3V-1.1" stroke="${c.fence}" stroke-width=".2"/>` +
    motionMarkup(
      `<animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>`,
    ) +
    `</g></g><circle cy="-7.5" r=".55" fill="${c.trunk}"/>` +
    `</g>`
  );
}
