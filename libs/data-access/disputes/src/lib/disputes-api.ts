import { HttpClient, HttpErrorResponse, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_BASE_PATH, apiPath } from '@gscf/core';
import { firstValueFrom } from 'rxjs';
import {
  isRecord,
  parseDispute,
  parseDisputes,
  type ApiError,
  type CreateDisputeRequest,
} from './dispute-api.model';

const requestTimeout = 10_000;
const fields = ['buyer', 'reason', 'amount', 'currency'] as const;

@Service()
export class DisputesApi {
  private readonly http = inject(HttpClient);
  private readonly url = apiPath(inject(API_BASE_PATH), 'disputes');

  read() {
    return httpResource(() => ({ url: this.url, timeout: requestTimeout, cache: 'no-store' }), {
      parse: parseDisputes,
    });
  }

  async create(draft: CreateDisputeRequest) {
    const response = await firstValueFrom(
      this.http.post<unknown>(this.url, draft, { timeout: requestTimeout }),
    );
    return parseDispute(response);
  }

  async remove(number: number): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(`${this.url}/${number}`, { timeout: requestTimeout }),
    );
  }
}

export function mutationError(error: unknown, fallback: string): ApiError {
  const body: unknown = error instanceof HttpErrorResponse ? error.error : null;
  if (!(error instanceof HttpErrorResponse) || error.status !== 422 || !isRecord(body)) {
    return { message: fallback };
  }
  const errors: NonNullable<ApiError['fields']> = {};
  const returned = body['fields'];
  if (isRecord(returned)) {
    for (const field of fields) {
      if (typeof returned[field] === 'string') errors[field] = returned[field];
    }
  }
  return { message: fallback, fields: errors };
}
