import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DateCell } from '../../components/patterns/ui-patterns/cell-types/date-cell';

const meta: Meta<typeof DateCell> = {
  title: 'Data Display/Table/Date Cell',
  component: DateCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Date cells display and edit date values in table cells. They provide a date picker in edit mode and formatted date display in view mode.`,
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
      description: 'The date value in ISO format (YYYY-MM-DD)',
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
      description: 'The column configuration object',
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
      description: 'Whether the cell is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onChange: {
      action: 'date-changed',
      description: 'Callback fired when the date value changes',
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
  key: 'createdAt',
  title: 'Created At',
  type: 'date',
  readonly: false
};

/**
 * ### Basic
 *
 * Basic date cell display in view and edit modes.
 *
 * Date cell in view mode displays the formatted date.
 */
export const ViewMode: Story = {
  tags: ['!dev'],
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Date cell in edit mode with date picker.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Date changed to:', value),
  },
};

/**
 * ### States
 *
 * Different states for date cells.
 *
 * Date cell with no value selected.
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
 * Date cell in disabled state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

/**
 * Date cell with readonly column configuration.
 */
export const Readonly: Story = {
  tags: ['!dev'],
  args: {
    value: '2024-01-15',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

/**
 * ### Examples
 *
 * Real-world date cell examples with different date values.
 *
 * Recent date from today.
 */
export const RecentDate: Story = {
  tags: ['!dev'],
  args: {
    value: new Date().toISOString().split('T')[0],
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Older date from the past.
 */
export const OldDate: Story = {
  tags: ['!dev'],
  args: {
    value: '2020-01-01',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};
