import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../components/ui/input';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel', 'url', 'search'],
    },
    placeholder: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    error: {
      control: { type: 'text' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'Hello World',
    placeholder: 'Enter text...',
  },
};

export const Email: Story = {
  args: {
    type: 'email',
    placeholder: 'Enter your email',
  },
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const Number: Story = {
  args: {
    type: 'number',
    placeholder: 'Enter a number',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithError: Story = {
  args: {
    placeholder: 'Enter text...',
    error: 'This field is required',
  },
};

export const WithCustomError: Story = {
  args: {
    placeholder: 'Enter text...',
    error: 'Please enter a valid email address',
    errorClassName: 'text-red-500 font-semibold',
  },
};

export const FileInput: Story = {
  args: {
    type: 'file',
  },
};

export const Search: Story = {
  args: {
    type: 'search',
    placeholder: 'Search...',
  },
};

export const AllTypes: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div>
        <label className="block text-sm font-medium mb-1">Text Input</label>
        <Input placeholder="Enter text..." />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Email Input</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Password Input</label>
        <Input type="password" placeholder="Enter your password" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Number Input</label>
        <Input type="number" placeholder="Enter a number" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Input with Error</label>
        <Input placeholder="Enter text..." error="This field is required" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Disabled Input</label>
        <Input placeholder="Disabled input" disabled />
      </div>
    </div>
  ),
};
