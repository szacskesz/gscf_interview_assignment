import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_BASE_PATH, apiPath } from '@gscf/core';
import { firstValueFrom } from 'rxjs';
import type { CreateDisputeRequest } from '../models/dispute-api.model';
import { parseDispute, parseDisputes } from '../utils/dispute-api-parsing';

const requestTimeout = 10_000;

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
