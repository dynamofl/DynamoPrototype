import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../components/ui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Inputs/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Checkboxes give people a way to select one or more items from a group, or to switch between two mutually exclusive options (checked or unchecked).`,
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
      description: 'The id of the checkbox element',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },

    // STATE
    checked: {
      control: { type: 'boolean' },
      description: 'Whether the checkbox is checked',
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
      description: 'Whether the checkbox is disabled',
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
 * Different states a checkbox can be in.
 *
 * The default unchecked checkbox.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {},
};

/**
 * A checked checkbox.
 */
export const Checked: Story = {
  tags: ['!dev'],
  args: {
    checked: true,
  },
};

/**
 * A disabled checkbox that cannot be interacted with.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    disabled: true,
  },
};

/**
 * A disabled checkbox in the checked state.
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
 * Common checkbox patterns and use cases.
 *
 * Checkbox with an associated label.
 */
export const WithLabel: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex items-center space-x-2">
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept Terms and Conditions
      </label>
    </div>
  ),
};

/**
 * Multiple checkboxes in a list.
 */
export const CheckboxList: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <label
          htmlFor="option1"
          className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <label
          htmlFor="option2"
          className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 2 (Checked by Default)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" disabled />
        <label
          htmlFor="option3"
          className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 3 (Disabled)
        </label>
      </div>
    </div>
  ),
};

/**
 * Checkboxes used in a form for user preferences.
 */
export const FormExample: Story = {
  tags: ['!dev'],
  render: () => (
    <form className="space-y-4 w-80">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Preferences</h3>

        <div className="flex items-center space-x-2">
          <Checkbox id="notifications" />
          <label
            htmlFor="notifications"
            className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email Notifications
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="marketing" defaultChecked />
          <label
            htmlFor="marketing"
            className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Marketing Emails
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="analytics" />
          <label
            htmlFor="analytics"
            className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Analytics Tracking
          </label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox id="cookies" disabled />
          <label
            htmlFor="cookies"
            className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Cookie Preferences (Disabled)
          </label>
        </div>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example of checkboxes used in a settings form.',
      },
    },
  },
};
