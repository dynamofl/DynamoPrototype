import type { Meta, StoryObj } from '@storybook/react';
import { Textarea } from '../../components/ui/textarea';

const meta: Meta<typeof Textarea> = {
  title: 'Inputs/Textarea',
  component: Textarea,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Textarea allows users to enter and edit multi-line text. They're used in forms where users need to provide longer responses or descriptions.`,
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
      description: 'Placeholder text shown when textarea is empty',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'The default value of the textarea',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the textarea',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },

    // APPEARANCE
    rows: {
      control: { type: 'number', min: 1, max: 20 },
      description: 'The number of visible text rows',
      table: {
        type: { summary: 'number' },
        category: 'Appearance',
      },
    },

    // STATE
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the textarea is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },

    // EVENTS
    onChange: {
      action: 'changed',
      description: 'Callback fired when the textarea value changes',
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
 * Basic textarea examples.
 *
 * The default textarea for multi-line text entry.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Type your message here...',
  },
};

/**
 * Textarea with pre-filled content.
 */
export const WithValue: Story = {
  tags: ['!dev'],
  args: {
    defaultValue: 'This is a textarea with some default content.',
    placeholder: 'Type your message here...',
  },
};

/**
 * ### Sizes
 *
 * Different textarea sizes based on row count.
 *
 * Small textarea with fewer rows for brief input.
 */
export const Small: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Small Textarea',
    rows: 2,
  },
};

/**
 * Large textarea with more rows for longer content.
 */
export const Large: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'Large Textarea for Longer Content',
    rows: 8,
  },
};

/**
 * ### States
 *
 * Different states a textarea can be in.
 *
 * Disabled textarea that cannot be interacted with.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    placeholder: 'This Textarea is Disabled',
    disabled: true,
  },
};

/**
 * ### Examples
 *
 * Common textarea patterns and use cases.
 *
 * Textarea with an associated label.
 */
export const WithLabel: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-80">
      <label htmlFor="message" className="text-[0.8125rem] font-medium">
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

/**
 * Textareas used in a form with other input fields.
 */
export const FormExample: Story = {
  tags: ['!dev'],
  render: () => (
    <form className="space-y-4 w-96">
      <div className="space-y-2">
        <label htmlFor="name" className="text-[0.8125rem] font-medium">
          Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="Enter your name"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-[0.8125rem] font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem] file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-[0.8125rem] font-medium">
          Message
        </label>
        <Textarea
          id="message"
          placeholder="Enter your message here..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="notes" className="text-[0.8125rem] font-medium">
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
  parameters: {
    docs: {
      description: {
        story: 'Textareas combined with other form inputs.',
      },
    },
  },
};

/**
 * Different textarea sizes for comparison.
 */
export const DifferentSizes: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Small (2 Rows)</label>
        <Textarea placeholder="Small textarea" rows={2} />
      </div>

      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Medium (4 Rows)</label>
        <Textarea placeholder="Medium textarea" rows={4} />
      </div>

      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Large (8 Rows)</label>
        <Textarea placeholder="Large textarea" rows={8} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available textarea sizes displayed together.',
      },
    },
  },
};
