import { expect, test } from '@playwright/test';

test('serves the disputes API through its registered worker', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Disputes' })).toBeVisible();

  const [disputes] = await Promise.all([
    page.waitForResponse('**/api/disputes'),
    page.evaluate(() => fetch('/api/disputes').then((response) => response.ok)),
  ]);
  expect(disputes.fromServiceWorker()).toBe(true);
  expect(disputes.ok()).toBe(true);
  await expect(disputes.json()).resolves.toMatchObject([
    { number: 6228 },
    { number: 6227 },
    { number: 6224 },
  ]);

  const worker = await request.get('/mockServiceWorker.js');
  expect(worker.ok()).toBe(true);
  expect(worker.headers()['content-type']).toMatch(/javascript/);
});
