import { Component, input } from '@angular/core';

@Component({
  selector: 'gscf-badge',
  host: {
    class: 'inline-flex rounded-full border border-current px-2 py-0.5 text-xs font-semibold',
    '[class.bg-new]': '$tone() === "blue"',
    '[class.text-primary]': '$tone() === "blue"',
    '[class.bg-acknowledged]': '$tone() === "yellow"',
    '[class.text-acknowledged-ink]': '$tone() === "yellow"',
  },
  template: '<ng-content />',
})
export class Badge {
  /** Sets the color treatment. Supply the visible status as text content. */
  readonly $tone = input.required<'blue' | 'yellow'>({ alias: 'tone' });
}
