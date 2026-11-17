import { Dialog } from '@angular/cdk/dialog';
import {
  Component,
  ElementRef,
  Injector,
  ViewContainerRef,
  afterNextRender,
  afterRenderEffect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Button, Icon } from '@gscf/ui-common';
import { Notifications } from '@gscf/ui-notifications';
import { CreateDisputeDialog } from './create-dispute-dialog';
import { DisputesTable } from './disputes-table';
import { RemoveDisputeDialog } from './remove-dispute-dialog';

@Component({
  selector: 'gscf-disputes-overview',
  imports: [Button, DisputesTable, Icon],
  providers: [DisputesStore],
  templateUrl: './disputes-overview.html',
})
export class DisputesOverview {
  private readonly dialog = inject(Dialog);
  private readonly notifications = inject(Notifications);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly injector = inject(Injector);
  private readonly $createButton =
    viewChild.required<ElementRef<HTMLButtonElement>>('createButton');
  private readonly $retryButton = viewChild<ElementRef<HTMLButtonElement>>('retryButton');
  private readonly $restoreRetryFocus = signal(false);
  private readonly $table = viewChild(DisputesTable);
  protected readonly store = inject(DisputesStore);

  constructor() {
    afterRenderEffect({
      earlyRead: () => {
        if (!this.$restoreRetryFocus()) return;
        const state = this.store.$readState();
        if (state === 'loading') return;

        const createButton = this.$createButton().nativeElement;
        const { activeElement, body } = createButton.ownerDocument;
        // Leave focus alone if the user moved to another control while waiting.
        const destination = state === 'ready' ? createButton : this.$retryButton()?.nativeElement;
        return { destination: activeElement === body ? destination : undefined };
      },
      write: (retryFocus) => {
        const result = retryFocus();
        if (!result) return;
        this.$restoreRetryFocus.set(false);
        result.destination?.focus();
      },
    });
  }

  protected retry(retryButton: HTMLButtonElement): void {
    const wasFocused = retryButton.ownerDocument.activeElement === retryButton;
    if (this.store.retry() && wasFocused) this.$restoreRetryFocus.set(true);
  }

  protected createDispute(): void {
    if (this.store.$pending() || this.store.$readState() !== 'ready') return;
    this.dialog
      .open<Dispute>(CreateDisputeDialog, {
        width: '36rem',
        maxWidth: 'calc(100vw - 2rem)',
        ariaLabelledBy: 'create-dispute-title',
        ariaDescribedBy: 'create-dispute-description',
        backdropClass: 'gscf-dialog-backdrop',
        autoFocus: '#dispute-buyer',
        viewContainerRef: this.viewContainerRef,
      })
      .closed.subscribe((created) => {
        if (created) {
          this.notifications.success('Dispute created', `Dispute ${created.id} has been created.`);
        }
      });
  }

  protected removeDispute(event: { dispute: Dispute; trigger: HTMLButtonElement }): void {
    if (this.store.$pending()) return;
    const { dispute, trigger } = event;
    const rowIndex = this.store.$rows().findIndex((row) => row.id === dispute.id);
    if (rowIndex < 0) return;
    this.dialog
      .open<boolean>(RemoveDisputeDialog, {
        data: dispute,
        width: '34rem',
        maxWidth: 'calc(100vw - 2rem)',
        ariaLabelledBy: 'remove-dispute-title',
        ariaDescribedBy: 'remove-dispute-description',
        backdropClass: 'gscf-dialog-backdrop',
        autoFocus: '#remove-dispute-cancel',
        restoreFocus: trigger,
        viewContainerRef: this.viewContainerRef,
      })
      .closed.subscribe((removed) => {
        if (!removed) return;
        afterNextRender(
          () => {
            if (!this.$table()?.focusRemoveAt(rowIndex)) this.$createButton().nativeElement.focus();
          },
          { injector: this.injector },
        );
        this.notifications.success('Dispute removed', `Dispute ${dispute.id} has been removed.`);
      });
  }
}
