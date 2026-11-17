import type { Currency } from './dispute.model';

export interface CreateDisputeRequest {
  readonly buyer: string;
  readonly reason: string;
  readonly amountMinorUnits: number;
  readonly currency: Currency;
}

export interface ApiError {
  readonly message: string;
}
