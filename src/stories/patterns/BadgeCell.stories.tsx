import type { Meta, StoryObj } from '@storybook/react';
import { BadgeCell } from '../../components/patterns/cell-types/badge-cell';
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const meta: Meta<typeof BadgeCell> = {
  title: 'Patterns/CellTypes/BadgeCell',
  component: BadgeCell,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
    disabled: {
      control: { type: 'boolean' },
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

export const Active: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const Inactive: Story = {
  args: {
    value: 'inactive',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const Pending: Story = {
  args: {
    value: 'pending',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const Error: Story = {
  args: {
    value: 'error',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const WithIcon: Story = {
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

export const CustomColorMap: Story = {
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

export const WithTooltip: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    tooltip: 'This system is currently active and processing requests',
  },
};

export const EditMode: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const Disabled: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

export const ArrayValue: Story = {
  args: {
    value: ['gpt-4', 'gpt-3.5-turbo'],
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const NullValue: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status Badges</h3>
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
        <h3 className="text-sm font-medium">Custom Mappings</h3>
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
};
