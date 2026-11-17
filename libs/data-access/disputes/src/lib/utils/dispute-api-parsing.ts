import { HttpErrorResponse } from '@angular/common/http';
import type { ApiError, CreateDisputeField } from '../models/dispute-api.model';
import type { Dispute } from '../models/dispute.model';
import { isCalendarDate } from './dispute-date';
import { isCurrency, isNonblankText, isPositiveSafeInteger, isRecord } from './dispute-validation';

const fields = [
  'buyer',
  'reason',
  'amount',
  'currency',
] as const satisfies readonly CreateDisputeField[];

export function parseDispute(value: unknown): Dispute {
  if (!isRecord(value)) throw new Error('The API returned an invalid dispute.');
  const { number, buyer, status, disputeDate, amountMinorUnits, currency, reason } = value;
  if (
    !isPositiveSafeInteger(number) ||
    !isNonblankText(buyer) ||
    (status !== 'New' && status !== 'Acknowledged') ||
    !isCalendarDate(disputeDate) ||
    !isPositiveSafeInteger(amountMinorUnits) ||
    !isCurrency(currency) ||
    !isNonblankText(reason)
  ) {
    throw new Error('The API returned an invalid dispute.');
  }
  return { number, buyer, status, disputeDate, amountMinorUnits, currency, reason };
}

export function parseDisputes(value: unknown): Dispute[] {
  if (!Array.isArray(value)) throw new Error('The API returned an invalid dispute list.');
  return value.map(parseDispute);
}

export function mutationError(error: unknown, fallback: string): ApiError {
  const body: unknown = error instanceof HttpErrorResponse ? error.error : null;
  if (!(error instanceof HttpErrorResponse) || error.status !== 422 || !isRecord(body)) {
    return { message: fallback };
  }
  const errors: NonNullable<ApiError['fields']> = {};
  const returned = body['fields'];
  if (isRecord(returned)) {
    for (const field of fields) {
      if (typeof returned[field] === 'string') errors[field] = returned[field];
    }
  }
  return { message: fallback, fields: errors };
}
