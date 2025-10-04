import type { Meta, StoryObj } from '@storybook/react';
import { ButtonCell } from '../../components/patterns/ui-patterns/cell-types/button-cell';
import { Edit, Trash2, Eye, Copy, MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof ButtonCell> = {
  title: 'Patterns/CellTypes/ButtonCell',
  component: ButtonCell,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    buttonVariant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock row and column data
const mockRow = { id: 1, name: 'Test System', status: 'active' };
const mockColumn = { 
  key: 'actions', 
  title: 'Actions'
};

export const SingleAction: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

export const MultipleActions: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'view',
        label: 'View',
        icon: <Eye className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'copy',
        label: 'Copy',
        icon: <Copy className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

export const DestructiveAction: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    actions: [
      {
        key: 'delete',
        label: 'Delete',
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

export const Disabled: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    disabled: true,
    actions: [
      {
        key: 'edit',
        label: 'Edit',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
  },
};

export const CustomIcon: Story = {
  args: {
    value: null,
    row: mockRow,
    column: mockColumn,
    mode: 'view',
    buttonIcon: <MoreHorizontal className="h-4 w-4" />,
    actions: [
      {
        key: 'view',
        label: 'View Details',
        icon: <Eye className="h-4 w-4" />,
        variant: 'ghost'
      },
      {
        key: 'edit',
        label: 'Edit System',
        icon: <Edit className="h-4 w-4" />,
        variant: 'ghost'
      }
    ],
    onAction: (actionKey, row) => console.log('Action:', actionKey, 'Row:', row),
  },
};

export const InTable: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-[0.8125rem]  font-medium text-muted-foreground">
            <div>Name</div>
            <div>Status</div>
            <div>Provider</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="divide-y">
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem] ">GPT-4 System</div>
            <div className="text-[0.8125rem] ">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
            </div>
            <div className="text-[0.8125rem] ">OpenAI</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 1, name: 'GPT-4 System' }}
                column={mockColumn}
                mode="view"
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    variant: 'ghost'
                  },
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    variant: 'ghost'
                  },
                  {
                    key: 'delete',
                    label: 'Delete',
                    icon: <Trash2 className="h-4 w-4" />,
                    variant: 'destructive'
                  }
                ]}
                onAction={(actionKey, row) => console.log('Action:', actionKey, 'Row:', row)}
              />
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem] ">Claude System</div>
            <div className="text-[0.8125rem] ">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Pending</span>
            </div>
            <div className="text-[0.8125rem] ">Anthropic</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 2, name: 'Claude System' }}
                column={mockColumn}
                mode="view"
                actions={[
                  {
                    key: 'edit',
                    label: 'Edit',
                    icon: <Edit className="h-4 w-4" />,
                    variant: 'ghost'
                  }
                ]}
                onAction={(actionKey, row) => console.log('Action:', actionKey, 'Row:', row)}
              />
            </div>
          </div>
          
          <div className="p-4 grid grid-cols-4 gap-4 items-center">
            <div className="text-[0.8125rem] ">Gemini System</div>
            <div className="text-[0.8125rem] ">
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Error</span>
            </div>
            <div className="text-[0.8125rem] ">Google</div>
            <div>
              <ButtonCell
                value={null}
                row={{ id: 3, name: 'Gemini System' }}
                column={mockColumn}
                mode="view"
                disabled={true}
                actions={[
                  {
                    key: 'view',
                    label: 'View',
                    icon: <Eye className="h-4 w-4" />,
                    variant: 'ghost'
                  }
                ]}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};
