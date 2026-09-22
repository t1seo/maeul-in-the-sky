import { mountTour } from '../../../src/tour/app/main.js';

export const wildlifeBaseUrl = new URL('/docs/demo/tour/models/', location.href);

export function mountTestTour(pageUrl: string) {
  return mountTour(pageUrl, { assetBaseUrl: wildlifeBaseUrl });
}
