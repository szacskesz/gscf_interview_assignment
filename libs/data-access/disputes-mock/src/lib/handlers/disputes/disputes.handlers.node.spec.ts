import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDisputesHandlers } from './disputes.handlers';
import { DisputesRepository } from '../../repositories/disputes/disputes.repository';

const url = 'http://mock.test/api/disputes';
const server = setupServer();
const draft = { buyer: 'Buyer', reason: 'Reason', amount: 1250.5, currency: 'EUR' };

function create(body: unknown) {
  return fetch(url, { method: 'POST', body: JSON.stringify(body) });
}

function remove(id: string | number) {
  return fetch(`${url}/${id}`, { method: 'DELETE' });
}

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  server.resetHandlers(
    ...createDisputesHandlers(url, new DisputesRepository(() => '2026-11-14T12:00:00.000Z')),
  );
});
afterAll(() => server.close());

describe('Mock disputes API', () => {
  it('starts each session with the three ordered assignment records', async () => {
    const response = await fetch(url);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      { id: 6228, buyer: 'Alpine Logistics AG', amount: 24_000_000 },
      { id: 6227, buyer: 'Northwind Traders', amount: 16_450_000 },
      { id: 6224, buyer: 'Helvetia Foods GmbH', status: 'Acknowledged' },
    ]);
  });

  it('assigns generated fields and prepends the posted record with its decimal amount', async () => {
    const created = await create({ ...draft, id: 400, status: 'Acknowledged' });
    expect(created.status).toBe(201);
    const record: unknown = await created.json();
    expect(record).toEqual({
      buyer: 'Buyer',
      reason: 'Reason',
      amount: 1250.5,
      currency: 'EUR',
      id: 6229,
      status: 'New',
      date: '2026-11-14T12:00:00.000Z',
    });
    const response = await fetch(url);
    await expect(response.json()).resolves.toMatchObject([
      record,
      { id: 6228 },
      { id: 6227 },
      { id: 6224 },
    ]);
  });

  it('returns 404 for missing records, preserves empty state, and never reuses a deleted number', async () => {
    expect((await remove(9999)).status).toBe(404);
    await create(draft);
    for (const id of [6229, 6228, 6227, 6224]) {
      const response = await remove(id);
      expect(response.status).toBe(204);
      await expect(response.text()).resolves.toBe('');
    }
    const empty = await fetch(url);
    await expect(empty.json()).resolves.toEqual([]);
    const recreated = await create(draft);
    await expect(recreated.json()).resolves.toMatchObject({ id: 6230 });
  });
});
