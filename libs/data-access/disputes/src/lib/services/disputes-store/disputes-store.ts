import { Service, computed, inject, signal } from '@angular/core';
import type { Dispute } from '../../models/dispute.model';
import type { MutationResult, ReadState } from '../../models/disputes-store.model';
import { DisputesApi } from '../disputes-api/disputes-api';

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

  async create(draft: Partial<Dispute>): Promise<MutationResult<Dispute>> {
    return this.mutate(async () => {
      const created = await this.disputesApi.create(draft);
      this.$list.update((rows) => [created, ...(rows ?? [])]);
      return created;
    }, 'Dispute could not be created. Try again.');
  }

  async remove(id: number): Promise<MutationResult<void>> {
    return this.mutate(async () => {
      await this.disputesApi.remove(id);
      this.$list.update((rows) => (rows ?? []).filter((row) => row.id !== id));
    }, 'Dispute could not be removed. Try again.');
  }

  private async mutate<T>(
    operation: () => Promise<T>,
    fallback: string,
  ): Promise<MutationResult<T>> {
    if (this.$pending() || this.$readState() !== 'ready') {
      return { ok: false, error: { message: 'Disputes are currently busy.' } };
    }

    this.$pendingOperation.set(true);
    try {
      return { ok: true, value: await operation() };
    } catch {
      return { ok: false, error: { message: fallback } };
    } finally {
      this.$pendingOperation.set(false);
    }
  }
}
