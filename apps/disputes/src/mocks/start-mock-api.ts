import { apiPath, formatLocalDate } from '@gscf/core';
import { createDisputesHandlers, DisputesRepository } from '@gscf/disputes-mock';
import { setupWorker } from 'msw/browser';

declare const COMPILE_TIME_ENABLE_TEST_SCENARIOS: boolean;

export async function startMockApi(apiBasePath: string): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('The mock API requires a browser with service worker support.');
  }

  const apiBaseUrl = new URL(apiBasePath, window.location.origin);
  const workerUrl = new URL('mockServiceWorker.js', document.baseURI);
  const disputesUrl = apiPath(apiBaseUrl.href, 'disputes');
  const handlers = createDisputesHandlers(disputesUrl, new DisputesRepository(formatLocalDate));
  if (COMPILE_TIME_ENABLE_TEST_SCENARIOS) {
    const { testScenarioHandlers } = await import('./test-scenarios');
    handlers.unshift(...testScenarioHandlers(disputesUrl));
  }
  const worker = setupWorker(...handlers);
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
}
