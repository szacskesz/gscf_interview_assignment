import { DialogRef } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { describe, expect, it, vi } from 'vitest';
import { CreateDisputeDialog } from './create-dispute-dialog';

const dispute: Dispute = {
  number: 6229,
  buyer: 'Buyer',
  reason: 'Invoice issue',
  amountMinorUnits: 1230,
  currency: 'EUR',
  status: 'New',
  disputeDate: '2026-11-14',
};

async function createDialog() {
  const create = vi.fn<DisputesStore['create']>();
  const dialog = { close: vi.fn(), disableClose: false };
  TestBed.configureTestingModule({
    providers: [
      { provide: DisputesStore, useValue: { $pending: signal(false), create } },
      { provide: DialogRef, useValue: dialog },
    ],
  });
  const fixture = TestBed.createComponent(CreateDisputeDialog);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;

  function fillDraft() {
    for (const [id, value] of [
      ['dispute-buyer', '  Buyer  '],
      ['dispute-reason', '  Invoice issue  '],
      ['dispute-amount', '12.30'],
    ]) {
      const input = element.querySelector<HTMLInputElement>(`#${id}`)!;
      input.value = value;
      input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    }
    element.querySelector<HTMLInputElement>('input[value="EUR"]')!.click();
  }

  return {
    fixture,
    element,
    create,
    dialog,
    fillDraft,
    submit: element.querySelector<HTMLButtonElement>('button[type="submit"]')!,
  };
}

describe('Create dispute dialog', () => {
  it('shows required errors and focuses the first invalid input before calling the store', async () => {
    const { fixture, element, create, dialog, submit } = await createDialog();
    submit.click();
    await fixture.whenStable();

    const buyer = element.querySelector<HTMLInputElement>('#dispute-buyer')!;
    expect(buyer.ownerDocument.activeElement).toBe(buyer);
    expect(element.querySelector('#dispute-buyer-error')?.textContent).toBe('Enter a buyer name.');
    expect(element.querySelector('#dispute-currency-error')?.textContent).toBe(
      'Select a currency.',
    );
    expect(create).not.toHaveBeenCalled();
    expect(dialog.close).not.toHaveBeenCalled();
  });

  it('submits trimmed text and exact integer cents, then closes with the saved record', async () => {
    const { fixture, create, dialog, fillDraft, submit } = await createDialog();
    create.mockResolvedValue({ ok: true, value: dispute });
    fillDraft();
    await fixture.whenStable();
    submit.click();
    await fixture.whenStable();

    expect(create).toHaveBeenCalledExactlyOnceWith({
      buyer: 'Buyer',
      reason: 'Invoice issue',
      amountMinorUnits: 1230,
      currency: 'EUR',
    });
    expect(dialog.close).toHaveBeenCalledExactlyOnceWith(dispute);
  });

  it('shows a save failure and keeps the draft open for retry', async () => {
    const { fixture, element, create, dialog, fillDraft, submit } = await createDialog();
    create.mockResolvedValue({
      ok: false,
      error: { message: 'Dispute could not be created. Try again.' },
    });
    fillDraft();
    await fixture.whenStable();
    submit.click();
    await fixture.whenStable();

    const buyer = element.querySelector<HTMLInputElement>('#dispute-buyer')!;
    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      'Dispute could not be created. Try again.',
    );
    expect(buyer.value.trim()).toBe('Buyer');
    expect(dialog.close).not.toHaveBeenCalled();
    expect(dialog.disableClose).toBe(false);
  });
});
