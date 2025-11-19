import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'Inputs/Radio Group',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Radio groups allow users to select a single option from a set of mutually exclusive options. Once a selection is made, it can be changed but not deselected.`,
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
    // STATE
    defaultValue: {
      control: { type: 'text' },
      description: 'The default selected value (uncontrolled)',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the radio group',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the radio group is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },

    // EVENTS
    onValueChange: {
      action: 'value changed',
      description: 'Callback fired when the selected value changes',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic
 *
 * Basic radio group examples.
 *
 * The default radio group with simple options.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 2
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

/**
 * Radio group with descriptions for each option.
 */
export const WithDescriptions: Story = {
  tags: ['!dev'],
  render: () => (
    <RadioGroup defaultValue="comfortable" className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r1" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Default
          </label>
          <p className="text-xs text-muted-foreground">
            The default option for most users.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r2" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Comfortable
          </label>
          <p className="text-xs text-muted-foreground">
            More spacing for a comfortable reading experience.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r3" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Compact
          </label>
          <p className="text-xs text-muted-foreground">
            Less spacing for a more compact layout.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Radio options with descriptive text to provide additional context.',
      },
    },
  },
};

/**
 * ### States
 *
 * Different states for radio group items.
 *
 * Radio group with a disabled option.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  render: () => (
    <RadioGroup defaultValue="option1" className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="d1" />
        <label htmlFor="d1" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="d2" disabled />
        <label htmlFor="d2" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 2 (Disabled)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="d3" />
        <label htmlFor="d3" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

/**
 * ### Examples
 *
 * Common radio group patterns and use cases.
 *
 * Payment method selector with icons.
 */
export const PaymentMethod: Story = {
  tags: ['!dev'],
  render: () => (
    <RadioGroup defaultValue="card" className="space-y-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="card" id="card" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">💳</span>
          </div>
          <div>
            <label htmlFor="card" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Credit Card
            </label>
            <p className="text-xs text-muted-foreground">Pay with Your Credit Card</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paypal" id="paypal" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-yellow-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <div>
            <label htmlFor="paypal" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              PayPal
            </label>
            <p className="text-xs text-muted-foreground">Pay with Your PayPal Account</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <RadioGroupItem value="apple" id="apple" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">🍎</span>
          </div>
          <div>
            <label htmlFor="apple" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Apple Pay
            </label>
            <p className="text-xs text-muted-foreground">Pay with Apple Pay</p>
          </div>
        </div>
      </div>
    </RadioGroup>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Payment method selection with visual icons and descriptions.',
      },
    },
  },
};

/**
 * Settings page with multiple radio groups.
 */
export const SettingsExample: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <RadioGroup defaultValue="system" className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <label htmlFor="light" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Light
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <label htmlFor="dark" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Dark
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <label htmlFor="system" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              System
            </label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4">Language</h3>
        <RadioGroup defaultValue="en" className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="en" />
            <label htmlFor="en" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              English
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="es" id="es" />
            <label htmlFor="es" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Español
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fr" id="fr" />
            <label htmlFor="fr" className="text-[0.8125rem] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Français
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple radio groups in a settings interface.',
      },
    },
  },
};
