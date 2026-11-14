import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openRemove(page: Page, number: number) {
  await page.getByRole('button', { name: `Remove dispute ${number}` }).click();
  return page.getByRole('dialog', { name: `Remove dispute ${number}` });
}

test(
  'confirms the selected record and places focus on the next action after removal',
  {
    tag: ['@cross-browser', '@mobile'],
  },
  async ({ page, isMobile }) => {
    await page.goto('/disputes');
    const dialog = await openRemove(page, 6228);
    await expect(dialog).toHaveAccessibleDescription(
      'Dispute 6228 (Copy of Invoices, 24,000,000.00 USD) will be removed from the Disputes list, together with its comments and linked invoices. This cannot be undone.',
    );
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    const confirm = dialog.getByRole('button', { name: 'Remove dispute', exact: true });
    await expect(cancel).toBeFocused();
    if (!isMobile) {
      await page.keyboard.press('Tab');
      await expect(confirm).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(dialog.getByRole('button', { name: 'Close' })).toBeFocused();
    }
    await confirm.click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remove dispute 6228' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Remove dispute 6227' })).toBeFocused();
    await expect(page.getByText('Showing 2/2 rows')).toBeVisible();
    await expect(page.getByText('Dispute 6228 has been removed.')).toBeVisible();
  },
);

test('supports each cancellation method and restores focus to the selected row', async ({
  page,
}) => {
  await page.goto('/disputes');
  const trigger = page.getByRole('button', { name: 'Remove dispute 6224' });
  for (const method of ['Cancel', 'Close', 'Escape', 'Backdrop']) {
    const dialog = await openRemove(page, 6224);
    if (method === 'Escape') await page.keyboard.press('Escape');
    else if (method === 'Backdrop') await page.mouse.click(5, 5);
    else await dialog.getByRole('button', { name: method, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
  }
});

test('holds focus during pending removal and leaves the row intact on failure', async ({
  page,
}) => {
  await page.goto('/disputes?scenario=remove-error');
  const dialog = await openRemove(page, 6228);
  const confirm = dialog.getByRole('button', { name: 'Remove dispute', exact: true });
  await confirm.click();
  await expect(dialog.getByRole('status')).toHaveText('Removing dispute…');
  await expect(confirm).toBeFocused();
  await expect(dialog.getByRole('button', { name: 'Close' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await page.mouse.click(5, 5);
  await expect(dialog.getByRole('alert')).toHaveText('Dispute could not be removed. Try again.');
  await expect(page.getByText('Dispute 6228 has been removed.')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('button', { name: 'Remove dispute 6228' })).toBeFocused();
  await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
});

test('recreates from empty, preserves numbering after deletion, and resets on reload', async ({
  page,
}) => {
  await page.goto('/disputes');
  async function remove(number: number) {
    const dialog = await openRemove(page, number);
    await dialog.getByRole('button', { name: 'Remove dispute', exact: true }).click();
    await expect(dialog).toHaveCount(0);
  }

  const trigger = page.getByRole('button', { name: 'New Dispute' });
  async function create(number: number) {
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Create a dispute' });
    await dialog.getByRole('textbox', { name: 'Buyer' }).fill('Returning Buyer');
    await dialog.getByRole('textbox', { name: 'Dispute Reason' }).fill('New reason');
    await dialog.getByRole('spinbutton').fill('300.25');
    await dialog.getByRole('radio', { name: 'EUR' }).check();
    await dialog.getByRole('button', { name: 'Create Dispute' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('row').nth(1)).toContainText(String(number));
  }

  for (const number of [6228, 6227, 6224]) await remove(number);
  await expect(page.getByRole('heading', { name: 'No disputes' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await create(6229);
  await expect(page.getByText('Showing 1/1 rows')).toBeVisible();
  const eur = await openRemove(page, 6229);
  await expect(eur).toHaveAccessibleDescription(/New reason, 300\.25 EUR/);
  await eur.getByRole('button', { name: 'Remove dispute', exact: true }).click();
  await expect(eur).toHaveCount(0);
  await create(6230);
  await page.reload();
  await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
  await create(6229);
});

test('has no axe violations in the confirmation dialog', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/disputes');
  await expect(await openRemove(page, 6224)).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
