import type { AssetColors } from '../../palette.js';

export function renderBonsaiGiant(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-3.9,.2-2.6,-1.3 .6,-1.7 3.5,-.5 3.8,.5 .7,1.2-2.7,1Z" fill="${c.boulder}"/>` +
    `<path d="M-3.9,.2-2.6,-1.3 .6,-1.7 3.5,-.5 .5,.4Z" fill="${c.moss}"/>` +
    `<path d="M-2.6,.5Q-.9,-.8-1.8,-2.7-4.2,-4.8-2.1,-6.8L-.2,-8.2 .3,-7.6Q-3.4,-5.4-1,-4.1L1.7,-5.1 2.9,-7 3.5,-6.8 2.7,-4.3-.2,-3.1Q1.4,-.8 .7,.4L2.4,.6-.2,1Z" fill="${c.trunk}"/>` +
    `<path d="M-.9,.4Q0,-.8-1.5,-3.1-3.7,-4.5-2,-6L-.2,-7.6Q-2.6,-5.2-.7,-4.1L.1,-3.4Q1.2,-1.3 .1,.7Z" fill="${c.bareBranch}"/>` +
    `<path d="M-2.4,-5.6-4.5,-6.2-4.4,-6.8-2.1,-6.2ZM-.4,-7.1-.9,-9 .1,-9 .3,-7.8Z" fill="${c.trunk}"/>` +
    `<path d="M-5.3,-6.8Q-5.1,-8.3-3.8,-8.1-2.8,-9.4-1.6,-8.1-.3,-7.6-1.5,-6.7-3.5,-5.8-5.3,-6.8ZM.5,-6.6Q.5,-7.9 1.9,-8 3,-9 4,-7.9 5.3,-7.7 5.1,-6.8 3.7,-5.7 .5,-6.6ZM-2.5,-9Q-2.5,-10.2-1.2,-10-.1,-10.7 .8,-9.7 1.7,-9 0,-8.6Z" fill="${c.bushDark}"/>` +
    `<path d="M-5,-7.1Q-4.4,-8.6-3.5,-7.8-2.6,-9-1.5,-7.8L-2,-7.1ZM.8,-7Q1.2,-8.2 2.1,-7.7 3.1,-8.7 4,-7.7L4.6,-7Q2.5,-6.5 .8,-7ZM-2.2,-9.2Q-1.9,-10.1-1,-9.8-.2,-10.4 .6,-9.4L-.2,-9Z" fill="${c.epicJade}"/>` +
    `<path d="M-4.2,-7.8-3.5,-8.2-2.8,-7.8ZM1.6,-7.6 2.6,-8.1 3.5,-7.6ZM-1.9,-9.6-1,-10-.2,-9.5Z" fill="${c.leafLight}"/>` +
    `</g>`
  );
}

export function renderTajMahal(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-6.2,0 0,-2 6.2,0V1L0,2.1-6.2,1Z" fill="${c.wallShade}"/>` +
    `<path d="M-6.2,0 0,-2 6.2,0 0,1.1Z" fill="${c.church}"/>` +
    `<path d="M-4.5,-1.8V-8.6H-3.9V-1.8ZM3.8,-1.8V-8.7H4.4V-1.8Z" fill="${c.wallShade}"/>` +
    `<path d="M-3.7,-.2V-5.2L.2,-6.1 3.7,-5V-.3L0,.6Z" fill="${c.epicMarble}"/>` +
    `<path d="M.2,-6.1 3.7,-5V-.3L0,.6Z" fill="${c.wallShade}"/>` +
    `<path d="M-2.4,-5.3V-6.3Q-3.4,-8.4-.7,-9.9L0,-11.3 .7,-9.9Q3.4,-8.4 2.4,-6.3V-5.3Z" fill="${c.church}"/>` +
    `<path d="M0,-11.3 .7,-9.9Q3.4,-8.4 2.4,-6.3V-5.3H1.1V-6.4Q2.1,-8.7 .1,-10Z" fill="${c.epicMarble}"/>` +
    `<path d="M-5.7,.2V-7.6H-4.7V.5ZM4.7,.5V-7.6H5.7V.2Z" fill="${c.church}"/>` +
    `<path d="M-5.1,-7.6H-4.7V.5H-5.1ZM5.3,-7.6H5.7V.2H5.3Z" fill="${c.wallShade}"/>` +
    `<path d="M-5.9,-7.6Q-5.9,-8.6-5.2,-9-4.5,-8.6-4.5,-7.6ZM4.5,-7.6Q4.5,-8.6 5.2,-9 5.9,-8.6 5.9,-7.6ZM-4.7,-8.6-4.2,-9.8-3.7,-8.6ZM3.6,-8.7 4.1,-9.9 4.6,-8.7Z" fill="${c.epicMarble}"/>` +
    `<path d="M-1.5,.2V-3.1L-.2,-4.6 1.1,-3.1V.3Z" fill="${c.boulder}"/>` +
    `<path d="M-1.1,.1V-2.8L-.2,-3.9 .7,-2.8V.3ZM-3,-.5V-2.4L-2.5,-3-2,-2.4V-.2ZM2,-.2V-2.4L2.5,-3 3,-2.4V-.5Z" fill="${c.wallShade}"/>` +
    `<path d="M-3.6,-4.9-.2,-5.5 3.6,-4.8M-5.8,-5.8H-4.6M4.6,-5.8H5.8M-5.8,-2.7H-4.6M4.6,-2.7H5.8M0,-11.2V-12.2" stroke="${c.epicGold}" stroke-width=".25" fill="none"/>` +
    `</g>`
  );
}

export function renderStBasils(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-4.3,.3-3.7,-.9 3.6,-.9 4.3,.3 3.5,1.4-2.6,1.6Z" fill="${c.wallShade}"/>` +
    `<path d="M-3.8,.3V-4.5H-2V-6H-.9L-.7,-8.3H.8L1.2,-6H2.1V-4.5H3.8V.3L0,1Z" fill="${c.roofA}"/>` +
    `<path d="M.3,-7.9H.8L1.2,-6H2.1V-4.5H3.8V.3L0,1V-4.5Z" fill="${c.trunk}" opacity=".35"/>` +
    `<path d="M-3.9,-4.5H-1.6V-6.4H-3.9ZM1.6,-4.5H3.9V-6.4H1.6ZM-.7,-8.2H.8V-9.6H-.7Z" fill="${c.epicMarble}"/>` +
    `<path d="M-3.9,-6.3Q-5.1,-7.7-3.3,-8.8L-2.8,-9.8-2.3,-8.8Q-.5,-7.7-1.7,-6.3Z" fill="${c.roofB}"/>` +
    `<path d="M1.7,-6.3Q.5,-7.7 2.3,-8.8L2.8,-9.8 3.3,-8.8Q5.1,-7.7 3.9,-6.3Z" fill="${c.epicMagic}"/>` +
    `<path d="M-.7,-9.5Q-1.8,-10.7-.4,-11.6L0,-12.2 .4,-11.6Q1.9,-10.7 .8,-9.5Z" fill="${c.epicJade}"/>` +
    `<path d="M-3.7,-8.5-2.3,-6.4M-4.1,-7.3-3.4,-6.4M2.1,-8.5 3.7,-7M1.5,-7.3 3.1,-6.4M-.8,-11.2 .7,-10.1" stroke="${c.epicGold}" stroke-width=".35"/>` +
    `<path d="M-3.3,.2V-2.3Q-2.8,-3.2-2.3,-2.3V.5ZM-.8,.8V-1.7L0,-2.9 .8,-1.7V.8ZM2.3,.5V-2.3Q2.8,-3.2 3.3,-2.3V.2Z" fill="${c.epicMarble}"/>` +
    `<path d="M-.4,.8V-1.5L0,-2.1 .4,-1.5V.8ZM-3,-.1V-2H-2.6V0ZM2.6,0V-2H3V-.1Z" fill="${c.shadow}"/>` +
    `<path d="M-3.8,-3.8H-1.6M1.6,-3.8H3.8M-1.2,-5.7H1.2M-.9,-7.1H.9M-2.8,-9.4V-10.3M2.8,-9.4V-10.3M0,-11.9V-12.7" stroke="${c.epicMarble}" stroke-width=".25"/>` +
    `</g>`
  );
}

export function renderOperaHouse(x: number, y: number, c: AssetColors): string {
  return (
    `<g transform="translate(${x},${y})">` +
    `<path d="M-6.4,-.3-3.8,-1.8 3.9,-1.4 6.3,.1 5.7,1.4-3.8,1.4-6.4,.7Z" fill="${c.path}"/>` +
    `<path d="M-6.4,-.3-3.8,-1.8 3.9,-1.4 6.3,.1 3.5,.8-4.7,.5Z" fill="${c.epicMarble}"/>` +
    `<path d="M-5.2,-.9-4.5,-2.1H3.7L5.2,-.5 1,.1Z" fill="${c.water}"/>` +
    `<path d="M-5.8,-1.4Q-5.9,-3.6-3.2,-4.9-3.5,-3-1.5,-1.1Z" fill="${c.church}"/>` +
    `<path d="M-3.2,-4.9Q-3.5,-3-1.5,-1.1L-3,-1.2Q-4,-3-3.2,-4.9Z" fill="${c.wallShade}"/>` +
    `<path d="M-3,-1.4Q-3.5,-4.6 .2,-6.3-.2,-3.7 2.8,-.9Z" fill="${c.church}"/>` +
    `<path d="M.2,-6.3Q-.2,-3.7 2.8,-.9L.9,-1Q-1,-3.7 .2,-6.3Z" fill="${c.wallShade}"/>` +
    `<path d="M.6,-1Q1,-4.2 3.8,-5.1 3,-2.6 5.7,-.7Z" fill="${c.church}"/>` +
    `<path d="M3.8,-5.1Q3,-2.6 5.7,-.7L4.4,-.8Q2.7,-3 3.8,-5.1Z" fill="${c.epicMarble}"/>` +
    `<path d="M-2.6,-1.5Q-2.1,-4.3 .2,-6.3M.9,-1.2Q2,-3.5 3.8,-5.1M-5.3,-1.5Q-4.9,-3.4-3.2,-4.9" stroke="${c.epicMarble}" stroke-width=".25" fill="none"/>` +
    `<path d="M-3.8,1.7H3.9L2.9,2.1H-2.7Z" fill="${c.epicCrystal}"/>` +
    `</g>`
  );
}
