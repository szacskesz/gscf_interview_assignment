import { HttpClient, httpResource } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { API_BASE_PATH, apiPath } from '@gscf/core';
import { firstValueFrom } from 'rxjs';
import type { Dispute } from '../models/dispute.model';

const requestTimeout = 10_000;

@Service()
export class DisputesApi {
  private readonly http = inject(HttpClient);
  private readonly url = apiPath(inject(API_BASE_PATH), 'disputes');

  read() {
    return httpResource<Dispute[]>(() => ({
      url: this.url,
      timeout: requestTimeout,
      cache: 'no-store',
    }));
  }

  create(draft: Partial<Dispute>): Promise<Dispute> {
    return firstValueFrom(this.http.post<Dispute>(this.url, draft, { timeout: requestTimeout }));
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.url}/${id}`, { timeout: requestTimeout }));
  }
}
