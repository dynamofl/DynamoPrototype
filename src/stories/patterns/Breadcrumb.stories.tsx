import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { Breadcrumb } from '../../components/patterns/breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'Patterns/Breadcrumb',
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  decorators: [
    (Story, { args }) => (
      <MemoryRouter initialEntries={[args.initialPath || '/ai-systems']}>
        <Story />
      </MemoryRouter>
    ),
  ],
  argTypes: {
    initialPath: {
      control: { type: 'text' },
      description: 'Initial path for the router',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    initialPath: '/ai-systems',
  },
};

export const SingleLevel: Story = {
  args: {
    initialPath: '/ai-systems',
  },
};

export const TwoLevels: Story = {
  args: {
    initialPath: '/ai-systems/create',
  },
};

export const ThreeLevels: Story = {
  args: {
    initialPath: '/ai-systems/create/configuration',
  },
};

export const DeepPath: Story = {
  args: {
    initialPath: '/ai-systems/create/configuration/advanced-settings',
  },
};

export const WithHyphens: Story = {
  args: {
    initialPath: '/ai-providers/open-ai-settings',
  },
};

export const InPage: Story = {
  render: () => (
    <MemoryRouter initialEntries={['/ai-systems/create/configuration']}>
      <div className="w-full max-w-4xl space-y-4">
        <div className="border-b pb-4">
          <Breadcrumb />
        </div>
        
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Configuration</h1>
          <p className="text-muted-foreground">
            Configure your AI system settings and parameters.
          </p>
        </div>
        
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">System Configuration</h2>
          <p className="text-muted-foreground">Configuration form would go here...</p>
        </div>
      </div>
    </MemoryRouter>
  ),
};

export const DifferentPaths: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="text-sm font-medium mb-2">AI Systems</h3>
        <MemoryRouter initialEntries={['/ai-systems']}>
          <Breadcrumb />
        </MemoryRouter>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Create System</h3>
        <MemoryRouter initialEntries={['/ai-systems/create']}>
          <Breadcrumb />
        </MemoryRouter>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Configuration</h3>
        <MemoryRouter initialEntries={['/ai-systems/create/configuration']}>
          <Breadcrumb />
        </MemoryRouter>
      </div>
      
      <div>
        <h3 className="text-sm font-medium mb-2">Settings</h3>
        <MemoryRouter initialEntries={['/settings/team-members']}>
          <Breadcrumb />
        </MemoryRouter>
      </div>
    </div>
  ),
};
