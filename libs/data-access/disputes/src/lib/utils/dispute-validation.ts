import type { Currency } from '../models/dispute.model';

export function isCurrency(value: unknown): value is Currency {
  return value === 'USD' || value === 'EUR';
}

export function isPositiveSafeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNonblankText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
