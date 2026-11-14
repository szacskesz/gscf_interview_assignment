import { http, HttpResponse } from 'msw/http';

export function createSmokeHandler(apiBaseUrl: URL) {
  const url = new URL(`${apiBaseUrl.pathname}/__mock-readiness`, apiBaseUrl);
  return http.get(url.href, () => HttpResponse.json({ ready: true }));
}
