import type { Currency } from './dispute.model';

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
