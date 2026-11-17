import type { CreateDisputeRequest } from '@gscf/disputes-data-access';
import { http, HttpResponse } from 'msw/http';
import type { DisputesRepository } from './disputes-repository';

export function createDisputesHandlers(url: string, repository: DisputesRepository) {
  return [
    http.get(url, () => HttpResponse.json(repository.list())),
    http.post<never, CreateDisputeRequest>(url, async ({ request }) => {
      const created = repository.create(await request.json());
      return HttpResponse.json(created, { status: 201 });
    }),
    http.delete<{ number: string }>(`${url}/:number`, ({ params }) => {
      if (!repository.remove(Number(params.number))) {
        return HttpResponse.json({ message: 'Dispute not found.' }, { status: 404 });
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
