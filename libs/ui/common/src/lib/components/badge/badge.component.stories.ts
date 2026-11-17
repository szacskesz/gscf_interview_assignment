import { type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { Badge } from './badge.component';

const meta = {
  title: 'Common/Badge',
  component: Badge,
  tags: ['autodocs'],
  render: () => ({
    template: `<div class="flex flex-wrap gap-2">
      <gscf-badge tone="blue">New</gscf-badge>
      <gscf-badge tone="yellow">Acknowledged</gscf-badge>
    </div>`,
  }),
} satisfies Meta<Badge>;

export default meta;
export const Treatments: StoryObj<Badge> = {
  async play({ canvas }) {
    await expect(canvas.getByText('New')).toBeVisible();
    await expect(canvas.getByText('Acknowledged')).toBeVisible();
  },
};
