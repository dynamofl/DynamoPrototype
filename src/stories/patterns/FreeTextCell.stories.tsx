import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FreeTextCell } from '../../components/patterns/ui-patterns/cell-types/free-text-cell';

const meta: Meta<typeof FreeTextCell> = {
  title: 'Patterns/CellTypes/FreeTextCell',
  component: FreeTextCell,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
    },
    multiline: {
      control: { type: 'boolean' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
    maxLength: {
      control: { type: 'number', min: 1, max: 1000 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock row and column data
const mockRow = { id: 1, name: 'Test System' };
const mockColumn = {
  key: 'description',
  title: 'Description',
  type: 'text',
  readonly: false
};

export const ViewMode: Story = {
  args: {
    value: 'This is a sample description text.',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const EditMode: Story = {
  args: {
    value: 'This is editable text.',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const Multiline: Story = {
  args: {
    value: 'This is a longer text that might need multiple lines.\nIt contains multiple paragraphs.\nAnd spans several lines.',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    multiline: true,
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const WithMaxLength: Story = {
  args: {
    value: 'Short description',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    maxLength: 50,
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const Empty: Story = {
  args: {
    value: '',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const Disabled: Story = {
  args: {
    value: 'This cell is disabled',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

export const Readonly: Story = {
  args: {
    value: 'This cell is readonly',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

export const LongText: Story = {
  args: {
    value: 'This is a very long text that demonstrates how the cell handles overflow and wrapping. It contains a lot of content that might not fit in a single line and needs to be properly displayed within the table cell boundaries. The text continues for a while to test the wrapping behavior and ensure proper display.',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const WithValidation: Story = {
  args: {
    value: 'Valid text',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    validation: (value: string) => value.length > 5,
    onChange: (value) => console.log('Changed to:', value),
  },
};
