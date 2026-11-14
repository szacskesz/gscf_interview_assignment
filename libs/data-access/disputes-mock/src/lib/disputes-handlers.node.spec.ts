import { setupServer } from 'msw/node';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createDisputesHandlers } from './disputes-handlers';
import { DisputesRepository } from './disputes-repository';

const url = 'http://mock.test/api/disputes';
const server = setupServer();
const draft = { buyer: ' Buyer ', reason: ' Reason ', amount: '1250.50', currency: 'EUR' };

function create(body: unknown) {
  return fetch(url, { method: 'POST', body: JSON.stringify(body) });
}

function remove(number: string | number) {
  return fetch(`${url}/${number}`, { method: 'DELETE' });
}

beforeAll(() => server.listen({ onUnhandledFrame: 'error' }));
beforeEach(() => {
  server.resetHandlers(...createDisputesHandlers(url, new DisputesRepository(() => '2026-11-14')));
});
afterAll(() => server.close());

describe('Mock disputes API', () => {
  it('starts each session with the three ordered assignment records', async () => {
    const response = await fetch(url);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      { number: 6228, buyer: 'Alpine Logistics AG', amountMinorUnits: 2400000000 },
      { number: 6227, buyer: 'Northwind Traders', amountMinorUnits: 1645000000 },
      { number: 6224, buyer: 'Helvetia Foods GmbH', status: 'Acknowledged' },
    ]);
  });

  it('rejects bad payloads before allocating a number and prepends a valid record', async () => {
    const malformed = await fetch(url, { method: 'POST', body: '{' });
    expect(malformed.status).toBe(400);

    const invalid = await create({ ...draft, buyer: ' ', amount: '1.230' });
    expect(invalid.status).toBe(422);
    await expect(invalid.json()).resolves.toMatchObject({
      fields: { buyer: 'Enter a buyer name.', amount: 'Enter an amount with up to 2 decimals.' },
    });

    const created = await create({ ...draft, number: 400, status: 'Acknowledged' });
    expect(created.status).toBe(201);
    const record: unknown = await created.json();
    expect(record).toEqual({
      buyer: 'Buyer',
      reason: 'Reason',
      amountMinorUnits: 125050,
      currency: 'EUR',
      number: 6229,
      status: 'New',
      disputeDate: '2026-11-14',
    });
    const response = await fetch(url);
    await expect(response.json()).resolves.toMatchObject([
      record,
      { number: 6228 },
      { number: 6227 },
      { number: 6224 },
    ]);
  });

  it('validates removal, preserves empty state, and never reuses a deleted number', async () => {
    expect((await remove('0')).status).toBe(400);
    expect((await remove(9999)).status).toBe(404);
    await create(draft);
    for (const number of [6229, 6228, 6227, 6224]) {
      const response = await remove(number);
      expect(response.status).toBe(204);
      await expect(response.text()).resolves.toBe('');
    }
    const empty = await fetch(url);
    await expect(empty.json()).resolves.toEqual([]);
    const recreated = await create(draft);
    await expect(recreated.json()).resolves.toMatchObject({ number: 6230 });
  });
});
