import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspaceFixture } from '@gscf/ui-common';

@Component({
  imports: [NgOptimizedImage, RouterOutlet, WorkspaceFixture],
  selector: 'gscf-root',
  template: `
    <header class="bg-brand px-4 py-2 sm:px-8">
      <img ngSrc="gscf-logo.png" alt="GSCF" width="162" height="48" priority />
    </header>
    <main class="space-y-4 px-4 py-8 sm:px-8">
      <h1 class="text-2xl font-semibold text-brand">Disputes</h1>
      <gscf-workspace-fixture />
      <router-outlet />
    </main>
  `,
})
export class App {}
