import { expect, type Locator } from '@playwright/test';

const terrainIntersection = (viewport: Locator) =>
  viewport.evaluate((node) => {
    const terrain = [...node.querySelectorAll<SVGGraphicsElement>('.terrain-fit')].find(
      (candidate) => candidate.getClientRects().length > 0,
    );
    if (!terrain) throw new Error('Zoom Terrain geometry is missing');
    const viewportBounds = node.getBoundingClientRect();
    const terrainBounds = terrain.getBoundingClientRect();
    return {
      width:
        Math.min(viewportBounds.right, terrainBounds.right) -
        Math.max(viewportBounds.left, terrainBounds.left),
      height:
        Math.min(viewportBounds.bottom, terrainBounds.bottom) -
        Math.max(viewportBounds.top, terrainBounds.top),
    };
  });

export const viewportFocalPoint = (viewport: Locator) =>
  viewport.evaluate((node) => {
    const content = node.firstElementChild;
    if (!(content instanceof HTMLElement)) throw new Error('Zoom content is missing');
    return (node.scrollLeft + node.clientWidth / 2) / content.getBoundingClientRect().width;
  });

export const expectTerrainVisible = async (viewport: Locator): Promise<void> => {
  const intersection = await terrainIntersection(viewport);
  expect(intersection.width).toBeGreaterThan(0);
  expect(intersection.height).toBeGreaterThan(0);
};
