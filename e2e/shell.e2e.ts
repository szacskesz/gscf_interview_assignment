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
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page
        .getByRole('img', { name: 'GSCF' })
        .evaluate((image: HTMLImageElement) => image.naturalWidth),
    ).toBeGreaterThan(0);
    expect(failures).toEqual([]);
  },
);

test('has no axe violations in the shell', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Disputes' })).toBeVisible();
  await expect(page.getByRole('table')).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
