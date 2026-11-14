import { expect, test } from '@playwright/test';

test('serves the disputes API through its registered worker', async ({ page, request }) => {
  const firstResponse = page.waitForResponse('**/api/disputes');
  await page.goto('/');
  const disputes = await firstResponse;
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
