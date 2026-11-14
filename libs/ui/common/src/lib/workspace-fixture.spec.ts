import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { WorkspaceFixture } from './workspace-fixture';

describe('Workspace fixture', () => {
  it('updates the rendered count after clicks in the zoneless environment', async () => {
    const fixture = TestBed.createComponent(WorkspaceFixture);
    await fixture.whenStable();

    const host: HTMLElement = fixture.nativeElement;
    const button = host.querySelector('button')!;
    expect(button.textContent?.trim()).toBe('Workspace check: 0');

    button.click();
    button.click();
    await fixture.whenStable();

    expect(button.textContent?.trim()).toBe('Workspace check: 2');
  });
});
