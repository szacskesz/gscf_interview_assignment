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

test(
  'scrolls validation errors within the dialog while keeping the title and actions in place',
  { tag: ['@cross-browser', '@mobile'] },
  async ({ page, isMobile }) => {
    // A 1,200 by 650 viewport at 125% browser zoom has 960 by 520 CSS pixels.
    await page.setViewportSize({ width: isMobile ? 390 : 960, height: 520 });
    await page.goto('/disputes');
    const dialog = await openCreate(page);
    const buyer = dialog.getByRole('textbox', { name: 'Buyer' });
    const title = dialog.getByRole('heading', { name: 'Create a dispute' });
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    const submit = dialog.getByRole('button', { name: 'Create Dispute' });

    await buyer.press('Enter');
    await expect(buyer).toBeFocused();
    for (const error of [
      'Enter a buyer name.',
      'Enter a dispute reason.',
      'Enter a dispute amount.',
      'Select a currency.',
    ]) {
      await expect(dialog.getByText(error)).toBeVisible();
    }

    const currencyError = dialog.getByText('Select a currency.');
    await expect(currencyError).not.toBeInViewport({ ratio: 1 });
    const fixedControls = [title, cancel, submit];
    const controlPositions = [];
    for (const control of fixedControls) {
      await expect(control).toBeInViewport({ ratio: 1 });
      controlPositions.push(await control.boundingBox());
    }

    if (isMobile) {
      await currencyError.scrollIntoViewIfNeeded();
    } else {
      await buyer.hover();
      await page.mouse.wheel(0, 500);
    }
    await expect(currencyError).toBeInViewport({ ratio: 1 });
    for (const [index, control] of fixedControls.entries()) {
      await expect(control).toBeInViewport({ ratio: 1 });
      expect(await control.boundingBox()).toEqual(controlPositions[index]);
    }
    await cancel.click();
    await expect(dialog).toHaveCount(0);
  },
);

test(
  'keeps a two-pixel border on text, amount, and radio fields in default and error states',
  { tag: ['@cross-browser', '@mobile'] },
  async ({ page }) => {
    await page.goto('/disputes');
    const dialog = await openCreate(page);
    const buyer = dialog.getByRole('textbox', { name: 'Buyer' });
    const controls = [
      buyer,
      dialog.getByRole('textbox', { name: 'Dispute Reason' }),
      dialog.getByRole('spinbutton', { name: 'Dispute Amount' }),
      dialog.getByRole('radio', { name: 'USD' }),
      dialog.getByRole('radio', { name: 'EUR' }),
    ];

    for (const control of controls) {
      await expect(control).toHaveCSS('border-top-width', '2px');
    }
    await expect(buyer).toHaveCSS('border-top-color', 'rgb(0, 85, 164)');
    for (const control of controls.slice(1)) {
      await expect(control).toHaveCSS('border-top-color', 'rgb(124, 124, 124)');
    }

    await dialog.getByRole('button', { name: 'Create Dispute' }).click();
    await expect(buyer).toBeFocused();

    for (const control of controls) {
      await expect(control).toHaveCSS('border-top-width', '2px');
      await expect(control).toHaveCSS('border-top-color', 'rgb(185, 28, 28)');
    }
    await expect(buyer).toHaveCSS('box-shadow', /0px 0px 3px 1px/);
    await expect(buyer).toHaveCSS('outline-color', 'rgba(0, 0, 0, 0)');
  },
);

test.describe('Decimal entry with a comma-decimal browser locale', () => {
  test.use({ locale: 'hu-HU' });

  test(
    'ignores a comma without changing the native number input, validation, or saved amount',
    { tag: ['@cross-browser', '@mobile'] },
    async ({ page }) => {
      await page.goto('/disputes');
      const dialog = await openCreate(page);
      await dialog.getByRole('textbox', { name: 'Buyer' }).fill('Decimal Buyer');
      await dialog.getByRole('textbox', { name: 'Dispute Reason' }).fill('Decimal reason');
      await dialog.getByRole('radio', { name: 'USD' }).check();
      const amount = dialog.getByRole('spinbutton', { name: 'Dispute Amount' });

      await expect(amount).toHaveAttribute('type', 'number');
      await dialog.getByRole('button', { name: 'Create Dispute' }).click();
      await expect(amount).toHaveAccessibleDescription('Enter a dispute amount.');

      await amount.pressSequentially('22');
      await amount.press(',');
      await expect(amount).toHaveValue('22');
      await expect(amount).not.toHaveAttribute('aria-invalid');

      await amount.pressSequentially('22');
      await amount.press('Tab');
      await expect(amount).not.toBeFocused();
      await expect(amount).toHaveValue('2222');
      await expect(amount).not.toHaveAttribute('aria-invalid');
      await page.keyboard.press('Shift+Tab');
      await expect(amount).toBeFocused();
      await amount.press('End');
      await amount.press('Backspace');
      await expect(amount).toHaveValue('222');
      await expect(amount).not.toHaveAttribute('aria-invalid');

      await amount.fill('22');
      await amount.press('End');
      await amount.pressSequentially('.');
      await amount.press(',');
      await amount.pressSequentially('45');
      await expect(amount).toHaveValue('22.45');

      await amount.press(',');
      await amount.press('ArrowDown');
      await expect(amount).toHaveValue('22.44');
      await expect(amount).not.toHaveAttribute('aria-invalid');
      await amount.press('Enter');
      await expect(dialog).toHaveCount(0);
      await expect(page.getByRole('row').nth(1).getByRole('cell').nth(4)).toHaveText('22.44');
    },
  );
});

test(
  'aligns the amount warning icon with the other fields and leaves the stepper usable',
  { tag: ['@cross-browser', '@mobile'] },
  async ({ page, browserName, isMobile }) => {
    await page.goto('/disputes');
    const dialog = await openCreate(page);
    await dialog.getByRole('button', { name: 'Create Dispute' }).click();
    const amount = dialog.getByRole('spinbutton', { name: 'Dispute Amount' });
    await amount.fill('0');
    await expect(amount).toHaveAccessibleDescription('Enter an amount greater than 0.');

    const warnings = dialog.locator('gscf-field-frame gscf-icon[name="warning"]');
    await expect(warnings).toHaveCount(3);
    const rightEdges = [];
    for (const icon of await warnings.all()) {
      const box = await icon.boundingBox();
      if (!box) throw new Error('Expected the field warning icon to be visible.');
      rightEdges.push(box.x + box.width);
    }
    expect(Math.max(...rightEdges) - Math.min(...rightEdges)).toBeLessThan(1);

    const warning = dialog
      .locator('gscf-field-frame')
      .filter({ has: page.getByRole('spinbutton', { name: 'Dispute Amount' }) })
      .locator('gscf-icon[name="warning"]');
    await expect(warning).toBeVisible();
    if (browserName === 'chromium' && !isMobile) {
      await amount.hover();
      // The native stepper occupies the end of Chromium's input content box.
      const increment = await amount.evaluate((input) => {
        const box = input.getBoundingClientRect();
        const style = getComputedStyle(input);
        return {
          x: box.right - parseFloat(style.paddingRight) - parseFloat(style.borderRightWidth) - 5,
          y: box.top + box.height / 2 - 4,
        };
      });
      const iconLeft = await warning.evaluate((icon) => icon.getBoundingClientRect().left);
      expect(increment.x).toBeLessThan(iconLeft);
      await page.mouse.click(increment.x, increment.y);
    } else {
      await amount.press('ArrowUp');
    }

    await expect(amount).toHaveValue('0.01');
    await expect(warning).toHaveCount(0);
  },
);

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
