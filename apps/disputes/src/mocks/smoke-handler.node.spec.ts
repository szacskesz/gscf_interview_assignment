import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';
import { createSmokeHandler } from './smoke-handler';

const apiUrl = new URL('http://mock.test/api');
const server = setupServer(createSmokeHandler(apiUrl));

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it('shares the browser readiness endpoint with the Node interceptor', async () => {
  const response = await fetch(`${apiUrl.href}/__mock-readiness`);

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ ready: true });
});
