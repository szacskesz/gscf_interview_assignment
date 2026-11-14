import { Component, input } from '@angular/core';

export type IconName = 'add' | 'remove' | 'close' | 'warning' | 'check';

@Component({
  selector: 'gscf-icon',
  host: { 'aria-hidden': 'true', class: 'inline-flex shrink-0' },
  template: `
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @switch ($name()) {
        @case ('add') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('remove') {
          <path d="M3 6h18M9 6V3h6v3m4 0-1 15H6L5 6m5 4v7m4-7v7" />
        }
        @case ('close') {
          <path d="m6 6 12 12M18 6 6 18" />
        }
        @case ('warning') {
          <path d="m12 3 10 18H2L12 3Zm0 7v4m0 3h.01" />
        }
        @case ('check') {
          <path d="m5 12 4 4L19 6" />
        }
      }
    </svg>
  `,
})
export class Icon {
  /** Required name of the decorative icon. The surrounding control supplies its accessible name. */
  readonly $name = input.required<IconName>({ alias: 'name' });
}
