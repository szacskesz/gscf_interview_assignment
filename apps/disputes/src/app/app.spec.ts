import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('Disputes shell', () => {
  it('renders the application heading and supplied brand image', async () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const shell: HTMLElement = fixture.nativeElement;
    expect(shell.querySelector('main h1')?.textContent).toBe('Disputes');
    expect(shell.querySelector('header img[alt="GSCF"]')?.getAttribute('src')).toBe(
      'gscf-logo.png',
    );
  });
});
