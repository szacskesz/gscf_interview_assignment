import { Component, ElementRef, computed, input, output, viewChildren } from '@angular/core';
import { formatAmount, formatCalendarDate } from '@gscf/core';
import type { Dispute } from '@gscf/disputes-data-access';
import { Badge, Button, Icon } from '@gscf/ui-common';

@Component({
  selector: 'gscf-disputes-table',
  imports: [Badge, Button, Icon],
  templateUrl: './disputes-table.html',
})
export class DisputesTable {
  readonly $rows = input.required<readonly Dispute[]>({ alias: 'rows' });
  readonly removalRequested = output<{ dispute: Dispute; trigger: HTMLButtonElement }>();
  private readonly $removeButtons = viewChildren<ElementRef<HTMLButtonElement>>('removeButton');

  focusRemoveAt(index: number): boolean {
    const buttons = this.$removeButtons();
    const button = buttons[Math.min(index, buttons.length - 1)];
    if (!button) return false;
    button.nativeElement.focus();
    return true;
  }

  protected readonly $displayRows = computed(() =>
    this.$rows().map((row) => ({
      ...row,
      dateLabel: formatCalendarDate(row.date),
      amountLabel: formatAmount(row.amount),
    })),
  );
}
