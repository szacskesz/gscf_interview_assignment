import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideZonelessChangeDetection } from '@angular/core';
import { expect } from 'storybook/test';
import { WorkspaceFixture } from './workspace-fixture';

interface FixtureArgs {
  label: string;
  count: number;
}

const meta = {
  title: 'Foundation/Workspace fixture',
  component: WorkspaceFixture,
  tags: ['autodocs'],
  decorators: [applicationConfig({ providers: [provideZonelessChangeDetection()] })],
  args: { label: 'Workspace check', count: 0 },
  render: (args) => ({
    props: { ...args, emitted: undefined as number | undefined },
    template: `
      <gscf-workspace-fixture
        [label]="label"
        [(count)]="count"
        (activated)="emitted = $event"
      />
      <p>Model value: {{ count }}</p>
      <p>Last activation: {{ emitted ?? 'none' }}</p>
    `,
  }),
} satisfies Meta<FixtureArgs>;

export default meta;

type Story = StoryObj<FixtureArgs>;

export const Default: Story = {
  async play({ canvas, userEvent }) {
    await userEvent.click(canvas.getByRole('button', { name: 'Workspace check: 0' }));

    await expect(canvas.getByRole('button', { name: 'Workspace check: 1' })).toHaveFocus();
    await expect(canvas.getByText('Model value: 1')).toBeVisible();
    await expect(canvas.getByText('Last activation: 1')).toBeVisible();
  },
};
export const PresetCount: Story = {
  args: { label: 'Catalog check', count: 3 },
};
