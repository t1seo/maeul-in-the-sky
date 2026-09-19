import { expect, test, type Page } from '@playwright/test';
import { openDemo } from './helpers.js';

async function coldClassicHistory(page: Page, currentTitle = 'History'): Promise<() => void> {
  await openDemo(page, '?renderer=classic&title=History&mode=light&motion=off');
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await page.getByLabel('Artwork version', { exact: true }).selectOption('current');
  await page.evaluate((title) => {
    const url = new URL(window.location.href);
    url.searchParams.set('title', title);
    window.history.replaceState({}, '', url);
  }, currentTitle);
  await page.reload();
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'current');
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/versions/classic/browser.js*', async (route) => {
    await gate;
    await route.continue();
  });
  const requested = page.waitForRequest((request) =>
    request.url().includes('/versions/classic/browser.js'),
  );
  await page.goBack();
  await requested;
  return release;
}

test('keeps an uncommitted title draft while a cold classic history entry is loading', async ({
  page,
}, info) => {
  // Given: a new draft is focused while the historical renderer download is pending.
  const release = await coldClassicHistory(page);
  const title = page.getByLabel('Title', { exact: true });
  await title.fill('Newest uncommitted draft');
  await expect(title).toBeFocused();

  // When: loading finishes before the draft is committed through blur or change.
  release();

  // Then: the form, rendered scene, settings link and workflow retain the draft.
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await expect(title).toBeFocused();
  await expect(title).toHaveValue('Newest uncommitted draft');
  await expect(page.locator('#live-terrain')).toContainText('Newest uncommitted draft');
  await expect(page.locator('#workflow-preview')).toContainText(
    'title: "Newest uncommitted draft"',
  );
  expect(new URL(page.url()).searchParams.get('title')).toBe('Newest uncommitted draft');
  await page.screenshot({ path: info.outputPath('preserved-draft.png') });
});

test('preserves a title edited back to its original value during cold classic restoration', async ({
  page,
}) => {
  // Given: the pending history has a different title from the currently displayed settings.
  const release = await coldClassicHistory(page, 'Initial');
  const title = page.getByLabel('Title', { exact: true });

  // When: the user edits and restores the original title before the download finishes.
  await title.fill('Edited');
  await title.fill('Initial');
  release();

  // Then: the user's last edit wins even though the final values match the loading snapshot.
  await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
  await expect(title).toBeFocused();
  await expect(title).toHaveValue('Initial');
  await expect(page.locator('#live-terrain')).toContainText('Initial');
  await expect(page.locator('#workflow-preview')).toContainText('title: "Initial"');
  expect(new URL(page.url()).searchParams.get('title')).toBe('Initial');
});

for (const draft of [
  { field: '#username', value: 'invalid user!', error: '#settings-error' },
  { field: '#title', value: '${{ unfinished draft }}', error: '#title-error' },
] as const) {
  test(`preserves the invalid draft and export error for ${draft.field} during classic restoration`, async ({
    page,
  }) => {
    // Given: an invalid draft already disables workflow export during a cold restore.
    const release = await coldClassicHistory(page);
    const field = page.locator(draft.field);
    await field.fill(draft.value);
    await expect(page.locator(draft.error)).toBeVisible();
    const error = await page.locator(draft.error).textContent();
    await expect(page.locator('#download-workflow')).toBeDisabled();

    // When: the historical renderer finishes loading while the invalid draft is focused.
    release();

    // Then: its raw text, validation message and disabled exports remain available for correction.
    await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
    await expect(field).toBeFocused();
    await expect(field).toHaveValue(draft.value);
    await expect(page.locator(draft.error)).toBeVisible();
    await expect(page.locator(draft.error)).toHaveText(error ?? '');
    await expect(page.locator('#download-workflow')).toBeDisabled();
    await expect(page.locator('#copy-workflow')).toBeDisabled();
  });
}

for (const navigation of [
  { kind: 'color', buttons: ['button[data-mode="dark"]', 'button[data-mode="light"]'] },
  { kind: 'preset', buttons: ['button[data-preset="nature"]', 'button[data-preset="balanced"]'] },
] as const) {
  test(`preserves settings after ${navigation.kind} returns to its initial choice during classic restoration`, async ({
    page,
  }) => {
    // Given: historical settings differ from the displayed title before loading.
    const release = await coldClassicHistory(page, 'Initial');

    // When: the user changes a choice and returns to its initial value during the download.
    for (const selector of navigation.buttons) await page.locator(selector).click();
    release();

    // Then: the latest choice keeps the current settings instead of the historical title.
    await expect(page.locator('#preview-panel')).toHaveAttribute('data-renderer', 'classic');
    await expect(page.getByLabel('Title', { exact: true })).toHaveValue('Initial');
    await expect(page.locator('#workflow-preview')).toContainText('title: "Initial"');
    expect(new URL(page.url()).searchParams.get('title')).toBe('Initial');
  });
}
