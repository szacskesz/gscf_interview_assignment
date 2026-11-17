import { type Meta, type StoryObj } from '@storybook/angular';
import { expect } from 'storybook/test';
import { DialogFrame } from './dialog-frame.component';

const meta = {
  title: 'Common/Dialog frame',
  component: DialogFrame,
  tags: ['autodocs'],
  args: { busy: false },
  render: (args) => ({
    props: { ...args, dismissed: false },
    template: `<div class="max-w-md">
      <gscf-dialog-frame heading="Review dispute" headingId="story-heading" [busy]="busy" (closed)="dismissed = true">
        <p>Review the information before continuing. This description can wrap on a narrow screen.</p>
      </gscf-dialog-frame>
      @if (dismissed) { <p>Dismissal requested</p> }
    </div>`,
  }),
} satisfies Meta<{ busy: boolean }>;

export default meta;
type Story = StoryObj<{ busy: boolean }>;

export const Ready: Story = {
  async play({ canvas, userEvent }) {
    await expect(canvas.getByRole('heading', { name: 'Review dispute' })).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: 'Close' }));
    await expect(canvas.getByText('Dismissal requested')).toBeVisible();
  },
};

export const Busy: Story = {
  args: { busy: true },
  async play({ canvas }) {
    await expect(canvas.getByRole('button', { name: 'Close' })).toBeDisabled();
  },
};
