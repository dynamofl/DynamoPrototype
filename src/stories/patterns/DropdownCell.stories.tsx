import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DropdownCell } from '../../components/patterns/ui-patterns/cell-types/dropdown-cell';

const meta: Meta<typeof DropdownCell> = {
  title: 'Patterns/CellTypes/DropdownCell',
  component: DropdownCell,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
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
  type: 'select',
  readonly: false,
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'error', label: 'Error' }
  ]
};

export const ViewMode: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const EditMode: Story = {
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Selected:', value),
  },
};

export const DifferentValues: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Status Values</h3>
        <div className="space-y-2">
          <DropdownCell
            value="active"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <DropdownCell
            value="inactive"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <DropdownCell
            value="pending"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
          <DropdownCell
            value="error"
            row={mockRow}
            column={mockColumn}
            mode="view"
          />
        </div>
      </div>
    </div>
  ),
};

export const Empty: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
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

export const Readonly: Story = {
  args: {
    value: 'active',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};
