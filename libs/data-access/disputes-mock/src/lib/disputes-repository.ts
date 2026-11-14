import type { CreateDisputeRequest, Dispute } from '@gscf/disputes-data-access';
import { initialDisputes } from './dispute-fixtures';

type ValidDisputeDraft = Omit<CreateDisputeRequest, 'amount'> & { amountMinorUnits: number };

export class DisputesRepository {
  private rows: readonly Dispute[] = initialDisputes.map((row) => ({ ...row }));
  private nextNumber = Math.max(...initialDisputes.map((row) => row.number)) + 1;

  constructor(private readonly today: () => string) {}

  list(): readonly Dispute[] {
    return this.rows;
  }

  create(draft: ValidDisputeDraft): Dispute {
    const dispute: Dispute = {
      ...draft,
      number: this.nextNumber,
      status: 'New',
      disputeDate: this.today(),
    };
    this.nextNumber += 1;
    this.rows = [dispute, ...this.rows];
    return dispute;
  }

  remove(number: number): boolean {
    const remaining = this.rows.filter((dispute) => dispute.number !== number);
    if (remaining.length === this.rows.length) return false;
    this.rows = remaining;
    return true;
  }
}
