import { DialogRef } from '@angular/cdk/dialog';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, DialogFrame } from '@gscf/ui-common';
import { finalize } from 'rxjs';
import { CreateDisputeForm } from '../create-dispute-form/create-dispute-form.component';

@Component({
  selector: 'gscf-create-dispute-dialog',
  imports: [Button, CreateDisputeForm, DialogFrame],
  templateUrl: './create-dispute-dialog.component.html',
})
export class CreateDisputeDialog {
  private readonly dialog = inject<DialogRef<Dispute>>(DialogRef);
  private readonly store = inject(DisputesStore);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly formId = 'dispute';
  protected readonly $busy = this.store.$pending;
  protected readonly $failure = signal<string | null>(null);

  protected save(draft: Partial<Dispute>): void {
    if (this.$busy()) return;

    this.$failure.set(null);
    this.dialog.disableClose = true;
    this.store
      .create(draft)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.dialog.disableClose = false)),
      )
      .subscribe((result) => {
        if (result.ok) {
          this.dialog.close(result.value);
        } else {
          this.$failure.set(result.error.message);
        }
      });
  }

  protected dismiss(): void {
    if (!this.$busy()) this.dialog.close();
  }
}
