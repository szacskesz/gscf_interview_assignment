export type Currency = 'USD' | 'EUR';
export type DisputeStatus = 'New' | 'Acknowledged';

export interface Dispute {
  readonly id: number;
  readonly buyer: string;
  readonly status: DisputeStatus;
  /** ISO 8601 timestamp in UTC. */
  readonly date: string;
  /** Disputed amount in integer cents. */
  readonly amount: number;
  readonly currency: Currency;
  readonly reason: string;
}

export interface ApiError {
  readonly message: string;
}
