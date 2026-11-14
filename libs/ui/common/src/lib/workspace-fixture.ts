import { Component, input, model, output } from '@angular/core';

@Component({
  selector: 'gscf-workspace-fixture',
  template: `
    <button
      type="button"
      class="min-h-11 rounded-md bg-primary px-4 font-semibold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      (click)="increment()"
    >
      {{ $label() }}: {{ $count() }}
    </button>
  `,
})
export class WorkspaceFixture {
  /** Required text identifying the workspace check. */
  readonly $label = input.required<string>({ alias: 'label' });

  /** Current count, exposed as the `count` two-way binding. Defaults to zero. */
  readonly $count = model(0, { alias: 'count' });

  /** Emits the updated count after a button activation. */
  readonly activated = output<number>();

  protected increment(): void {
    this.$count.update((count) => count + 1);
    this.activated.emit(this.$count());
  }
}
