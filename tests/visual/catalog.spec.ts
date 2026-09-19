import { expect, test, type Locator } from '@playwright/test';
import { ASSET_CATALOG } from '../../src/themes/terrain/assets.js';
import { EPIC_CATALOG } from '../../src/themes/terrain/epics.js';
import { buildCatalogRecords, filterCatalogRecords } from '../../scripts/catalog/model.js';

const records = buildCatalogRecords(ASSET_CATALOG, EPIC_CATALOG);

async function expectVisibleArtworkWithinBounds(cards: Locator): Promise<void> {
  await expect
    .poll(async () =>
      cards.filter({ visible: true }).evaluateAll((visibleCards) =>
        visibleCards
          .map((card) => {
            const svg = card.querySelector('svg');
            const use = card.querySelector('use');
            if (!(svg instanceof SVGSVGElement) || !(use instanceof SVGUseElement)) {
              throw new TypeError('Catalog card is missing SVG artwork');
            }
            const viewport = svg.getBoundingClientRect();
            const artwork = use.getBoundingClientRect();
            return {
              id: card.getAttribute('data-catalog-id'),
              width: artwork.width,
              height: artwork.height,
              clipped:
                artwork.left < viewport.left - 1 ||
                artwork.right > viewport.right + 1 ||
                artwork.top < viewport.top - 1 ||
                artwork.bottom > viewport.bottom + 1,
            };
          })
          .filter((item) => item.width <= 0 || item.height <= 0 || item.clipped),
      ),
    )
    .toEqual([]);
}

test('C04 catalog filters original artwork and reports an empty combination', async ({
  page,
}, testInfo) => {
  // Given
  await page.goto('/docs/demo/catalog/');
  await expect(page.getByRole('heading', { name: 'Every small thing in the sky.' })).toBeVisible();
  const cards = page.locator('[data-catalog-card]');
  await expect(cards).toHaveCount(240);
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
    `Showing ${expectedWinter.length} of 240 entries`,
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
  await page.getByLabel('Style', { exact: true }).selectOption('korean');
  await expect(cards.filter({ visible: true })).toHaveCount(0);
  await expect(page.locator('#empty-state')).toBeVisible();
  await expect(page.locator('#empty-state')).toContainText('No catalog entries match');

  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(cards.filter({ visible: true })).toHaveCount(240);
  await page.getByLabel('Family').selectOption('korean');
  await expect(cards.filter({ visible: true })).toHaveCount(13);
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

test('C04 art style and lighting retain all catalog filters and matching identities', async ({
  page,
}, testInfo) => {
  await page.goto('/docs/demo/catalog/');
  const cards = page.locator('[data-catalog-card]');
  await page.getByLabel('Season').selectOption('winter');
  await page.getByLabel('Family').selectOption('korean');
  await page.getByLabel('Style', { exact: true }).selectOption('korean');
  await page.getByLabel('Find an asset').fill('hanok');
  const expected = filterCatalogRecords(records, {
    family: 'korean',
    style: 'korean',
    season: 'winter',
    query: 'hanok',
  })
    .map((record) => record.id)
    .sort();
  expect(expected.length).toBeGreaterThan(0);

  for (const artStyle of ['pixel', 'miniature'] as const) {
    await page.getByLabel('Art style', { exact: true }).selectOption(artStyle);
    for (const lighting of ['Light', 'Dark'] as const) {
      await page.getByRole('button', { name: lighting, exact: true }).click();
      await expect(page.getByLabel('Season')).toHaveValue('winter');
      await expect(page.getByLabel('Family')).toHaveValue('korean');
      await expect(page.getByLabel('Style', { exact: true })).toHaveValue('korean');
      await expect(page.getByLabel('Find an asset')).toHaveValue('hanok');
      await expect(page.locator('html')).toHaveAttribute('data-art-style', artStyle);
      await expect(page.getByRole('button', { name: lighting, exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      const visible = cards.filter({ visible: true });
      await expect(visible).toHaveCount(expected.length);
      expect(
        await visible.evaluateAll((entries) =>
          entries.map((entry) => entry.getAttribute('data-catalog-id')).sort(),
        ),
      ).toEqual(expected);
      const file = `catalog-sprite-${artStyle === 'pixel' ? 'pixel-' : ''}${lighting.toLowerCase()}.svg`;
      const links = await visible
        .locator('use')
        .evaluateAll((uses) => uses.map((use) => use.getAttribute('href')));
      expect(links.every((href) => href?.startsWith(`${file}#asset-`))).toBe(true);
      await expectVisibleArtworkWithinBounds(cards);
      await testInfo.attach(`catalog-${artStyle}-${lighting.toLowerCase()}`, {
        body: await page.screenshot({ animations: 'disabled' }),
        contentType: 'image/png',
      });
    }
  }
});

test('C04 every pixel symbol is loaded and unclipped in either lighting mode', async ({ page }) => {
  await page.goto('/docs/demo/catalog/');
  await page.getByLabel('Art style', { exact: true }).selectOption('pixel');
  const cards = page.locator('[data-catalog-card]');
  for (const lighting of ['Dark', 'Light'] as const) {
    await page.getByRole('button', { name: lighting, exact: true }).click();
    await expect(cards.filter({ visible: true })).toHaveCount(240);
    await expectVisibleArtworkWithinBounds(cards);
  }
  await page.getByLabel('Family').selectOption('wonder');
  await page.getByLabel('Style', { exact: true }).selectOption('korean');
  await expect(page.locator('#empty-state')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.getByLabel('Art style', { exact: true })).toHaveValue('pixel');
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'light');
  await expect(cards.filter({ visible: true })).toHaveCount(240);
  await expect(page.getByLabel('Find an asset')).toBeFocused();
});
