import { http, HttpResponse } from 'msw/http';
import { delay } from 'msw/utils/delay';

export function testScenarioHandlers(url: string) {
  const scenario = new URLSearchParams(location.search).get('scenario');
  switch (scenario) {
    case 'read-delay':
      return [
        http.get(url, async () => {
          await delay(700);
          return HttpResponse.json([]);
        }),
      ];
    case 'read-error':
      return [http.get(url, () => new HttpResponse(null, { status: 503 }), { once: true })];
    case 'read-retry-error':
      return [
        http.get(url, () => new HttpResponse(null, { status: 503 }), { once: true }),
        http.get(
          url,
          async () => {
            await delay(600);
            return new HttpResponse(null, { status: 503 });
          },
          { once: true },
        ),
      ];
    case 'create-error':
      return [
        http.post(
          url,
          async () => {
            await delay(600);
            return new HttpResponse(null, { status: 503 });
          },
          { once: true },
        ),
      ];
    case 'remove-error':
      return [
        http.delete(
          `${url}/:number`,
          async () => {
            await delay(600);
            return new HttpResponse(null, { status: 503 });
          },
          { once: true },
        ),
      ];
    default:
      return [];
  }
}
