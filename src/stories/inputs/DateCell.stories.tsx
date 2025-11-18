import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { DateCell } from '../../components/patterns/ui-patterns/cell-types/date-cell';

const meta: Meta<typeof DateCell> = {
  title: 'Inputs/Cell Types/Date Cell',
  component: DateCell,
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
  key: 'createdAt',
  title: 'Created At',
  type: 'date',
  readonly: false
};

export const ViewMode: Story = {
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const EditMode: Story = {
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Date changed to:', value),
  },
};

export const Empty: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const RecentDate: Story = {
  args: {
    value: new Date().toISOString().split('T')[0],
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const OldDate: Story = {
  args: {
    value: '2020-01-01',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const Disabled: Story = {
  args: {
    value: '2024-01-15',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    value: '2024-01-15',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};
