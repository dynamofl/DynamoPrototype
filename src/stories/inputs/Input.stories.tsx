import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/input';

const meta: Meta<typeof Input> = {
  title: 'Inputs/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Text inputs give people a way to enter and edit text. They're used in forms, dialogs, tables, and other surfaces where text input is required.`,
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
    placeholder: {
      control: { type: 'text' },
      description: 'Placeholder text shown when input is empty',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'The default value of the input',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the input',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },

    // APPEARANCE
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search', 'file'],
      description: 'The type of input field',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'text' },
        category: 'Appearance',
      },
    },

    // STATE
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    error: {
      control: { type: 'text' },
      description: 'Error message to display below the input',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    errorClassName: {
      table: {
        disable: true,
      },
    },

    // EVENTS
    onChange: {
      action: 'changed',
      description: 'Callback fired when the input value changes',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Types
 *
 * Different input types for various data entry needs.
 *
 * The default text input for general text entry.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Enter text...',
  },
};

/**
 * Input with a pre-filled value.
 */
export const WithValue: Story = {
  tags: ['!dev'],
  args: {
    defaultValue: 'Hello World',
    placeholder: 'Enter text...',
  },
};

/**
 * Email input with validation support.
 */
export const Email: Story = {
  tags: ['!dev'],
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

/**
 * Password input that masks entered characters.
 */
export const Password: Story = {
  tags: ['!dev'],
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

/**
 * Number input for numeric values.
 */
export const Number: Story = {
  tags: ['!dev'],
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
};

/**
 * Search input for search fields.
 */
export const Search: Story = {
  tags: ['!dev'],
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

/**
 * File input for file uploads.
 */
export const FileInput: Story = {
  tags: ['!dev'],
  args: {
    type: 'file',
  },
};

/**
 * ### States
 *
 * Different states an input can be in.
 *
 * Disabled inputs cannot be interacted with and are visually de-emphasized.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

/**
 * Input with an error message displayed below.
 */
export const WithError: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Enter text...',
    error: 'This field is required',
  },
};

/**
 * Input with a custom error message.
 */
export const WithCustomError: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Enter text...',
    error: 'Please enter a valid email address',
    errorClassName: 'text-red-500 font-semibold',
  },
};

/**
 * ### Examples
 *
 * Common input patterns and use cases.
 *
 * All input types displayed with labels for comparison.
 */
export const AllTypes: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Text Input</label>
        <Input placeholder="Enter text..." />
      </div>
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Email Input</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Password Input</label>
        <Input type="password" placeholder="Enter your password" />
      </div>
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Number Input</label>
        <Input type="number" placeholder="Enter a number" />
      </div>
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Input with Error</label>
        <Input placeholder="Enter text..." error="This field is required" />
      </div>
      <div>
        <label className="block text-[0.8125rem] font-medium mb-1">Disabled Input</label>
        <Input placeholder="Disabled input" disabled />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available input types with proper labeling.',
      },
    },
  },
};
