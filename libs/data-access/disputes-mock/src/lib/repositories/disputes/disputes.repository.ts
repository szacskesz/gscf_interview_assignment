import type { Dispute } from '@gscf/disputes-data-access';
import { initialDisputes } from '../../fixtures/disputes/dispute.fixtures';

export class DisputesRepository {
  private rows: readonly Dispute[] = initialDisputes.map((row) => ({ ...row }));
  private nextId = Math.max(...initialDisputes.map((row) => row.id)) + 1;

  constructor(private readonly currentTimestamp: () => string) {}

  list(): readonly Dispute[] {
    return this.rows;
  }

  create({
    buyer,
    reason,
    amount,
    currency,
  }: Pick<Dispute, 'buyer' | 'reason' | 'amount' | 'currency'>): Dispute {
    const dispute: Dispute = {
      buyer,
      reason,
      amount,
      currency,
      id: this.nextId,
      status: 'New',
      date: this.currentTimestamp(),
    };
    this.nextId += 1;
    this.rows = [dispute, ...this.rows];
    return dispute;
  }

  remove(id: number): boolean {
    const remaining = this.rows.filter((dispute) => dispute.id !== id);
    if (remaining.length === this.rows.length) return false;
    this.rows = remaining;
    return true;
  }
}
