import { Component, input, output } from '@angular/core';
import { Button } from '../button/button';
import { Icon } from '../icon/icon';

@Component({
  imports: [Button, Icon],
  selector: 'gscf-dialog-frame',
  host: {
    class: 'block max-h-[calc(100dvh-2rem)] overflow-y-auto rounded-lg bg-surface p-5 sm:p-6',
  },
  template: `
    <header class="mb-3 flex items-start justify-between gap-3">
      <h2 [id]="$headingId()" class="pt-2 text-xl font-semibold text-brand">{{ $heading() }}</h2>
      <button
        type="button"
        gscfButton="icon"
        aria-label="Close"
        [disabled]="$busy()"
        (click)="closed.emit()"
      >
        <gscf-icon name="close" />
      </button>
    </header>
    <ng-content />
  `,
})
export class DialogFrame {
  /** Required visible title of the dialog. */
  readonly $heading = input.required<string>({ alias: 'heading' });

  /** Required unique title ID used to name the enclosing CDK dialog. */
  readonly $headingId = input.required<string>({ alias: 'headingId' });

  /** Disables the close button while a submitted operation is pending. */
  readonly $busy = input(false, { alias: 'busy' });

  /** Requests dismissal from the close button. */
  readonly closed = output<void>();
}
