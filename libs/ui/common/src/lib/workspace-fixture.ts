import { Component, signal } from '@angular/core';

@Component({
  selector: 'gscf-workspace-fixture',
  template: `
    <button type="button" (click)="increment()">Workspace check: {{ $count() }}</button>
  `,
})
export class WorkspaceFixture {
  protected readonly $count = signal(0);

  protected increment(): void {
    this.$count.update((count) => count + 1);
  }
}
