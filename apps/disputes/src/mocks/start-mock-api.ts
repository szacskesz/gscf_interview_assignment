import { setupWorker } from 'msw/browser';
import { createSmokeHandler } from './smoke-handler';

export async function startMockApi(apiBasePath: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('The mock API requires a browser with service worker support.');
  }

  const apiBaseUrl = new URL(apiBasePath, window.location.origin);
  const workerUrl = new URL('mockServiceWorker.js', document.baseURI);
  const worker = setupWorker(createSmokeHandler(apiBaseUrl));
  const registration = await worker.start({
    serviceWorker: { url: workerUrl.href },
    quiet: true,
    onUnhandledFrame({ frame, defaults }) {
      if (
        frame.protocol !== 'http' ||
        typeof frame.data !== 'object' ||
        frame.data === null ||
        !('request' in frame.data) ||
        !(frame.data.request instanceof Request)
      ) {
        return;
      }

      const requestUrl = new URL(frame.data.request.url);
      const apiPath = apiBaseUrl.pathname;
      if (
        requestUrl.origin === apiBaseUrl.origin &&
        (requestUrl.pathname === apiPath || requestUrl.pathname.startsWith(`${apiPath}/`))
      ) {
        defaults.error();
      }
    },
  });

  if (!registration) {
    throw new Error('The mock API did not register a service worker.');
  }

  const response = await fetch(`${apiBaseUrl.href}/__mock-readiness`, {
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
    throw new Error('The mock API did not intercept its readiness request.');
  }
}
