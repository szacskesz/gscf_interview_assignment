import { Dialog, type DialogConfig } from '@angular/cdk/dialog';
import { signal, type Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from '@angular/material/icon/testing';
import { DisputesStore, type Dispute } from '@gscf/disputes-data-access';
import { Notifications } from '@gscf/ui-notifications';
import { Subject, type Observable } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { CreateDisputeDialog } from './create-dispute-dialog';
import { DisputesOverview } from './disputes-overview';
import { RemoveDisputeDialog } from './remove-dispute-dialog';

const dispute: Dispute = {
  id: 6228,
  buyer: 'Buyer',
  reason: 'Invoice issue',
  amount: 1230,
  currency: 'USD',
  status: 'New',
  date: '2026-11-14T12:00:00.000Z',
};

async function createOverview(state: ReturnType<DisputesStore['$readState']> = 'ready') {
  const $readState = signal(state);
  const $rows = signal<readonly Dispute[]>([]);
  const retry = vi.fn();
  const closed$ = new Subject<Dispute | boolean | undefined>();
  const open = vi
    .fn<
      (
        component: Type<unknown>,
        config: DialogConfig<Dispute>,
      ) => { closed: Observable<Dispute | boolean | undefined> }
    >()
    .mockReturnValue({ closed: closed$ });
  const success = vi.fn();
  TestBed.configureTestingModule({
    providers: [
      { provide: MatIconRegistry, useClass: FakeMatIconRegistry },
      { provide: Dialog, useValue: { open } },
      { provide: Notifications, useValue: { success } },
    ],
  }).overrideComponent(DisputesOverview, {
    set: {
      providers: [
        { provide: DisputesStore, useValue: { $readState, $rows, $pending: signal(false), retry } },
      ],
    },
  });
  const fixture = TestBed.createComponent(DisputesOverview);
  await fixture.whenStable();
  const element: HTMLElement = fixture.nativeElement;
  const newDispute = element.querySelector<HTMLButtonElement>('button[gscfButton="primary"]')!;
  return { fixture, element, $readState, $rows, retry, closed$, open, success, newDispute };
}

describe('Disputes overview', () => {
  it('keeps loading, failure, loaded-empty, and populated states distinct', async () => {
    const { fixture, element, $readState, $rows, newDispute, retry, open } =
      await createOverview('loading');
    expect(element.querySelector('[role="status"]')?.textContent).toBe('Loading disputes…');
    expect(newDispute.disabled).toBe(true);
    newDispute.click();
    expect(open).not.toHaveBeenCalled();

    $readState.set('error');
    await fixture.whenStable();
    expect(element.querySelector('[role="alert"]')?.textContent).toBe(
      'Disputes could not be loaded.',
    );
    element.querySelector<HTMLButtonElement>('button[gscfButton="secondary"]')!.click();
    expect(retry).toHaveBeenCalledOnce();

    $readState.set('ready');
    await fixture.whenStable();
    expect(element.querySelector('h2')?.textContent).toBe('No disputes');
    expect(element.querySelector('table')).toBeNull();
    expect(element.querySelector('[role="status"]')).toBeNull();
    expect(newDispute.disabled).toBe(false);

    $rows.set([dispute]);
    await fixture.whenStable();
    expect(element.querySelector('[role="status"]')?.textContent?.trim()).toBe('Showing 1/1 rows');
    expect(element.querySelector('tbody tr')?.textContent).toContain(dispute.buyer);
  });

  it('announces creation only when the dialog returns a saved record', async () => {
    const { closed$, newDispute, open, success } = await createOverview();
    const cancelled$ = new Subject<undefined>();
    open.mockReturnValueOnce({ closed: cancelled$ });

    newDispute.click();
    expect(open.mock.calls[0]?.[0]).toBe(CreateDisputeDialog);
    cancelled$.next(undefined);
    cancelled$.complete();
    expect(success).not.toHaveBeenCalled();

    newDispute.click();
    closed$.next(dispute);
    closed$.complete();
    expect(success).toHaveBeenCalledExactlyOnceWith(
      'Dispute created',
      'Dispute 6228 has been created.',
    );
  });

  it('passes the selected row to confirmation and focuses New Dispute after the last removal', async () => {
    const { fixture, element, $rows, closed$, newDispute, open, success } = await createOverview();
    $rows.set([dispute]);
    await fixture.whenStable();
    const remove = element.querySelector<HTMLButtonElement>(
      'button[aria-label="Remove dispute 6228"]',
    )!;
    remove.focus();
    remove.click();
    expect(open.mock.calls[0]?.[0]).toBe(RemoveDisputeDialog);
    expect(open.mock.calls[0]?.[1].data).toMatchObject(dispute);
    expect(open.mock.calls[0]?.[1].restoreFocus).toBe(remove);

    $rows.set([]);
    closed$.next(true);
    closed$.complete();
    await fixture.whenStable();
    expect(success).toHaveBeenCalledExactlyOnceWith(
      'Dispute removed',
      'Dispute 6228 has been removed.',
    );
    expect(newDispute.ownerDocument.activeElement).toBe(newDispute);
  });
});
