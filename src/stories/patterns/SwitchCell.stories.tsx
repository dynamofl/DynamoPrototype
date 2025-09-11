import type { Meta, StoryObj } from '@storybook/react';
import { SwitchCell } from '../../components/patterns/cell-types/switch-cell';

const meta: Meta<typeof SwitchCell> = {
  title: 'Patterns/CellTypes/SwitchCell',
  component: SwitchCell,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
    },
    editMode: {
      control: { type: 'select' },
      options: ['inline', 'dialog'],
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
  key: 'enabled', 
  title: 'Enabled',
  readonly: false
};

export const Enabled: Story = {
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const Disabled: Story = {
  args: {
    value: false,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
  },
};

export const WithLabel: Story = {
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    switchLabel: (value) => value ? 'Enabled' : 'Disabled',
  },
};

export const EditMode: Story = {
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    onChange: (value) => console.log('Changed to:', value),
  },
};

export const EditModeDisabled: Story = {
  args: {
    value: false,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    disabled: true,
  },
};

export const DialogMode: Story = {
  args: {
    value: true,
    row: mockRow,
    column: mockColumn,
    mode: 'edit',
    editMode: 'dialog',
    onRowEdit: (row) => console.log('Edit row:', row),
  },
};

export const Readonly: Story = {
  args: {
    value: true,
    row: mockRow,
    column: { ...mockColumn, readonly: true },
    mode: 'edit',
  },
};

export const InTable: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground">
            <div>Name</div>
            <div>Provider</div>
            <div>Enabled</div>
            <div>Status</div>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-sm">GPT-4 System</div>
            <div className="text-sm">OpenAI</div>
            <div>
              <SwitchCell
                value={true}
                row={{ id: 1, name: 'GPT-4 System' }}
                column={mockColumn}
                mode="edit"
                onChange={(value) => console.log('GPT-4 enabled:', value)}
              />
            </div>
            <div className="text-sm">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-sm">Claude System</div>
            <div className="text-sm">Anthropic</div>
            <div>
              <SwitchCell
                value={false}
                row={{ id: 2, name: 'Claude System' }}
                column={mockColumn}
                mode="edit"
                onChange={(value) => console.log('Claude enabled:', value)}
              />
            </div>
            <div className="text-sm">
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">Inactive</span>
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-sm">Gemini System</div>
            <div className="text-sm">Google</div>
            <div>
              <SwitchCell
                value={true}
                row={{ id: 3, name: 'Gemini System' }}
                column={{ ...mockColumn, readonly: true }}
                mode="edit"
                disabled={true}
              />
            </div>
            <div className="text-sm">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">View Mode</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Enabled</span>
            <SwitchCell
              value={true}
              row={mockRow}
              column={mockColumn}
              mode="view"
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Disabled</span>
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
        <h3 className="text-sm font-medium">Edit Mode</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Interactive</span>
            <SwitchCell
              value={true}
              row={mockRow}
              column={mockColumn}
              mode="edit"
              onChange={(value) => console.log('Changed to:', value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Disabled</span>
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
        <h3 className="text-sm font-medium">With Labels</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Auto-label</span>
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
};
