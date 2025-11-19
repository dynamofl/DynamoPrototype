import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/ui/button';
import { Mail, Download, Plus, Trash2, ExternalLink } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Inputs/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Buttons give people a way to trigger an action. They're typically found in forms, dialog panels, and dialogs. Some buttons are specialized for particular tasks, such as navigation, repeated actions, or presenting menus.`,
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
    children: {
      control: { type: 'text' },
      description: 'The content to display inside the button',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Content',
      },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'subtle', 'new'],
      description: 'The visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'The size of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    asChild: {
      table: {
        disable: true,
      },
    },
    onClick: {
      action: 'clicked',
      description: 'Callback fired when the button is clicked',
      table: {
        category: 'Events',
      },
    },
  },
  args: {
    onClick: () => console.log('Button clicked'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Variants
 *
 * Different visual styles for buttons to convey hierarchy and intent.
 *
 * The default button uses the primary color and is used for the main call to action on a page.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    children: 'Button',
  },
};

/**
 * The secondary button is used for less important actions or when multiple buttons are present.
 */
export const Secondary: Story = {
  tags: ['!dev'],
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

/**
 * The destructive button is used for dangerous or destructive actions like delete or remove.
 */
export const Destructive: Story = {
  tags: ['!dev'],
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

/**
 * The outline button provides a subtle alternative with just a border.
 */
export const Outline: Story = {
  tags: ['!dev'],
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

/**
 * The ghost button is transparent and only shows background on hover. Great for toolbars and icon actions.
 */
export const Ghost: Story = {
  tags: ['!dev'],
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

/**
 * The link button looks like a hyperlink. Use for navigation or secondary actions.
 */
export const Link: Story = {
  tags: ['!dev'],
  args: {
    variant: 'link',
    children: 'Link',
  },
};

/**
 * The subtle button has a light background. Good for less prominent actions.
 */
export const Subtle: Story = {
  tags: ['!dev'],
  args: {
    variant: 'subtle',
    children: 'Subtle',
  },
};

/**
 * The new button is used for creating new items or adding content.
 */
export const New: Story = {
  tags: ['!dev'],
  args: {
    variant: 'new',
    children: '+ New Item',
  },
};

/**
 * Disabled buttons cannot be interacted with and are visually de-emphasized.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    disabled: true,
    children: 'Disabled',
  },
};


/**
 * Buttons in their loading state should disable interaction and show loading indicator.
 */
export const Loading: Story = {
  tags: ['!dev'],
  render: () => (
    <Button disabled>
      <svg
        className="mr-2 h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading...
    </Button>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons should show a loading state during asynchronous operations.',
      },
    },
  },
};

/**
 * ### Sizes
 *
 * Different button sizes for various contexts and layouts.
 *
 * Small buttons are compact and used in tight spaces like table rows or compact forms.
 */
export const Small: Story = {
  tags: ['!dev'],
  args: {
    size: 'sm',
    children: 'Small',
  },
};

/**
 * Large buttons are prominent and used for important primary actions.
 */
export const Large: Story = {
  tags: ['!dev'],
  args: {
    size: 'lg',
    children: 'Large',
  },
};

/**
 * Icon-only buttons are square and sized for a single icon. Always include aria-label for accessibility.
 */
export const IconOnly: Story = {
  tags: ['!dev'],
  args: {
    size: 'icon',
    children: <Plus className="h-4 w-4" />,
    'aria-label': 'Add item',
  },
};

/**
 * ### Examples
 *
 * Common button patterns and use cases.
 *
 * Buttons can include icons alongside text to provide visual context.
 */
export const WithIconBefore: Story = {
  tags: ['!dev'],
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" />
        Send Email
      </>
    ),
  },
};

/**
 * Icons can also appear after the text.
 */
export const WithIconAfter: Story = {
  tags: ['!dev'],
  args: {
    children: (
      <>
        Open Link
        <ExternalLink className="ml-2 h-4 w-4" />
      </>
    ),
  },
};



/**
 * Example showing all button variants side by side for comparison.
 */
export const AllVariants: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="subtle">Subtle</Button>
      <Button variant="new">+ New</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants displayed together.',
      },
    },
  },
};

/**
 * Example showing all button sizes for comparison.
 */
export const AllSizes: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button sizes displayed together.',
      },
    },
  },
};

/**
 * Common button patterns used in forms and dialogs.
 */
export const FormActions: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">Cancel</Button>
      <Button>Submit</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Common pattern for form submit and cancel actions.',
      },
    },
  },
};

/**
 * Button group with various actions including a destructive one.
 */
export const ActionGroup: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex gap-2">
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Create
      </Button>
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Group of related actions with different importance levels.',
      },
    },
  },
};


