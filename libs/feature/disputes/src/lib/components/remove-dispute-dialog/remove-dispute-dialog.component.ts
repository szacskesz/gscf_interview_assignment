import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { DecimalPipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, DialogFrame } from '@gscf/ui-common';
import { finalize } from 'rxjs';

@Component({
  selector: 'gscf-remove-dispute-dialog',
  imports: [Button, DecimalPipe, DialogFrame],
  template: `
    <gscf-dialog-frame
      [heading]="'Remove dispute ' + dispute.id"
      headingId="remove-dispute-title"
      [busy]="$busy()"
      (closed)="dismiss()"
    >
      <p id="remove-dispute-description" class="mb-6 wrap-anywhere text-sm">
        Dispute {{ dispute.id }} ({{ dispute.reason }},
        {{ dispute.amount | number: '1.2-2' : 'en-US' }}
        {{ dispute.currency }}) will be removed from the Disputes list, together with its comments
        and linked invoices. This cannot be undone.
      </p>
      @if ($failure(); as error) {
        <p role="alert" class="mb-4 text-sm text-danger">{{ error }}</p>
      }
      <footer dialogActions class="flex flex-wrap items-center justify-end gap-3">
        @if ($busy()) {
          <p role="status" class="mr-auto text-sm">Removing dispute…</p>
        }
        <button
          id="remove-dispute-cancel"
          type="button"
          gscfButton="secondary"
          [disabled]="$busy()"
          (click)="dismiss()"
        >
          Cancel
        </button>
        <button
          type="button"
          gscfButton="danger"
          [attr.aria-disabled]="$busy() || null"
          (click)="confirm()"
        >
          Remove dispute
        </button>
      </footer>
    </gscf-dialog-frame>
  `,
})
export class RemoveDisputeDialog {
  private readonly dialog = inject<DialogRef<boolean>>(DialogRef);
  private readonly store = inject(DisputesStore);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly dispute = inject<Dispute>(DIALOG_DATA);
  protected readonly $busy = this.store.$pending;
  protected readonly $failure = signal<string | null>(null);

  protected dismiss(): void {
    if (!this.$busy()) this.dialog.close();
  }

  protected confirm(): void {
    if (this.$busy()) return;
    this.$failure.set(null);
    this.dialog.disableClose = true;
    this.store
      .remove(this.dispute.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => (this.dialog.disableClose = false)),
      )
      .subscribe((result) => {
        if (result.ok) this.dialog.close(true);
        else this.$failure.set(result.error.message);
      });
  }
}
