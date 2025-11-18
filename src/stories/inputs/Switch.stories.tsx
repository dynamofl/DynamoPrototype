import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../../components/ui/switch';

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    checked: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledChecked: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Airplane mode
      </label>
    </div>
  ),
};

export const SwitchList: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem]  font-medium">Wi-Fi</label>
          <p className="text-[0.8125rem]  text-muted-foreground">Connect to available networks</p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem]  font-medium">Bluetooth</label>
          <p className="text-[0.8125rem]  text-muted-foreground">Connect to nearby devices</p>
        </div>
        <Switch />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem]  font-medium">Location Services</label>
          <p className="text-[0.8125rem]  text-muted-foreground">Allow apps to access your location</p>
        </div>
        <Switch defaultChecked />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem]  font-medium">Notifications</label>
          <p className="text-[0.8125rem]  text-muted-foreground">Receive push notifications</p>
        </div>
        <Switch disabled />
      </div>
    </div>
  ),
};

export const SettingsExample: Story = {
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Profile Visibility</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Make your profile visible to other users</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Data Collection</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Allow us to collect usage data</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Marketing Emails</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Receive promotional content</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">App Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Auto-save</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Automatically save your work</p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Dark Mode</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Use dark theme</p>
            </div>
            <Switch />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem]  font-medium">Beta Features</label>
              <p className="text-[0.8125rem]  text-muted-foreground">Enable experimental features</p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </div>
    </div>
  ),
};
