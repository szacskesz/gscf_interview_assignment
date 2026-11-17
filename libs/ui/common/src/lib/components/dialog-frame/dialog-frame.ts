import { Component, input, output } from '@angular/core';
import { Button } from '../../directives/button/button';
import { Icon } from '../icon/icon';

@Component({
  imports: [Button, Icon],
  selector: 'gscf-dialog-frame',
  host: {
    class: 'flex max-h-[calc(100dvh-2rem)] flex-col rounded-lg bg-surface py-5 sm:py-6',
  },
  template: `
    <header class="flex shrink-0 items-start justify-between gap-3 px-5 pb-2 sm:px-6">
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
    <div class="min-h-0 overflow-y-auto px-5 py-1 sm:px-6">
      <ng-content />
    </div>
    <div class="shrink-0 px-5 sm:px-6">
      <ng-content select="[dialogActions]" />
    </div>
  `,
})
/** Keeps the title and any projected `[dialogActions]` visible while the body scrolls. */
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
