import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { API_BASE_PATH } from '@gscf/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DisputesStore } from './disputes-store.service';

const url = '/api/disputes';
const draft = {
  buyer: 'Buyer',
  reason: 'Reason',
  amount: 100.25,
  currency: 'EUR',
} as const;
const row = {
  id: 6229,
  buyer: 'Buyer',
  reason: 'Reason',
  amount: 100.25,
  currency: 'EUR',
  status: 'New',
  date: '2026-11-14T12:00:00.000Z',
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
    const rejected = vi.fn();
    store.create(draft).subscribe(rejected);
    expect(rejected).toHaveBeenCalledWith({
      ok: false,
      error: { message: 'Disputes are currently busy.' },
    });
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

    const created = vi.fn();
    store.create(draft).subscribe(created);
    const request = http.expectOne({ url, method: 'POST' });
    expect(request.request.body).toEqual(draft);
    expect(request.request.timeout).toBe(10_000);
    expect(store.$pending()).toBe(true);
    expect(store.$rows()).toEqual([]);
    const rejected = vi.fn();
    store.create(draft).subscribe(rejected);
    expect(rejected).toHaveBeenCalledWith({
      ok: false,
      error: { message: 'Disputes are currently busy.' },
    });
    expect(store.$pending()).toBe(true);
    store.retry();
    http.expectNone({ url, method: 'GET' });
    request.flush(row);
    expect(created).toHaveBeenCalledExactlyOnceWith({ ok: true, value: row });
    expect(store.$rows()).toEqual([row]);
    expect(store.$pending()).toBe(false);

    const removed = vi.fn();
    store.remove(row.id).subscribe(removed);
    http
      .expectOne({ url: `${url}/6229`, method: 'DELETE' })
      .flush(null, { status: 500, statusText: 'Failure' });
    expect(removed).toHaveBeenCalledWith({
      ok: false,
      error: { message: 'Dispute could not be removed. Try again.' },
    });
    expect(store.$pending()).toBe(false);
    expect(store.$rows()).toEqual([row]);

    const confirmed = vi.fn();
    store.remove(row.id).subscribe(confirmed);
    http.expectOne({ url: `${url}/6229`, method: 'DELETE' }).flush(null);
    expect(confirmed).toHaveBeenCalledExactlyOnceWith({ ok: true, value: undefined });
    expect(store.$rows()).toEqual([]);
  });

  it('starts writes and checks readiness only when subscribed', async () => {
    const creating$ = store.create(draft);
    expect(store.$pending()).toBe(false);
    http.expectNone({ url, method: 'POST' });

    http.expectOne({ url, method: 'GET' }).flush([]);
    await stable();
    const created = vi.fn();
    creating$.subscribe(created);
    expect(store.$pending()).toBe(true);
    http.expectOne({ url, method: 'POST' }).flush(row);
    expect(created).toHaveBeenCalledExactlyOnceWith({ ok: true, value: row });
  });

  it('checks competing subscriptions when they start and keeps the active lock', async () => {
    http.expectOne({ url, method: 'GET' }).flush([]);
    await stable();
    const creating$ = store.create(draft);
    const removing$ = store.remove(row.id);
    const subscription = creating$.subscribe();
    const request = http.expectOne({ url, method: 'POST' });
    const rejected = vi.fn();
    removing$.subscribe(rejected);

    http.expectNone({ url: `${url}/6229`, method: 'DELETE' });
    expect(rejected).toHaveBeenCalledWith({
      ok: false,
      error: { message: 'Disputes are currently busy.' },
    });
    expect(store.$pending()).toBe(true);

    subscription.unsubscribe();
    expect(request.cancelled).toBe(true);
    expect(store.$pending()).toBe(false);
    expect(store.$rows()).toEqual([]);
  });

  it('keeps rows after an unsubscribed removal and accepts the next write', async () => {
    http.expectOne({ url, method: 'GET' }).flush([row]);
    await stable();
    const removed = vi.fn();
    const subscription = store.remove(row.id).subscribe(removed);
    const request = http.expectOne({ url: `${url}/6229`, method: 'DELETE' });
    expect(request.request.timeout).toBe(10_000);
    subscription.unsubscribe();

    expect(request.cancelled).toBe(true);
    expect(removed).not.toHaveBeenCalled();
    expect(store.$pending()).toBe(false);
    expect(store.$rows()).toEqual([row]);

    store.remove(row.id).subscribe(removed);
    http.expectOne({ url: `${url}/6229`, method: 'DELETE' }).flush(null);
    expect(removed).toHaveBeenCalledExactlyOnceWith({ ok: true, value: undefined });
    expect(store.$rows()).toEqual([]);
  });

  it('retains rows and releases the pending lock after a create failure', async () => {
    http.expectOne({ url, method: 'GET' }).flush([row]);
    await stable();
    const created = vi.fn();
    store.create(draft).subscribe(created);
    http.expectOne({ url, method: 'POST' }).flush(null, {
      status: 503,
      statusText: 'Unavailable',
    });

    expect(created).toHaveBeenCalledWith({
      ok: false,
      error: { message: 'Dispute could not be created. Try again.' },
    });
    expect(store.$pending()).toBe(false);
    expect(store.$rows()).toEqual([row]);
  });
});
