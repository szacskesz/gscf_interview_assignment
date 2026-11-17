import { Service, computed, inject, signal } from '@angular/core';
import { catchError, defer, finalize, map, of, tap, type Observable } from 'rxjs';
import type { Dispute } from '../../models/dispute.model';
import type { MutationResult, ReadState } from '../../models/disputes-store.model';
import { DisputesApi } from '../disputes-api/disputes-api.service';

@Service({ autoProvided: false })
export class DisputesStore {
  private readonly disputesApi = inject(DisputesApi);
  private readonly $list = this.disputesApi.read();
  private readonly $pendingOperation = signal(false);

  readonly $pending = this.$pendingOperation.asReadonly();
  readonly $readState = computed<ReadState>(() => {
    if (this.$list.isLoading()) return 'loading';
    if (this.$list.error()) return 'error';
    return this.$list.hasValue() ? 'ready' : 'loading';
  });
  readonly $rows = computed<readonly Dispute[]>(() =>
    this.$list.hasValue() ? this.$list.value() : [],
  );

  retry(): boolean {
    return !this.$pending() && this.$readState() === 'error' && this.$list.reload();
  }

  create(draft: Partial<Dispute>): Observable<MutationResult<Dispute>> {
    return this.mutate(
      () =>
        this.disputesApi
          .create(draft)
          .pipe(tap((created) => this.$list.update((rows) => [created, ...(rows ?? [])]))),
      'Dispute could not be created. Try again.',
    );
  }

  remove(id: number): Observable<MutationResult<void>> {
    return this.mutate(
      () =>
        this.disputesApi.remove(id).pipe(
          map(() => {
            this.$list.update((rows) => (rows ?? []).filter((row) => row.id !== id));
            return undefined;
          }),
        ),
      'Dispute could not be removed. Try again.',
    );
  }

  private mutate<T>(
    operation: () => Observable<T>,
    fallback: string,
  ): Observable<MutationResult<T>> {
    return defer(() => {
      if (this.$pending() || this.$readState() !== 'ready') {
        return of<MutationResult<T>>({
          ok: false,
          error: { message: 'Disputes are currently busy.' },
        });
      }

      this.$pendingOperation.set(true);
      return defer(operation).pipe(
        map((value): MutationResult<T> => ({ ok: true, value })),
        catchError(() => of<MutationResult<T>>({ ok: false, error: { message: fallback } })),
        finalize(() => this.$pendingOperation.set(false)),
      );
    });
  }
}
