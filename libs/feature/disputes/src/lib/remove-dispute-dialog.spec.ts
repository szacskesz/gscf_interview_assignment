import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { describe, expect, it, vi } from 'vitest';
import { RemoveDisputeDialog } from './remove-dispute-dialog';

const dispute: Dispute = {
  number: 6228,
  buyer: 'Buyer',
  reason: 'Invoice issue',
  amountMinorUnits: 123450,
  currency: 'USD',
  status: 'New',
  disputeDate: '2026-11-14',
};

async function createDialog() {
  const $pending = signal(false);
  const remove = vi.fn<DisputesStore['remove']>();
  const dialog = { close: vi.fn(), disableClose: false };
  TestBed.configureTestingModule({
    providers: [
      { provide: DIALOG_DATA, useValue: dispute },
      { provide: DisputesStore, useValue: { $pending, remove } },
      { provide: DialogRef, useValue: dialog },
    ],
  });
  const fixture = TestBed.createComponent(RemoveDisputeDialog);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  return {
    fixture,
    element,
    $pending,
    remove,
    dialog,
    cancel: element.querySelector<HTMLButtonElement>('#remove-dispute-cancel')!,
    confirm: element.querySelector<HTMLButtonElement>('button[gscfButton="danger"]')!,
  };
}

describe('Remove dispute dialog', () => {
  it('shows the selected record and cancels without submitting a removal', async () => {
    const { element, cancel, dialog, remove } = await createDialog();
    expect(element.querySelector('h2')?.textContent).toBe('Remove dispute 6228');
    expect(element.querySelector('#remove-dispute-description')?.textContent).toContain(
      'Invoice issue, 1,234.50 USD',
    );

    cancel.click();
    expect(dialog.close).toHaveBeenCalledExactlyOnceWith();
    expect(remove).not.toHaveBeenCalled();
  });

  it('blocks duplicate removal while pending and allows dismissal again after failure', async () => {
    const { fixture, element, $pending, confirm, cancel, dialog, remove } = await createDialog();
    let failRequest!: () => void;
    const pending = new Promise<void>((resolve) => (failRequest = resolve));
    remove.mockImplementation(async () => {
      $pending.set(true);
      await pending;
      $pending.set(false);
      return { ok: false, error: { message: 'Removal failed.' } };
    });

    confirm.click();
    await fixture.whenStable();
    confirm.click();
    expect(cancel.disabled).toBe(true);
    expect(dialog.disableClose).toBe(true);
    expect(remove).toHaveBeenCalledExactlyOnceWith(dispute.number);
    expect(dialog.close).not.toHaveBeenCalled();

    failRequest();
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent).toBe('Removal failed.');
    expect(dialog.disableClose).toBe(false);
    expect(cancel.disabled).toBe(false);
    cancel.click();
    expect(dialog.close).toHaveBeenCalledExactlyOnceWith();
  });

  it('closes with a confirmed result after the store removes the selected record', async () => {
    const { fixture, confirm, dialog, remove } = await createDialog();
    remove.mockResolvedValue({ ok: true, value: undefined });
    confirm.click();
    await fixture.whenStable();

    expect(remove).toHaveBeenCalledExactlyOnceWith(dispute.number);
    expect(dialog.close).toHaveBeenCalledExactlyOnceWith(true);
  });
});
