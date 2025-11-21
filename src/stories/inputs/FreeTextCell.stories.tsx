import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { FreeTextCell } from '../../components/patterns/ui-patterns/cell-types/free-text-cell';

const meta: Meta<typeof FreeTextCell> = {
  title: 'Data Display/Table/Free Text Cell',
  component: FreeTextCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Free text cells allow users to input and edit text content in table cells. They support single-line and multiline text, character limits, and validation.`,
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
      description: 'The text content of the cell',
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
    multiline: {
      control: { type: 'boolean' },
      description: 'Whether to use a textarea for multiline input',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'Appearance',
      },
    },
    maxLength: {
      control: { type: 'number', min: 1, max: 1000 },
      description: 'Maximum character length allowed',
      table: {
        type: { summary: 'number' },
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
      description: 'Whether the input is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    validation: {
      control: { type: 'object' },
      description: 'Validation function for the input value',
      table: {
        type: { summary: '(value: string) => boolean' },
        category: 'State',
      },
    },
    onChange: {
      action: 'text-changed',
      description: 'Callback fired when the text value changes',
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
  key: 'description',
  title: 'Description',
  type: 'text',
  readonly: false
};

/**
 * ### Basic
 *
 * Basic text cell in view and edit modes.
 *
 * Text cell in view mode displays the text content.
 */
export const ViewMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'This is a sample description text.',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Text cell in edit mode with editable input field.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: 'This is editable text.',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * ### States
 *
 * Different states and configurations for text cells.
 *
 * Text cell with multiline textarea for longer content.
 */
export const Multiline: Story = {
  tags: ['!dev'],
  args: {
    value: 'This is a longer text that might need multiple lines.\nIt contains multiple paragraphs.\nAnd spans several lines.',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    multiline: true,
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * Text cell with empty value.
 */
export const Empty: Story = {
  tags: ['!dev'],
  args: {
    value: '',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * Text cell in disabled state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: 'This cell is disabled',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

/**
 * Text cell with readonly column configuration.
 */
export const Readonly: Story = {
  tags: ['!dev'],
  args: {
    value: 'This cell is readonly',
    row: { ...mockRow },
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

/**
 * ### Examples
 *
 * Real-world text cell examples with various configurations.
 *
 * Text cell with maximum character length limit.
 */
export const WithMaxLength: Story = {
  tags: ['!dev'],
  args: {
    value: 'Short description',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    maxLength: 50,
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * Text cell displaying long text content with overflow handling.
 */
export const LongText: Story = {
  tags: ['!dev'],
  args: {
    value: 'This is a very long text that demonstrates how the cell handles overflow and wrapping. It contains a lot of content that might not fit in a single line and needs to be properly displayed within the table cell boundaries. The text continues for a while to test the wrapping behavior and ensure proper display.',
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Text cell with validation that requires minimum length.
 */
export const WithValidation: Story = {
  tags: ['!dev'],
  args: {
    value: 'Valid text',
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    validation: (value: string) => value.length > 5,
    onChange: (value) => console.log('Changed to:', value),
  },
  parameters: {
    docs: {
      description: {
        story: 'Example with validation requiring text to be longer than 5 characters.',
      },
    },
  },
};
