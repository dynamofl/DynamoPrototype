import type { Meta, StoryObj } from '@storybook/react';
import { Switch } from '../../components/ui/switch';

const meta: Meta<typeof Switch> = {
  title: 'Inputs/Switch',
  component: Switch,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Switches provide a way to toggle between two states, typically on and off. They're commonly used in settings and preferences where changes take effect immediately.`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // CONTENT
    id: {
      control: { type: 'text' },
      description: 'The id of the switch element',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },

    // STATE
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the switch is checked',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    defaultChecked: {
      control: { type: 'boolean' },
      description: 'The default checked state (uncontrolled)',
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },

    // EVENTS
    onCheckedChange: {
      action: 'checked changed',
      description: 'Callback fired when the checked state changes',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### States
 *
 * Different states a switch can be in.
 *
 * The default unchecked switch.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {},
};

/**
 * A checked switch in the on state.
 */
export const Checked: Story = {
  tags: ['!dev'],
  args: {
    checked: true,
  },
};

/**
 * A disabled switch that cannot be interacted with.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    disabled: true,
  },
};

/**
 * A disabled switch in the checked state.
 */
export const DisabledChecked: Story = {
  tags: ['!dev'],
  args: {
    checked: true,
    disabled: true,
  },
};

/**
 * ### Examples
 *
 * Common switch patterns and use cases.
 *
 * Switch with an associated label.
 */
export const WithLabel: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <label
        htmlFor="airplane-mode"
        className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Airplane Mode
      </label>
    </div>
  ),
};

/**
 * Multiple switches in a settings list with labels and descriptions.
 */
export const SwitchList: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem] font-medium">Wi-Fi</label>
          <p className="text-[0.8125rem] text-muted-foreground">Connect to Available Networks</p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem] font-medium">Bluetooth</label>
          <p className="text-[0.8125rem] text-muted-foreground">Connect to Nearby Devices</p>
        </div>
        <Switch />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem] font-medium">Location Services</label>
          <p className="text-[0.8125rem] text-muted-foreground">Allow Apps to Access Your Location</p>
        </div>
        <Switch defaultChecked />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <label className="text-[0.8125rem] font-medium">Notifications</label>
          <p className="text-[0.8125rem] text-muted-foreground">Receive Push Notifications</p>
        </div>
        <Switch disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common pattern for settings with multiple toggleable options.',
      },
    },
  },
};

/**
 * Comprehensive settings example with grouped switches.
 */
export const SettingsExample: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem] font-medium">Profile Visibility</label>
              <p className="text-[0.8125rem] text-muted-foreground">Make Your Profile Visible to Other Users</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem] font-medium">Data Collection</label>
              <p className="text-[0.8125rem] text-muted-foreground">Allow Us to Collect Usage Data</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem] font-medium">Marketing Emails</label>
              <p className="text-[0.8125rem] text-muted-foreground">Receive Promotional Content</p>
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
              <label className="text-[0.8125rem] font-medium">Auto-Save</label>
              <p className="text-[0.8125rem] text-muted-foreground">Automatically Save Your Work</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem] font-medium">Dark Mode</label>
              <p className="text-[0.8125rem] text-muted-foreground">Use Dark Theme</p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <label className="text-[0.8125rem] font-medium">Beta Features</label>
              <p className="text-[0.8125rem] text-muted-foreground">Enable Experimental Features</p>
            </div>
            <Switch disabled />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full settings page example with grouped toggles.',
      },
    },
  },
};
