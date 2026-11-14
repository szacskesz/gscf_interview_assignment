import { Dialog } from '@angular/cdk/dialog';
import {
  Component,
  ElementRef,
  Injector,
  ViewContainerRef,
  afterNextRender,
  inject,
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
  private readonly $table = viewChild(DisputesTable);
  protected readonly store = inject(DisputesStore);

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
          this.notifications.success(
            'Dispute created',
            `Dispute ${created.number} has been created.`,
          );
        }
      });
  }

  protected removeDispute(event: { dispute: Dispute; trigger: HTMLButtonElement }): void {
    if (this.store.$pending()) return;
    const { dispute, trigger } = event;
    const rowIndex = this.store.$rows().findIndex((row) => row.number === dispute.number);
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
        this.notifications.success(
          'Dispute removed',
          `Dispute ${dispute.number} has been removed.`,
        );
      });
  }
}
