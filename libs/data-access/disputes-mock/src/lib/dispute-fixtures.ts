import type { Dispute } from '@gscf/disputes-data-access';

export const initialDisputes: readonly Dispute[] = [
  {
    id: 6228,
    buyer: 'Alpine Logistics AG',
    status: 'New',
    date: '2026-04-25T12:00:00.000Z',
    amount: 24_000_000,
    currency: 'USD',
    reason: 'Copy of Invoices',
  },
  {
    id: 6227,
    buyer: 'Northwind Traders',
    status: 'New',
    date: '2026-04-22T12:00:00.000Z',
    amount: 16_450_000,
    currency: 'USD',
    reason: 'Freight: Freight Charges Disputed',
  },
  {
    id: 6224,
    buyer: 'Helvetia Foods GmbH',
    status: 'Acknowledged',
    date: '2026-09-18T12:00:00.000Z',
    amount: 18_350_500,
    currency: 'USD',
    reason: "Tax: When either the invoice didn't include tax or tax is not applicable",
  },
];
