import type { Meta, StoryObj } from '@storybook/react';
import { HeaderStats } from '../../components/patterns/ui-patterns/header-stats';

const meta: Meta<typeof HeaderStats> = {
  title: 'Data Display/Header Stats',
  component: HeaderStats,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    totalSystems: {
      control: { type: 'number', min: 0, max: 1000 },
    },
    evaluatedSystems: {
      control: { type: 'number', min: 0, max: 1000 },
    },
    systemsWithGuardrails: {
      control: { type: 'number', min: 0, max: 1000 },
    },
    inactiveSystems: {
      control: { type: 'number', min: 0, max: 1000 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalSystems: 24,
    evaluatedSystems: 18,
    systemsWithGuardrails: 15,
    inactiveSystems: 3,
  },
};

export const AllActive: Story = {
  args: {
    totalSystems: 50,
    evaluatedSystems: 50,
    systemsWithGuardrails: 50,
    inactiveSystems: 0,
  },
};

export const ManyInactive: Story = {
  args: {
    totalSystems: 100,
    evaluatedSystems: 60,
    systemsWithGuardrails: 40,
    inactiveSystems: 25,
  },
};

export const NewProject: Story = {
  args: {
    totalSystems: 5,
    evaluatedSystems: 0,
    systemsWithGuardrails: 0,
    inactiveSystems: 0,
  },
};

export const LargeNumbers: Story = {
  args: {
    totalSystems: 1250,
    evaluatedSystems: 980,
    systemsWithGuardrails: 750,
    inactiveSystems: 45,
  },
};

export const InPage: Story = {
  render: () => (
    <div className="w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">AI Systems Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your AI systems</p>
      </div>
      
      <HeaderStats
        totalSystems={24}
        evaluatedSystems={18}
        systemsWithGuardrails={15}
        inactiveSystems={3}
      />
      
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
        <p className="text-muted-foreground">Your AI systems activity will appear here...</p>
      </div>
    </div>
  ),
};
