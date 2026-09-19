import { startWorldApp } from './app.js';
import { reportError } from './dom.js';

void startWorldApp({
  loaders: {
    map: async (...args) => (await import('../map/index.js')).mountMap(...args),
    three: async (...args) => (await import('../three/index.js')).mountThree(...args),
  },
}).catch(reportError);
