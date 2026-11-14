import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceFixture } from '@gscf/ui-common';

@Component({
  imports: [RouterOutlet, WorkspaceFixture],
  selector: 'gscf-root',
  template: `
    <main>
      <h1>Disputes</h1>
      <gscf-workspace-fixture />
      <router-outlet />
    </main>
  `,
})
export class App {}
