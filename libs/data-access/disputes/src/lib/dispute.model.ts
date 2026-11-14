export type Currency = 'USD' | 'EUR';
export type DisputeStatus = 'New' | 'Acknowledged';

export interface Dispute {
  readonly number: number;
  readonly buyer: string;
  readonly status: DisputeStatus;
  readonly disputeDate: string;
  readonly amountMinorUnits: number;
  readonly currency: Currency;
  readonly reason: string;
}

export function isCurrency(value: unknown): value is Currency {
  return value === 'USD' || value === 'EUR';
}

export function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}
