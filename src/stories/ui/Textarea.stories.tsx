import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    placeholder: {
      control: { type: 'text' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    rows: {
      control: { type: 'number', min: 1, max: 20 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your message here...',
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: 'This is a textarea with some default content.',
    placeholder: 'Type your message here...',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'This textarea is disabled',
    disabled: true,
  },
};

export const Small: Story = {
  args: {
    placeholder: 'Small textarea',
    rows: 2,
  },
};

export const Large: Story = {
  args: {
    placeholder: 'Large textarea for longer content',
    rows: 8,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <label htmlFor="message" className="text-sm font-medium">
        Message
      </label>
      <Textarea
        id="message"
        placeholder="Type your message here..."
        rows={4}
      />
    </div>
  ),
};

export const FormExample: Story = {
  render: () => (
    <form className="space-y-4 w-96">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Enter your message here..."
          rows={5}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="notes" className="text-sm font-medium">
          Additional Notes (Optional)
        </label>
        <Textarea
          id="notes"
          placeholder="Any additional information..."
          rows={3}
        />
      </div>
    </form>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <div className="space-y-2">
        <label className="text-sm font-medium">Small (2 rows)</label>
        <Textarea placeholder="Small textarea" rows={2} />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Medium (4 rows)</label>
        <Textarea placeholder="Medium textarea" rows={4} />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Large (8 rows)</label>
        <Textarea placeholder="Large textarea" rows={8} />
      </div>
    </div>
  ),
};
