import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DropdownCell } from '../../components/patterns/ui-patterns/cell-types/dropdown-cell';

const meta: Meta<typeof DropdownCell> = {
  title: 'Data Display/Table/Dropdown Cell',
  component: DropdownCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Dropdown cells allow users to select from a predefined list of options in table cells. They display the selected value in view mode and provide a dropdown selector in edit mode.`,
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
      description: 'The currently selected value',
      table: {
        type: { summary: 'string | null' },
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
      description: 'The column configuration object with options array',
      table: {
        type: { summary: 'ColumnDef' },
        category: 'Content',
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
      description: 'Whether the dropdown is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onChange: {
      action: 'value-changed',
      description: 'Callback fired when the selected value changes',
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
  type: 'select',
  readonly: false,
  options: [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'pending', label: 'Pending' },
    { value: 'error', label: 'Error' }
  ]
};

/**
 * ### Basic
 *
 * Basic dropdown cell in view and edit modes.
 *
 * Dropdown cell in view mode displays the selected label.
 */
export const ViewMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Dropdown cell in edit mode with selectable options.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Selected:', value),
  },
};

/**
 * ### States
 *
 * Different states and configurations for dropdown cells.
 *
 * Dropdown cell with no value selected.
 */
export const Empty: Story = {
  tags: ['!dev'],
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Dropdown cell in disabled state.
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
 * Dropdown cell with readonly column configuration.
 */
export const Readonly: Story = {
  tags: ['!dev'],
  args: {
    value: 'active',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

/**
 * ### Examples
 *
 * Real-world dropdown cell examples showing different selected values.
 *
 * Different status values displayed together.
 */
export const DifferentValues: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">Status Values</h3>
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
  parameters: {
    docs: {
      description: {
        story: 'Example showing all available options displayed in view mode.',
      },
    },
  },
};
