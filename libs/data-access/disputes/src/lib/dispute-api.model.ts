import { isCalendarDate } from './dispute-date';
import { isCurrency, isPositiveSafeInteger, type Currency, type Dispute } from './dispute.model';

export interface CreateDisputeRequest {
  readonly buyer: string;
  readonly reason: string;
  readonly amount: string;
  readonly currency: Currency;
}

export type CreateDisputeField = keyof CreateDisputeRequest;

export interface ApiError {
  readonly message: string;
  readonly fields?: Partial<Record<CreateDisputeField, string>>;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonblankText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

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
