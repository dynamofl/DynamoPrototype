import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { IconCell } from '../../components/patterns/ui-patterns/cell-types/icon-cell';
import { CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';

const meta: Meta<typeof IconCell> = {
  title: 'Inputs/Cell Types/Icon Cell',
  component: IconCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Icon cells display icons mapped to data values in table cells. They're useful for showing status, priority, or category indicators with visual icons instead of text.`,
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
      description: 'The value that maps to an icon in the iconMap',
      table: {
        type: { summary: 'string' },
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
    iconMap: {
      control: { type: 'object' },
      description: 'Mapping of values to icon components',
      table: {
        type: { summary: 'Record<string, ReactNode>' },
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
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock row and column data
const mockRow = { id: 1, name: 'Test System' };
const mockColumn = {
  key: 'status',
  title: 'Status',
  type: 'icon',
  readonly: false
};

const defaultIconMap = {
  success: <CheckCircle className="h-4 w-4 text-green-600" />,
  warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
  error: <XCircle className="h-4 w-4 text-red-600" />,
  settings: <Settings className="h-4 w-4 text-blue-600" />
};

/**
 * ### Basic
 *
 * Basic icon cell with different mapped values.
 *
 * Success icon shown in green.
 */
export const CheckIcon: Story = {
  tags: ['!dev'],
  args: {
    value: 'success',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: defaultIconMap,
  },
};

/**
 * Warning icon shown in yellow.
 */
export const WarningIcon: Story = {
  tags: ['!dev'],
  args: {
    value: 'warning',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: defaultIconMap,
  },
};

/**
 * Error icon shown in red.
 */
export const ErrorIcon: Story = {
  tags: ['!dev'],
  args: {
    value: 'error',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: defaultIconMap,
  },
};

/**
 * Settings icon shown in blue.
 */
export const SettingsIcon: Story = {
  tags: ['!dev'],
  args: {
    value: 'settings',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: defaultIconMap,
  },
};

/**
 * ### States
 *
 * Different states and configurations for icon cells.
 *
 * Icon cell without an icon map displays the raw value.
 */
export const WithoutIconMap: Story = {
  tags: ['!dev'],
  args: {
    value: 'Default status',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Icon cell in edit mode.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'success',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />
    },
  },
};

/**
 * Icon cell in disabled state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: 'success',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
    },
  },
};
