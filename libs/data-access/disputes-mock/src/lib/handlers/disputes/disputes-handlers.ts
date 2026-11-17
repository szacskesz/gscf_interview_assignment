import { http, HttpResponse } from 'msw/http';
import type { DisputesRepository } from '../../repositories/disputes/disputes-repository';

export function createDisputesHandlers(url: string, repository: DisputesRepository) {
  return [
    http.get(url, () => HttpResponse.json(repository.list())),
    http.post<never, Parameters<DisputesRepository['create']>[0]>(url, async ({ request }) => {
      const created = repository.create(await request.json());
      return HttpResponse.json(created, { status: 201 });
    }),
    http.delete<{ id: string }>(`${url}/:id`, ({ params }) => {
      if (!repository.remove(Number(params.id))) {
        return HttpResponse.json({ message: 'Dispute not found.' }, { status: 404 });
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
