import { TestBed } from '@angular/core/testing';
import { page, userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import { WorkspaceFixture } from './workspace-fixture';

describe('Workspace fixture in Chromium', () => {
  it('increments through native keyboard activation', async () => {
    const fixture = TestBed.createComponent(WorkspaceFixture);
    fixture.componentRef.setInput('label', 'Workspace check');
    await fixture.whenStable();

    const button = page.getByRole('button', { name: 'Workspace check: 0' });
    await userEvent.tab();
    await expect.element(button).toHaveFocus();
    await userEvent.keyboard('{Enter}');

    await expect.element(page.getByRole('button', { name: 'Workspace check: 1' })).toHaveFocus();
  });
});
