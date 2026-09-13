import { expect, test, type Locator } from '@playwright/test';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics.js';
import { buildCatalogRecords, filterCatalogRecords } from '../../scripts/catalog/model.js';

const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

async function expectVisibleArtworkWithinBounds(cards: Locator): Promise<void> {
  const geometry = await cards.filter({ visible: true }).evaluateAll((visibleCards) =>
    visibleCards.map((card) => {
      const svg = card.querySelector('svg');
      const use = card.querySelector('use');
      if (!(svg instanceof SVGSVGElement) || !(use instanceof SVGUseElement)) {
        throw new TypeError('Catalog card is missing SVG artwork');
      }
      const viewport = svg.getBoundingClientRect();
      const artwork = use.getBoundingClientRect();
      return {
        width: artwork.width,
        height: artwork.height,
        clipped:
          artwork.left < viewport.left - 1 ||
          artwork.right > viewport.right + 1 ||
          artwork.top < viewport.top - 1 ||
          artwork.bottom > viewport.bottom + 1,
      };
    }),
  );
  expect(geometry.every((item) => item.width > 0 && item.height > 0 && !item.clipped)).toBe(true);
}

test('C04 catalog filters original artwork and reports an empty combination', async ({
  page,
}, testInfo) => {
  // Given
  await page.goto('/docs/demo/catalog/');
  await expect(page.getByRole('heading', { name: 'Every small thing in the sky.' })).toBeVisible();
  const cards = page.locator('[data-catalog-card]');
  await expect(cards).toHaveCount(223);
  await expectVisibleArtworkWithinBounds(cards);

  // When
  await page.getByLabel('Season').selectOption('winter');
  await page.getByRole('button', { name: 'Light', exact: true }).click();

  // Then
  const expectedWinter = filterCatalogRecords(records, {
    family: 'all',
    season: 'winter',
    style: 'all',
    query: '',
  });
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
  await expect(cards.filter({ visible: true })).toHaveCount(expectedWinter.length);
  await expect(page.locator('#result-count')).toHaveText(
    `Showing ${expectedWinter.length} of 223 entries`,
  );
  await expectVisibleArtworkWithinBounds(cards);

  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'dark');
  await expect(cards.filter({ visible: true }).locator('use').first()).toHaveAttribute(
    'href',
    /catalog-sprite-dark\.svg#/,
  );

  await page.getByLabel('Season').selectOption('all');
  await page.getByLabel('Family').selectOption('wonder');
  await page.getByLabel('Style').selectOption('korean');
  await expect(cards.filter({ visible: true })).toHaveCount(0);
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#empty-state')).toContainText('No catalog entries match');

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(223);
  await page.getByLabel('Family').selectOption('korean');
  await expect(cards.filter({ visible: true })).toHaveCount(4);
  await testInfo.attach(`catalog-${testInfo.project.name}`, {
    body: await page.screenshot({ animations: 'disabled' }),
    contentType: 'image/png',
  });
});

test('C04 catalog remains readable without horizontal overflow', async ({ page }) => {
  // Given
  await page.goto('/docs/demo/catalog/');

  // When
  await page.getByLabel('Family').selectOption('korean');

  // Then
  const layout = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    firstCardWidth:
      document.querySelector('[data-catalog-card]:not([hidden])')?.getBoundingClientRect().width ??
      0,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.clientWidth + 1);
  expect(layout.firstCardWidth).toBeGreaterThanOrEqual(235);
});
