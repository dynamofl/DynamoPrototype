import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from '../../components/patterns/ui-patterns/theme-toggle';

const meta: Meta<typeof ThemeToggle> = {
  title: 'Navigation/Theme Toggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ThemeToggle />,
};

export const InHeader: Story = {
  render: () => (
    <div className="flex items-center justify-between p-4 border rounded-lg w-80">
      <div className="flex items-center space-x-4">
        <h1 className="text-lg font-semibold">My App</h1>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-[0.8125rem]  text-muted-foreground">Theme:</span>
        <ThemeToggle />
      </div>
    </div>
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <span className="text-[0.8125rem]  font-medium">Appearance</span>
      <ThemeToggle />
    </div>
  ),
};

export const InSettings: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-[0.8125rem]  text-muted-foreground">Customize your experience</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.8125rem]  font-medium">Theme</p>
            <p className="text-xs text-muted-foreground">Choose your preferred theme</p>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.8125rem]  font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">Manage notification preferences</p>
          </div>
          <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs">🔔</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
