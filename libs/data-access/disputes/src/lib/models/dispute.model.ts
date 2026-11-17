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
