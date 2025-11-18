import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { IconCell } from '../../components/patterns/ui-patterns/cell-types/icon-cell';
import { CheckCircle, AlertTriangle, XCircle, Settings } from 'lucide-react';

const meta: Meta<typeof IconCell> = {
  title: 'Inputs/Cell Types/Icon Cell',
  component: IconCell,
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
  type: 'icon',
  readonly: false
};

export const CheckIcon: Story = {
  args: {
    value: 'success',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      settings: <Settings className="h-4 w-4 text-blue-600" />
    },
  },
};

export const WarningIcon: Story = {
  args: {
    value: 'warning',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      settings: <Settings className="h-4 w-4 text-blue-600" />
    },
  },
};

export const ErrorIcon: Story = {
  args: {
    value: 'error',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      settings: <Settings className="h-4 w-4 text-blue-600" />
    },
  },
};

export const SettingsIcon: Story = {
  args: {
    value: 'settings',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    iconMap: {
      success: <CheckCircle className="h-4 w-4 text-green-600" />,
      warning: <AlertTriangle className="h-4 w-4 text-yellow-600" />,
      error: <XCircle className="h-4 w-4 text-red-600" />,
      settings: <Settings className="h-4 w-4 text-blue-600" />
    },
  },
};

export const WithoutIconMap: Story = {
  args: {
    value: 'Default status',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const EditMode: Story = {
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

export const Disabled: Story = {
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
