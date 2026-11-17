import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test(
  'redirects to the branded disputes overview',
  {
    tag: ['@cross-browser', '@mobile'],
  },
  async ({ page }) => {
    const failures: string[] = [];
    page.on('pageerror', (error) => failures.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`);
    });
    await page.goto('/');
    await expect(page).toHaveURL(/\/disputes$/);
    await expect(page).toHaveTitle('Disputes');
    await expect(page.getByRole('heading', { name: 'Disputes', level: 1 })).toBeVisible();
    await expect(page.getByRole('img', { name: 'GSCF' })).toBeVisible();

    await expect(page.getByRole('link', { name: 'Disputes' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(page.getByRole('table').getByRole('row')).toHaveCount(4);
    const addIcon = page.getByRole('button', { name: 'New Dispute' }).locator('mat-icon');
    const removeIcon = page
      .getByRole('button', { name: 'Remove dispute 6228' })
      .locator('mat-icon');
    await expect(addIcon.locator('svg path')).toBeVisible();
    await expect(removeIcon.locator('svg path')).toBeVisible();
    await expect(addIcon).toHaveAttribute('aria-hidden', 'true');
    await expect(addIcon).toHaveCSS('width', '20px');
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page
        .getByRole('img', { name: 'GSCF' })
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  },
);

test(
  'renders the active Disputes link on the navy bar with a full-size hit area',
  { tag: ['@cross-browser', '@mobile'] },
  async ({ page, browserName }) => {
    await page.goto('/disputes');
    const navigation = page.getByRole('navigation', { name: 'Main navigation' });
    const link = navigation.getByRole('link', { name: 'Disputes' });
    await expect(link).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('banner')).toHaveCSS('background-color', 'rgb(19, 55, 90)');
    await expect(link).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(link).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(link).toHaveCSS('font-size', '12px');
    await expect(link).toHaveCSS('font-weight', '600');
    await expect(link).toHaveCSS('min-height', '44px');

    if (browserName === 'chromium') {
      await page.keyboard.press('Tab');
      await expect(link).toBeFocused();
      await expect(link).toHaveCSS('outline-color', 'rgb(255, 255, 255)');
      await expect(link).toHaveCSS('outline-width', '2px');
    }
  },
);

test('has no axe violations in the shell', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Disputes' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
