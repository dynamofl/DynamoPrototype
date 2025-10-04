import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../components/ui/label';

const meta: Meta<typeof Label> = {
  title: 'UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <input
        id="email"
        type="email"
        placeholder="Enter your email"
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

export const WithCheckbox: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <input
        id="terms"
        type="checkbox"
        className="h-4 w-4 rounded border border-input"
      />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </div>
  ),
};

export const WithRadio: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <input
          id="option1"
          name="option"
          type="radio"
          className="h-4 w-4"
        />
        <Label htmlFor="option1">Option 1</Label>
      </div>
      <div className="flex items-center space-x-2">
        <input
          id="option2"
          name="option"
          type="radio"
          className="h-4 w-4"
        />
        <Label htmlFor="option2">Option 2</Label>
      </div>
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-field">
        Required Field <span className="text-red-500">*</span>
      </Label>
      <input
        id="required-field"
        type="text"
        placeholder="This field is required"
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="disabled-field" className="opacity-50">
        Disabled Field
      </Label>
      <input
        id="disabled-field"
        type="text"
        placeholder="This field is disabled"
        disabled
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <input
          id="name"
          type="text"
          placeholder="Enter your full name"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          id="newsletter"
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="newsletter">Subscribe to newsletter</Label>
      </div>
    </form>
  ),
};
