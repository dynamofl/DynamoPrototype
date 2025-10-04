import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '../../components/ui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Checkbox',
  component: Checkbox,
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
      <Checkbox id="terms" />
      <label
        htmlFor="terms"
        className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </label>
    </div>
  ),
};

export const CheckboxList: Story = {
  render: () => (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <Checkbox id="option1" />
        <label
          htmlFor="option1"
          className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option2" defaultChecked />
        <label
          htmlFor="option2"
          className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 2 (checked by default)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox id="option3" disabled />
        <label
          htmlFor="option3"
          className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Option 3 (disabled)
        </label>
      </div>
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Preferences</h3>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="notifications" />
          <label
            htmlFor="notifications"
            className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Email notifications
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="marketing" defaultChecked />
          <label
            htmlFor="marketing"
            className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Marketing emails
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="analytics" />
          <label
            htmlFor="analytics"
            className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Analytics tracking
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox id="cookies" disabled />
          <label
            htmlFor="cookies"
            className="text-[0.8125rem]  font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Cookie preferences (disabled)
          </label>
        </div>
      </div>
    </form>
  ),
};
