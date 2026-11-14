import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_BASE_PATH } from '@gscf/core';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DisputesStore } from './disputes-store';

const url = '/api/disputes';
const draft = { buyer: 'Buyer', reason: 'Reason', amount: '100.25', currency: 'EUR' } as const;
const row = {
  number: 6229,
  buyer: 'Buyer',
  reason: 'Reason',
  amountMinorUnits: 10025,
  currency: 'EUR',
  status: 'New',
  disputeDate: '2026-11-14',
} as const;

describe('Disputes store', () => {
  let store: DisputesStore;
  let http: HttpTestingController;
  const stable = () => TestBed.inject(ApplicationRef).whenStable();

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_PATH, useValue: '/api' },
        DisputesStore,
      ],
    });
    store = TestBed.inject(DisputesStore);
    http = TestBed.inject(HttpTestingController);
    TestBed.tick();
  });

  afterEach(() => http.verify());

  it('distinguishes loading, failed reads, and a successfully loaded empty list', async () => {
    expect(store.$readState()).toBe('loading');
    expect((await store.create(draft)).ok).toBe(false);
    http.expectOne({ url, method: 'GET' }).flush(null, { status: 503, statusText: 'Unavailable' });
    await stable();
    expect(store.$readState()).toBe('error');

    store.retry();
    TestBed.tick();
    http.expectOne({ url, method: 'GET' }).flush([]);
    await stable();
    expect(store.$readState()).toBe('ready');
    expect(store.$rows()).toEqual([]);
  });

  it('changes rows only on confirmed writes and blocks competing operations', async () => {
    http.expectOne({ url, method: 'GET' }).flush([]);
    await stable();

    const creating = store.create(draft);
    const request = http.expectOne({ url, method: 'POST' });
    expect(request.request.body).toEqual(draft);
    expect(store.$pending()).toBe(true);
    expect(store.$rows()).toEqual([]);
    expect((await store.create(draft)).ok).toBe(false);
    store.retry();
    http.expectNone({ url, method: 'GET' });
    request.flush(row);
    await expect(creating).resolves.toMatchObject({ ok: true });
    expect(store.$rows()).toEqual([row]);

    const removing = store.remove(row.number);
    http
      .expectOne({ url: `${url}/6229`, method: 'DELETE' })
      .flush(null, { status: 500, statusText: 'Failure' });
    await expect(removing).resolves.toMatchObject({ ok: false });
    expect(store.$pending()).toBe(false);
    expect(store.$rows()).toEqual([row]);

    const confirmed = store.remove(row.number);
    http.expectOne({ url: `${url}/6229`, method: 'DELETE' }).flush(null);
    await expect(confirmed).resolves.toMatchObject({ ok: true });
    expect(store.$rows()).toEqual([]);
  });
});
