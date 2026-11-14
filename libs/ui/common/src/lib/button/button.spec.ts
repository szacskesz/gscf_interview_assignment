import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { Button } from './button';

@Component({
  imports: [Button],
  template: '<button type="button" gscfButton="danger">Delete</button>',
})
class ButtonHost {}

it('applies the danger treatment to the native button', async () => {
  const fixture = TestBed.createComponent(ButtonHost);
  await fixture.whenStable();
  const host: HTMLElement = fixture.nativeElement;
  expect(host.querySelector('button')?.classList.contains('bg-danger')).toBe(true);
});
