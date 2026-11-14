import { Component, signal } from '@angular/core';

@Component({
  selector: 'gscf-workspace-fixture',
  template: `
    <button
      type="button"
      class="min-h-11 rounded-md bg-primary px-4 font-semibold text-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      (click)="increment()"
    >
      Workspace check: {{ $count() }}
    </button>
  `,
})
export class WorkspaceFixture {
  protected readonly $count = signal(0);

  protected increment(): void {
    this.$count.update((count) => count + 1);
  }
}
