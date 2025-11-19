import type { Meta, StoryObj } from '@storybook/react';
import { ButtonCell } from '../../components/patterns/ui-patterns/cell-types/button-cell';
import { Edit, Trash2, Eye, Copy, MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof ButtonCell> = {
  title: 'Inputs/Cell Types/Button Cell',
  component: ButtonCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Button cells provide action buttons within table cells, typically used for row-level operations like edit, delete, or view. They support multiple actions through a dropdown menu.`,
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
    value: {
      control: { type: 'text' },
      description: 'The cell value (typically null for button cells)',
      table: {
        type: { summary: 'any' },
        category: 'Content',
      },
    },
    row: {
      control: { type: 'object' },
      description: 'The row data object',
      table: {
        type: { summary: 'any' },
        category: 'Content',
      },
    },
    column: {
      control: { type: 'object' },
      description: 'The column configuration object',
      table: {
        type: { summary: 'ColumnDef' },
        category: 'Content',
      },
    },
    actions: {
      control: { type: 'object' },
      description: 'Array of available actions with labels, icons, and variants',
      table: {
        type: { summary: 'Action[]' },
        category: 'Content',
      },
    },
    buttonIcon: {
      control: { type: 'text' },
      description: 'Custom icon for the trigger button',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Appearance',
      },
    },
    buttonVariant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'ghost' },
        category: 'Appearance',
      },
    },
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
      description: 'The display mode of the cell',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'view' },
        category: 'State',
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
    onAction: {
      action: 'action-triggered',
      description: 'Callback fired when an action is triggered',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock row and column data
const mockRow = { id: 1, name: 'Test System', status: 'active' };
const mockColumn = {
  key: 'actions',
  title: 'Actions'
};

/**
 * ### Basic
 *
 * Basic button cell configurations with different action counts.
 *
 * Single action button displayed inline without a dropdown.
 */
export const SingleAction: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

/**
 * Multiple actions displayed in a dropdown menu.
 */
export const MultipleActions: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'view',
        label: 'View',
        icon: <Eye className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'copy',
        label: 'Copy',
        icon: <Copy className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

/**
 * ### States
 *
 * Different states and configurations for button cells.
 *
 * Destructive action styled in red to indicate danger.
 */
export const DestructiveAction: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

/**
 * Button cell in disabled state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    disabled: true,
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
  },
};

/**
 * Custom icon for the dropdown trigger button.
 */
export const CustomIcon: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    buttonIcon: <MoreHorizontal className="h-4 w-4" />,
    actions: [
      {
        key: 'view',
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'edit',
        label: 'Edit System',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

/**
 * ### Examples
 *
 * Real-world usage examples showing button cells in context.
 *
 * Button cells integrated into a data table with various states.
 */
export const InTable: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-[0.8125rem] font-medium text-muted-foreground">
            <div>Name</div>
            <div>Status</div>
            <div>Provider</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">GPT-4 System</div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
            </div>
            <div className="text-[0.8125rem]">OpenAI</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 1, name: 'GPT-4 System' }}
                column={mockColumn}
                mode="view"
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    variant: 'ghost'
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    variant: 'ghost'
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    variant: 'destructive'
                  }
                ]}
                onAction={(actionKey, row) => console.log('Action:', actionKey, 'Row:', row)}
              />
            </div>
          </div>

          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">Claude System</div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
            </div>
            <div className="text-[0.8125rem]">Anthropic</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 2, name: 'Claude System' }}
                column={mockColumn}
                mode="view"
                actions={[
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    variant: 'ghost'
                  }
                ]}
                onAction={(actionKey, row) => console.log('Action:', actionKey, 'Row:', row)}
              />
            </div>
          </div>

          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">Gemini System</div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Error</span>
            </div>
            <div className="text-[0.8125rem]">Google</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 3, name: 'Gemini System' }}
                column={mockColumn}
                mode="view"
                disabled={true}
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    variant: 'ghost'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing button cells in a real table context with different action configurations per row.',
      },
    },
  },
};
