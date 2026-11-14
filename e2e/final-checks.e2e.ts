import { expect, test } from '@playwright/test';

test('dismisses the current success toast after five seconds and replaces earlier notices', async ({
  page,
}) => {
  await page.clock.install();
  await page.goto('/disputes');
  await page.getByRole('button', { name: 'New Dispute' }).click();
  const create = page.getByRole('dialog', { name: 'Create a dispute' });
  await create.getByRole('textbox', { name: 'Buyer' }).fill('Toast buyer');
  await create.getByRole('textbox', { name: 'Dispute Reason' }).fill('Toast reason');
  await create.getByRole('spinbutton').fill('1.25');
  await create.getByRole('radio', { name: 'USD' }).check();
  await create.getByRole('button', { name: 'Create Dispute' }).click();
  await expect(page.getByText('Dispute 6229 has been created.', { exact: true })).toBeVisible();
  const liveNotice = page.locator('[aria-live="polite"]').filter({ hasText: 'Dispute created.' });
  await expect(liveNotice).toHaveText('Dispute created. Dispute 6229 has been created.');

  await page.getByRole('button', { name: 'Remove dispute 6229' }).click();
  const remove = page.getByRole('dialog', { name: 'Remove dispute 6229' });
  await remove.getByRole('button', { name: 'Remove dispute', exact: true }).click();
  const removed = page.getByText('Dispute 6229 has been removed.', { exact: true });
  await expect(removed).toBeVisible();
  await expect(page.getByText('Dispute 6229 has been created.', { exact: true })).toHaveCount(0);
  await page.clock.fastForward(3_000);
  await expect(removed).toBeVisible();
  await page.clock.fastForward(2_500);
  await expect(removed).toHaveCount(0);
});

test(
  'fits a short 320px viewport with scrollable dialog actions',
  { tag: '@mobile' },
  async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 420 });
    await page.goto('/disputes');
    await page.getByRole('button', { name: 'New Dispute' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create a dispute' });
    const submit = dialog.getByRole('button', { name: 'Create Dispute' });
    await submit.scrollIntoViewIfNeeded();
    await expect(submit).toBeInViewport();
    await submit.click();
    await expect(dialog.getByText('Select a currency.')).toBeVisible();
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    await cancel.scrollIntoViewIfNeeded();
    await expect(cancel).toBeInViewport();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await cancel.click();
    await expect(dialog).toHaveCount(0);
  },
);
