import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test(
  'opens the shell and activates the workspace fixture by keyboard',
  {
    tag: ['@cross-browser', '@mobile'],
  },
  async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('Disputes');
    await expect(page.getByRole('heading', { name: 'Disputes', level: 1 })).toBeVisible();
    await expect(page.getByRole('img', { name: 'GSCF' })).toBeVisible();

    const button = page.getByRole('button', { name: 'Workspace check: 0' });
    await button.focus();
    await button.press('Enter');
    await expect(page.getByRole('button', { name: 'Workspace check: 1' })).toBeFocused();
  },
);

test('has no axe violations in the shell', { tag: '@mobile' }, async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
