import { expect, test } from '@playwright/test';

test('intercepts the first API request before the application renders', async ({
  page,
  request,
}) => {
  const readinessResponse = page.waitForResponse('**/api/__mock-readiness');

  await page.goto('/');

  const readiness = await readinessResponse;
  expect(readiness.fromServiceWorker()).toBe(true);
  expect(readiness.ok()).toBe(true);
  await expect(readiness.json()).resolves.toEqual({ ready: true });
  await expect(page.getByRole('heading', { name: 'Disputes' })).toBeVisible();

  const worker = await request.get('/mockServiceWorker.js');
  expect(worker.ok()).toBe(true);
  expect(worker.headers()['content-type']).toMatch(/javascript/);
});
