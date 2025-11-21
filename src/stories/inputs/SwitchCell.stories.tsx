import type { Meta, StoryObj } from '@storybook/react';
import { SwitchCell } from '../../components/patterns/ui-patterns/cell-types/switch-cell';

const meta: Meta<typeof SwitchCell> = {
  title: 'Data Display/Table/Switch Cell',
  component: SwitchCell,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Switch cells provide a toggle control for boolean values in table cells. They display the current state and allow users to quickly enable or disable features.`,
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
      control: { type: 'boolean' },
      description: 'The boolean value of the switch (true for enabled, false for disabled)',
      table: {
        type: { summary: 'boolean' },
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
    switchLabel: {
      control: { type: 'object' },
      description: 'Function to generate label text based on the switch value',
      table: {
        type: { summary: '(value: boolean) => string' },
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
    editMode: {
      control: { type: 'select' },
      options: ['inline', 'dialog'],
      description: 'How the switch behaves in edit mode',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'inline' },
        category: 'State',
      },
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the switch is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onChange: {
      action: 'switch-toggled',
      description: 'Callback fired when the switch value changes',
      table: {
        category: 'Events',
      },
    },
    onRowEdit: {
      action: 'row-edit-triggered',
      description: 'Callback fired when the row edit is triggered (dialog mode)',
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
  key: 'enabled',
  title: 'Enabled',
  readonly: false
};

/**
 * ### Basic
 *
 * Basic switch cell states showing enabled and disabled values.
 *
 * Switch in the enabled (on) state.
 */
export const Enabled: Story = {
  tags: ['!dev'],
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * Switch in the disabled (off) state.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  args: {
    value: false,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

/**
 * ### States
 *
 * Different states and configurations for switch cells.
 *
 * Switch with a custom label that changes based on the value.
 */
export const WithLabel: Story = {
  tags: ['!dev'],
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    switchLabel: (value) => value ? 'Enabled' : 'Disabled',
  },
};

/**
 * Switch in edit mode allowing user interaction.
 */
export const EditMode: Story = {
  tags: ['!dev'],
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

/**
 * Switch in edit mode but disabled state.
 */
export const EditModeDisabled: Story = {
  tags: ['!dev'],
  args: {
    value: false,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

/**
 * Switch with dialog mode that triggers row edit.
 */
export const DialogMode: Story = {
  tags: ['!dev'],
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    editMode: 'dialog',
    onRowEdit: (row) => console.log('Edit row:', row),
  },
};

/**
 * Switch with readonly column configuration.
 */
export const Readonly: Story = {
  tags: ['!dev'],
  args: {
    value: true,
    row: mockRow,
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

/**
 * ### Examples
 *
 * Real-world usage examples showing switches in different contexts.
 *
 * Switches integrated into a data table with various states.
 */
export const InTable: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-[0.8125rem] font-medium text-muted-foreground">
            <div>Name</div>
            <div>Provider</div>
            <div>Enabled</div>
            <div>Status</div>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">GPT-4 System</div>
            <div className="text-[0.8125rem]">OpenAI</div>
            <div>
              <SwitchCell
                value={true}
                row={{ id: 1, name: 'GPT-4 System' }}
                column={mockColumn}
                mode="edit"
                onChange={(value) => console.log('GPT-4 enabled:', value)}
              />
            </div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">Claude System</div>
            <div className="text-[0.8125rem]">Anthropic</div>
            <div>
              <SwitchCell
                value={false}
                row={{ id: 2, name: 'Claude System' }}
                column={mockColumn}
                mode="edit"
                onChange={(value) => console.log('Claude enabled:', value)}
              />
            </div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
            </div>
          </div>

          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem]">Gemini System</div>
            <div className="text-[0.8125rem]">Google</div>
            <div>
              <SwitchCell
                value={true}
                row={{ id: 3, name: 'Gemini System' }}
                column={{ ...mockColumn, readonly: true }}
                mode="edit"
                disabled={true}
              />
            </div>
            <div className="text-[0.8125rem]">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing switch cells in a real table context with different states per row.',
      },
    },
  },
};

/**
 * All switch states displayed together for comparison.
 */
export const AllStates: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">View Mode</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.8125rem]">Enabled</span>
            <SwitchCell
              value={true}
              row={mockRow}
              column={mockColumn}
              mode="view"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.8125rem]">Disabled</span>
            <SwitchCell
              value={false}
              row={mockRow}
              column={mockColumn}
              mode="view"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">Edit Mode</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.8125rem]">Interactive</span>
            <SwitchCell
              value={true}
              row={mockRow}
              column={mockColumn}
              mode="edit"
              onChange={(value) => console.log('Changed to:', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.8125rem]">Disabled</span>
            <SwitchCell
              value={false}
              row={mockRow}
              column={mockColumn}
              mode="edit"
              disabled={true}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-[0.8125rem] font-medium">With Labels</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.8125rem]">Auto-label</span>
            <SwitchCell
              value={true}
              row={mockRow}
              column={mockColumn}
              mode="view"
              switchLabel={(value) => value ? 'On' : 'Off'}
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive example showing all switch configurations and states.',
      },
    },
  },
};
