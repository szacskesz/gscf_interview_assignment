export type Currency = 'USD' | 'EUR';
export type DisputeStatus = 'New' | 'Acknowledged';

export interface Dispute {
  readonly id: number;
  readonly buyer: string;
  readonly status: DisputeStatus;
  /** Calendar date in YYYY-MM-DD format. */
  readonly date: string;
  /** Disputed amount in integer cents. */
  readonly amount: number;
  readonly currency: Currency;
  readonly reason: string;
}

export type CreateDisputeRequest = Pick<Dispute, 'buyer' | 'reason' | 'amount' | 'currency'>;
