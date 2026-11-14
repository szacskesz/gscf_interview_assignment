import {
  amountErrors,
  isCurrency,
  isNonblankText,
  isPositiveSafeInteger,
  isRecord,
  validateAmount,
  type ApiError,
} from '@gscf/disputes-data-access';
import { http, HttpResponse } from 'msw/http';
import type { DisputesRepository } from './disputes-repository';

export function createDisputesHandlers(url: string, repository: DisputesRepository) {
  return [
    http.get(url, () => HttpResponse.json(repository.list())),
    http.post(url, async ({ request }) => {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return HttpResponse.json<ApiError>({ message: 'Invalid JSON body.' }, { status: 400 });
      }

      const { buyer, reason, amount, currency } = isRecord(body) ? body : {};
      const result = typeof amount === 'string' ? validateAmount(amount) : null;
      const fields: NonNullable<ApiError['fields']> = {};
      if (!isNonblankText(buyer)) fields.buyer = 'Enter a buyer name.';
      if (!isNonblankText(reason)) fields.reason = 'Enter a dispute reason.';
      if (!isCurrency(currency)) fields.currency = 'Select a currency.';
      if (!result?.valid) fields.amount = amountErrors[result?.error ?? 'invalid'];

      if (
        !isNonblankText(buyer) ||
        !isNonblankText(reason) ||
        !isCurrency(currency) ||
        !result?.valid
      ) {
        return HttpResponse.json<ApiError>(
          { message: 'Check the highlighted fields.', fields },
          { status: 422 },
        );
      }

      const created = repository.create({
        buyer: buyer.trim(),
        reason: reason.trim(),
        amountMinorUnits: result.minorUnits,
        currency,
      });
      return HttpResponse.json(created, { status: 201 });
    }),
    http.delete(`${url}/:number`, ({ params }) => {
      const raw = params['number'];
      const number = typeof raw === 'string' && /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (!isPositiveSafeInteger(number)) {
        return HttpResponse.json<ApiError>({ message: 'Invalid dispute number.' }, { status: 400 });
      }
      if (!repository.remove(number)) {
        return HttpResponse.json<ApiError>({ message: 'Dispute not found.' }, { status: 404 });
      }
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}
