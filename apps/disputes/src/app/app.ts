import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [NgOptimizedImage, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'gscf-root',
  template: `
    <header class="flex items-center gap-5 bg-brand px-4 py-2 sm:gap-10 sm:px-8">
      <img ngSrc="gscf-logo.png" alt="GSCF" width="81" height="24" priority />
      <nav aria-label="Main navigation">
        <a
          routerLink="/disputes"
          routerLinkActive=""
          ariaCurrentWhenActive="page"
          class="inline-flex min-h-11 items-center border-b-2 border-transparent px-2 text-sm font-semibold text-surface aria-[current=page]:border-surface focus-visible:outline-2 focus-visible:outline-surface"
        >
          Disputes
        </a>
      </nav>
      <div class="ms-auto flex items-center gap-3 text-xs text-surface sm:gap-5">
        <span aria-label="Language: English">EN</span>
        <span>Ben Rogers</span>
      </div>
    </header>
    <main class="mx-auto max-w-[96rem] px-4 py-8 sm:px-8 lg:px-12">
      <router-outlet />
    </main>
  `,
})
export class App {}
