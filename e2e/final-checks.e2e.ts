import { expect, test } from '@playwright/test';

test('uses the reference colors for danger actions and invalid fields', async ({ page }) => {
  await page.goto('/disputes');

  const remove = page.getByRole('button', { name: 'Remove dispute 6228' });
  await remove.hover();
  await expect(remove).toHaveCSS('color', 'rgb(185, 28, 28)');
  await expect(remove).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await remove.click();

  const removal = page.getByRole('dialog', { name: 'Remove dispute 6228' });
  const confirm = removal.getByRole('button', { name: 'Remove dispute', exact: true });
  await confirm.hover();
  await expect(confirm).toHaveCSS('background-color', 'rgb(185, 28, 28)');
  await expect(removal.locator('#remove-dispute-description')).toHaveCSS(
    'color',
    'rgb(41, 41, 41)',
  );
  await removal.getByRole('button', { name: 'Cancel' }).click();

  await page.getByRole('button', { name: 'New Dispute' }).click();
  const creation = page.getByRole('dialog', { name: 'Create a dispute' });
  await expect(creation.locator('#create-dispute-description')).toHaveCSS(
    'color',
    'rgb(41, 41, 41)',
  );
  const reason = creation.getByRole('textbox', { name: 'Dispute Reason' });
  await reason.hover();
  await expect(reason).toHaveCSS('border-top-color', 'rgb(14, 39, 67)');
  await reason.focus();
  await expect(reason).toHaveCSS('border-top-color', 'rgb(0, 85, 164)');
  await expect(reason).toHaveCSS('box-shadow', /0px 0px 3px 1px/);
  await creation.getByRole('button', { name: 'Create Dispute' }).click();
  await reason.hover();
  await expect(reason).toHaveCSS('border-top-color', 'rgb(185, 28, 28)');
  await reason.focus();
  await expect(reason).toHaveCSS('border-top-color', 'rgb(185, 28, 28)');
  await expect(reason).toHaveCSS('box-shadow', /0px 0px 3px 1px/);
  await expect(reason).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
});

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
  const surface = page.locator('.gscf-success-toast .mat-mdc-snackbar-surface');
  await expect(surface).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  await expect(surface).toHaveCSS('color', 'rgb(41, 41, 41)');
  await expect(surface).toHaveCSS('box-shadow', 'rgb(58, 139, 37) 0px 0px 0px 3px');
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
  'insets the visible success toast outline by 20 pixels',
  { tag: ['@cross-browser', '@mobile'] },
  async ({ page, isMobile }) => {
    if (isMobile) await page.setViewportSize({ width: 320, height: 620 });
    await page.goto('/disputes');
    await page.getByRole('button', { name: 'Remove dispute 6228' }).click();
    await page.getByRole('button', { name: 'Remove dispute', exact: true }).click();
    await expect(page.getByText('Dispute 6228 has been removed.', { exact: true })).toBeVisible();

    const surface = page.locator('.gscf-success-toast .mat-mdc-snackbar-surface');
    await expect(surface).toHaveCSS('box-shadow', 'rgb(58, 139, 37) 0px 0px 0px 3px');
    await expect
      .poll(() =>
        surface.evaluate((toast) => {
          const bounds = toast.getBoundingClientRect();
          const outlineWidth = 3;
          return {
            right: Math.round(window.innerWidth - bounds.right - outlineWidth),
            bottom: Math.round(window.innerHeight - bounds.bottom - outlineWidth),
            leftFits: Math.round(bounds.left - outlineWidth) >= 20,
          };
        }),
      )
      .toEqual({ right: 20, bottom: 20, leftFits: true });
  },
);

test(
  'keeps dialog actions visible in a short 320px viewport',
  { tag: '@mobile' },
  async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 420 });
    await page.goto('/disputes');
    await page.getByRole('button', { name: 'New Dispute' }).click();
    const dialog = page.getByRole('dialog', { name: 'Create a dispute' });
    const submit = dialog.getByRole('button', { name: 'Create Dispute' });
    await expect(submit).toBeInViewport({ ratio: 1 });
    await submit.click();
    await expect(dialog.getByText('Select a currency.')).toBeVisible();
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    await expect(cancel).toBeInViewport({ ratio: 1 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(320);
    await cancel.click();
    await expect(dialog).toHaveCount(0);
  },
);
