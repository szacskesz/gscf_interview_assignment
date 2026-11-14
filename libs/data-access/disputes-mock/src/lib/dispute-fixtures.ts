import type { Dispute } from '@gscf/disputes-data-access';

export const initialDisputes: readonly Dispute[] = [
  {
    number: 6228,
    buyer: 'Alpine Logistics AG',
    status: 'New',
    disputeDate: '2026-04-25',
    amountMinorUnits: 2_400_000_000,
    currency: 'USD',
    reason: 'Copy of Invoices',
  },
  {
    number: 6227,
    buyer: 'Northwind Traders',
    status: 'New',
    disputeDate: '2026-04-22',
    amountMinorUnits: 1_645_000_000,
    currency: 'USD',
    reason: 'Freight: Freight Charges Disputed',
  },
  {
    number: 6224,
    buyer: 'Helvetia Foods GmbH',
    status: 'Acknowledged',
    disputeDate: '2026-09-18',
    amountMinorUnits: 1_835_050_000,
    currency: 'USD',
    reason: "Tax: When either the invoice didn't include tax or tax is not applicable",
  },
];
