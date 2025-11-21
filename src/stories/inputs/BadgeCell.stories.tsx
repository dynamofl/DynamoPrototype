import type { Meta, StoryObj } from '@storybook/react';
import { BadgeCell } from '../../components/patterns/ui-patterns/cell-types/badge-cell';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const meta: Meta<typeof BadgeCell> = {
  title: 'Data Display/Table/Badge Cell',
  component: BadgeCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Badge cells display status or categorical values with color-coded badges in data tables. They support custom color mappings, icons, and tooltips.`,
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
      description: 'The value to display in the badge (can be string or array)',
      table: {
        type: { summary: 'string | string[] | null' },
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
    colorMap: {
      control: { type: 'object' },
      description: 'Mapping of values to badge styles and icons',
      table: {
        type: { summary: 'Record<string, BadgeConfig>' },
        category: 'Appearance',
      },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
      description: 'The visual style variant of the badge',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    tooltip: {
      control: { type: 'text' },
      description: 'Tooltip text to display on hover',
      table: {
        type: { summary: 'string' },
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
      description: 'Whether the cell is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onChange: {
      action: 'changed',
      description: 'Callback fired when the value changes',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock row and column data
const mockRow = { id: 1, name: 'Test System' };
const mockColumn = {
  key: 'status',
  title: 'Status',
  format: (value: any) => String(value)
};

/**
 * ### Basic
 *
 * Common status badge values used in tables.
 *
 * Active status badge shown in green.
 */
export const Active: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Inactive status badge shown in gray.
 */
export const Inactive: Story = {
  tags: ['!dev'],
  args: {
    value: 'inactive',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Pending status badge shown in yellow.
 */
export const Pending: Story = {
  tags: ['!dev'],
  args: {
    value: 'pending',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Error status badge shown in red.
 */
export const Error: Story = {
  tags: ['!dev'],
  args: {
    value: 'error',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * ### States
 *
 * Different states and configurations for badge cells.
 *
 * Badge with an icon for better visual context.
 */
export const WithIcon: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    colorMap: {
      active: {
        variant: 'default',
        className: 'bg-green-100 text-green-800 border-green-200',
        icon: <CheckCircle className="h-3 w-3" />
      }
    },
  },
};

/**
 * Badge with a tooltip that appears on hover.
 */
export const WithTooltip: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    tooltip: 'This system is currently active and processing requests',
  },
};

/**
 * Badge cell displaying multiple values as an array.
 */
export const ArrayValue: Story = {
  tags: ['!dev'],
  args: {
    value: ['gpt-4', 'gpt-3.5-turbo'],
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Badge cell with null or empty value.
 */
export const NullValue: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Badge cell in edit mode.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * Badge cell in disabled state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

/**
 * ### Examples
 *
 * Real-world usage examples and patterns.
 *
 * Custom color mappings for environment types with icons.
 */
export const CustomColorMap: Story = {
  tags: ['!dev'],
  args: {
    value: 'production',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    colorMap: {
      production: {
        variant: 'default',
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        icon: <CheckCircle className="h-3 w-3" />
      },
      staging: {
        variant: 'secondary',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <AlertTriangle className="h-3 w-3" />
      },
      development: {
        variant: 'outline',
        className: 'bg-gray-100 text-gray-800 border-gray-200'
      }
    },
  },
};

/**
 * All badge variants displayed together for comparison.
 */
export const AllVariants: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">Status Badges</h3>
        <div className="space-y-2">
          <BadgeCell
            value="active"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <BadgeCell
            value="inactive"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <BadgeCell
            value="pending"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <BadgeCell
            value="error"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">Custom Mappings</h3>
        <div className="space-y-2">
          <BadgeCell
            value="production"
            row={mockRow}
            column={mockColumn}
            mode="view"
            colorMap={{
              production: {
                variant: 'default',
                className: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <CheckCircle className="h-3 w-3" />
              },
              staging: {
                variant: 'secondary',
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <AlertTriangle className="h-3 w-3" />
              },
              development: {
                variant: 'outline',
                className: 'bg-gray-100 text-gray-800 border-gray-200'
              }
            }}
          />
          <BadgeCell
            value="staging"
            row={mockRow}
            column={mockColumn}
            mode="view"
            colorMap={{
              production: {
                variant: 'default',
                className: 'bg-blue-100 text-blue-800 border-blue-200',
                icon: <CheckCircle className="h-3 w-3" />
              },
              staging: {
                variant: 'secondary',
                className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                icon: <AlertTriangle className="h-3 w-3" />
              },
              development: {
                variant: 'outline',
                className: 'bg-gray-100 text-gray-800 border-gray-200'
              }
            }}
          />
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive example showing various badge configurations.',
      },
    },
  },
};
