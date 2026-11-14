import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('Disputes shell', () => {
  it('renders the navigation link and supplied brand image', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const shell: HTMLElement = fixture.nativeElement;
    expect(shell.querySelector('nav a')?.getAttribute('href')).toBe('/disputes');
    expect(shell.querySelector('header img[alt="GSCF"]')?.getAttribute('src')).toBe(
      'gscf-logo.png',
    );
  });
});
