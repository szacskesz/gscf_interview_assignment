import type { Currency } from './dispute.model';

export interface CreateDisputeRequest {
  readonly buyer: string;
  readonly reason: string;
  /** Disputed amount in integer cents. */
  readonly amount: number;
  readonly currency: Currency;
}

export interface ApiError {
  readonly message: string;
}
