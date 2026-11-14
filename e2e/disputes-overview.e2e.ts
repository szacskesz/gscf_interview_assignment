import { expect, test } from '@playwright/test';

test('shows the exact seed order, dates, amounts, and status', async ({ page }) => {
  await page.goto('/disputes');
  const table = page.getByRole('table');
  await expect(table.getByRole('columnheader')).toHaveText([
    'Dispute No.',
    'Buyer',
    'Status',
    'Dispute Date',
    'Amount',
    'Currency',
    'Dispute Reason',
    'Actions',
  ]);
  await expect(table.getByRole('row').nth(1).getByRole('cell')).toHaveText([
    '6228',
    'Alpine Logistics AG',
    'New',
    '25 Apr 2026',
    '24,000,000.00',
    'USD',
    'Copy of Invoices',
    'Remove',
  ]);
  await expect(table.getByRole('row').nth(2).getByRole('cell')).toHaveText([
    '6227',
    'Northwind Traders',
    'New',
    '22 Apr 2026',
    '16,450,000.00',
    'USD',
    'Freight: Freight Charges Disputed',
    'Remove',
  ]);
  await expect(table.getByRole('row').nth(3).getByRole('cell')).toHaveText([
    '6224',
    'Helvetia Foods GmbH',
    'Acknowledged',
    '18 Sep 2026',
    '18,350,500.00',
    'USD',
    "Tax: When either the invoice didn't include tax or tax is not applicable",
    'Remove',
  ]);
  await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
});

test('renders empty and read-error states and retries a failed request', async ({ page }) => {
  await page.goto('/disputes?scenario=empty');
  await expect(page.getByRole('heading', { name: 'No disputes' })).toBeVisible();
  await expect(page.getByRole('table')).toHaveCount(0);
  await expect(page.getByText(/Showing .* rows/)).toHaveCount(0);

  await page.goto('/disputes?scenario=read-error');
  await expect(page.getByRole('alert')).toHaveText('Disputes could not be loaded.');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByText('Showing 3/3 rows')).toBeVisible();
});

test(
  'allows keyboard scrolling of the complete mobile table',
  { tag: '@mobile' },
  async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/disputes');
    const region = page.getByRole('region', { name: 'Disputes table' });
    await region.focus();
    await region.press('ArrowRight');
    await expect.poll(() => region.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    await expect(page.getByRole('columnheader')).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(375);
  },
);
