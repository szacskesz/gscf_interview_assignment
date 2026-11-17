import type { ApiError } from './dispute-api.model';

export type MutationResult<T> = { ok: true; value: T } | { ok: false; error: ApiError };
export type ReadState = 'loading' | 'error' | 'ready';
