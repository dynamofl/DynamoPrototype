import type { Meta, StoryObj } from '@storybook/react';
import { Label } from '../../components/ui/label';

const meta: Meta<typeof Label> = {
  title: 'Inputs/Label',
  component: Label,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Labels provide accessible names for form controls. They improve usability by allowing users to click on the label to focus the associated input.`,
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
    children: {
      control: { type: 'text' },
      description: 'The label text content',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Content',
      },
    },
    htmlFor: {
      control: { type: 'text' },
      description: 'The id of the form control this label is associated with',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },

    // APPEARANCE
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        category: 'Appearance',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic
 *
 * Basic label examples.
 *
 * A simple label by itself.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    children: 'Label',
  },
};

/**
 * ### Examples
 *
 * Common label patterns with different input types.
 *
 * Label paired with a text input field.
 */
export const WithInput: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <input
        id="email"
        type="email"
        placeholder="Enter your email"
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

/**
 * Label paired with a checkbox.
 */
export const WithCheckbox: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex items-center space-x-2">
      <input
        id="terms"
        type="checkbox"
        className="h-4 w-4 rounded border border-input"
      />
      <Label htmlFor="terms">Accept Terms and Conditions</Label>
    </div>
  ),
};

/**
 * Label paired with radio buttons.
 */
export const WithRadio: Story = {
  tags: ['!dev'],
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

/**
 * Label with a required field indicator.
 */
export const Required: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="required-field">
        Required Field <span className="text-red-500">*</span>
      </Label>
      <input
        id="required-field"
        type="text"
        placeholder="This field is required"
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

/**
 * Label for a disabled input field.
 */
export const Disabled: Story = {
  tags: ['!dev'],
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
        className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
};

/**
 * Labels used in a complete form.
 */
export const FormExample: Story = {
  tags: ['!dev'],
  render: () => (
    <form className="space-y-4 w-80">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <input
          id="name"
          type="text"
          placeholder="Enter your full name"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="newsletter"
          type="checkbox"
          className="h-4 w-4 rounded border border-input"
        />
        <Label htmlFor="newsletter">Subscribe to Newsletter</Label>
      </div>
    </form>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Labels used throughout a form with various input types.',
      },
    },
  },
};
