import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function openCreate(page: Page) {
  await page.getByRole('button', { name: 'New Dispute' }).click();
  const dialog = page.getByRole('dialog', { name: 'Create a dispute' });
  await expect(dialog.getByRole('textbox', { name: 'Buyer' })).toBeFocused();
  return dialog;
}

test('discards cancelled drafts and restores focus for each dismissal method', async ({ page }) => {
  await page.goto('/disputes');
  const trigger = page.getByRole('button', { name: 'New Dispute' });

  for (const method of ['Cancel', 'Close', 'Escape', 'Backdrop']) {
    const dialog = await openCreate(page);
    const buyer = dialog.getByRole('textbox', { name: 'Buyer' });
    await expect(buyer).toHaveValue('');
    await buyer.fill('Discarded buyer');
    if (method === 'Escape') await page.keyboard.press('Escape');
    else if (method === 'Backdrop') await page.mouse.click(5, 5);
    else await dialog.getByRole('button', { name: method, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
  }
});

test(
  'reveals exact errors and validates raw decimals as the user edits',
  {
    tag: ['@cross-browser', '@mobile'],
  },
  async ({ page }) => {
    await page.goto('/disputes');
    const dialog = await openCreate(page);
    const buyer = dialog.getByRole('textbox', { name: 'Buyer' });
    const amount = dialog.getByRole('spinbutton', { name: 'Dispute Amount' });
    await expect(buyer).toBeFocused();
    await expect(dialog.getByText('Enter a buyer name.')).toHaveCount(0);
    const reason = dialog.getByRole('textbox', { name: 'Dispute Reason' });
    await reason.focus();
    await expect(buyer).toHaveAccessibleDescription('Enter a buyer name.');
    await expect(reason).not.toHaveAttribute('aria-describedby');
    await dialog.getByRole('button', { name: 'Create Dispute' }).click();
    await expect(buyer).toBeFocused();
    for (const error of [
      'Enter a buyer name.',
      'Enter a dispute reason.',
      'Enter a dispute amount.',
      'Select a currency.',
    ]) {
      await expect(dialog.getByText(error)).toBeVisible();
    }

    await buyer.fill('Buyer');
    await expect(dialog.getByText('Enter a buyer name.')).toHaveCount(0);
    await expect(dialog.getByText('Enter a dispute reason.')).toBeVisible();
    await amount.fill('-12.345');
    await expect(amount).toHaveAccessibleDescription('Enter an amount greater than 0.');
    await amount.fill('1.230');
    await expect(amount).toHaveValue('1.230');
    await expect(amount).toHaveAccessibleDescription('Enter an amount with up to 2 decimals.');
    await amount.fill('1.23');
    await expect(amount).not.toHaveAttribute('aria-describedby');
  },
);

test('has no axe violations in the invalid create dialog', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/disputes');
  const dialog = await openCreate(page);
  await dialog.getByRole('button', { name: 'Create Dispute' }).click();
  await expect(dialog.getByText('Select a currency.')).toBeVisible();
  await expect(dialog.getByRole('group', { name: 'Currency' })).toHaveAccessibleDescription(
    'Select a currency.',
  );
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('creates a USD dispute with Enter and opens a clean draft next time', async ({ page }) => {
  await page.clock.setFixedTime(new Date(2026, 10, 14, 12));
  await page.goto('/disputes');
  const dialog = await openCreate(page);
  await dialog.getByRole('textbox', { name: 'Buyer' }).fill('  Example Buyer ');
  await dialog.getByRole('textbox', { name: 'Dispute Reason' }).fill(' Invoice issue ');
  await dialog.getByRole('radio', { name: 'USD' }).check();
  const amount = dialog.getByRole('spinbutton');
  await amount.fill('1250.50');
  await amount.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('row').nth(1).getByRole('cell')).toHaveText([
    '6229',
    'Example Buyer',
    'New',
    '14 Nov 2026',
    '1,250.50',
    'USD',
    'Invoice issue',
    'Remove',
  ]);
  await expect(page.getByText('Showing 4/4 rows')).toBeVisible();
  await expect(page.getByText('Dispute 6229 has been created.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'New Dispute' })).toBeFocused();

  await openCreate(page);
  await expect(dialog.getByRole('textbox', { name: 'Buyer' })).toHaveValue('');
  await expect(dialog.getByRole('radio', { name: 'USD' })).not.toBeChecked();
  await dialog.getByRole('button', { name: 'Cancel' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText('Showing 4/4 rows')).toBeVisible();
});

test('locks pending dismissal and preserves the EUR draft after a failed save', async ({
  page,
}) => {
  await page.goto('/disputes?scenario=create-error');
  const dialog = await openCreate(page);
  await dialog.getByRole('textbox', { name: 'Buyer' }).fill('EUR Buyer');
  await dialog.getByRole('textbox', { name: 'Dispute Reason' }).fill('Reason');
  await dialog.getByRole('spinbutton').fill('300.25');
  await dialog.getByRole('radio', { name: 'EUR' }).check();
  const submit = dialog.getByRole('button', { name: 'Create Dispute' });
  await submit.click();
  await expect(dialog.getByRole('status')).toHaveText('Creating dispute…');
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog.getByRole('alert')).toHaveText('Dispute could not be created. Try again.');
  await expect(dialog.getByRole('textbox', { name: 'Buyer' })).toHaveValue('EUR Buyer');
  await expect(dialog.getByRole('radio', { name: 'EUR' })).toBeChecked();
  await expect(page.getByText('Dispute 6229 has been created.')).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  await submit.click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('row').nth(1)).toContainText('EUR');
});
