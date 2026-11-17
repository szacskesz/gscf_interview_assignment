import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

export type IconName = 'add' | 'remove' | 'close' | 'warning' | 'check';

@Component({
  selector: 'gscf-icon',
  imports: [MatIcon],
  host: { 'aria-hidden': 'true', class: 'inline-flex shrink-0' },
  template: `<mat-icon class="size-5!" [svgIcon]="'gscf:' + $name()" />`,
})
export class Icon {
  /** Required name of the decorative icon. The surrounding control supplies its accessible name. */
  readonly $name = input.required<IconName>({ alias: 'name' });
}
