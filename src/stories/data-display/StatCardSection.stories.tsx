import type { Meta, StoryObj } from '@storybook/react';
import { StatCardSection } from '../../components/patterns/ui-patterns/stat-card-section';
import type { StatCardData } from '../../components/patterns/ui-patterns/stat-card-section';

const meta: Meta<typeof StatCardSection> = {
  title: 'Data Display/Card/Stat Card Section',
  component: StatCardSection,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleCards: StatCardData[] = [
  {
    title: 'Total Systems',
    value: 24,
    info: 'Total number of AI systems in your organization',
    variant: 'default'
  },
  {
    title: 'Active Systems',
    value: 18,
    info: 'Systems currently running and processing requests',
    variant: 'success'
  },
  {
    title: 'Pending Systems',
    value: 3,
    info: 'Systems waiting for configuration or approval',
    variant: 'warning'
  },
  {
    title: 'Failed Systems',
    value: 3,
    info: 'Systems that have encountered errors',
    variant: 'destructive'
  }
];

export const Default: Story = {
  args: {
    cards: sampleCards,
  },
};

export const TwoColumns: Story = {
  args: {
    cards: sampleCards.slice(0, 2),
    gridCols: { default: 1, md: 2 },
  },
};

export const ThreeColumns: Story = {
  args: {
    cards: sampleCards.slice(0, 3),
    gridCols: { default: 1, md: 2, lg: 3 },
  },
};

export const SingleColumn: Story = {
  args: {
    cards: sampleCards.slice(0, 1),
    gridCols: { default: 1 },
  },
};

export const LargeGap: Story = {
  args: {
    cards: sampleCards,
    gap: '4',
  },
};

export const CustomGrid: Story = {
  args: {
    cards: sampleCards,
    gridCols: { default: 2, md: 3, lg: 4, xl: 6 },
  },
};

export const WithLoading: Story = {
  args: {
    cards: [
      {
        title: 'Loading Systems',
        value: '...',
        info: 'Fetching system data',
        variant: 'default',
        loading: true
      },
      {
        title: 'Active Systems',
        value: 18,
        info: 'Systems currently running',
        variant: 'success'
      }
    ],
  },
};

export const InDashboard: Story = {
  render: () => (
    <div className="w-full max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">AI Systems Dashboard</h1>
        <p className="text-muted-foreground">Monitor and manage your AI systems</p>
      </div>
      
      <StatCardSection
        cards={sampleCards}
        gridCols={{ default: 1, md: 2, lg: 4 }}
        gap="2"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <p className="text-muted-foreground">System activity will appear here...</p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">System Health</h2>
          <p className="text-muted-foreground">Health metrics will appear here...</p>
        </div>
      </div>
    </div>
  ),
};

export const DifferentVariants: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-4xl">
      <div>
        <h3 className="text-lg font-medium mb-4">All Variants</h3>
        <StatCardSection
          cards={[
            {
              title: 'Default',
              value: 100,
              info: 'Default variant styling',
              variant: 'default'
            },
            {
              title: 'Success',
              value: 85,
              info: 'Success variant styling',
              variant: 'success'
            },
            {
              title: 'Warning',
              value: 15,
              info: 'Warning variant styling',
              variant: 'warning'
            },
            {
              title: 'Destructive',
              value: 5,
              info: 'Destructive variant styling',
              variant: 'destructive'
            }
          ]}
          gridCols={{ default: 1, md: 2, lg: 4 }}
        />
      </div>
    </div>
  ),
};
