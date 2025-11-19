import type { Meta, StoryObj } from '@storybook/react';
import { TableActions } from '../../components/patterns/ui-patterns/table-actions';

const meta: Meta<typeof TableActions> = {
  title: 'Patterns/Table Patterns/Table Actions',
  component: TableActions,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    searchPlaceholder: {
      control: { type: 'text' },
    },
    onSearch: { action: 'search' },
    onFilter: { action: 'filter' },
    onEditColumns: { action: 'editColumns' },
    onExport: { action: 'export' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    searchPlaceholder: 'Search...',
  },
};

export const CustomPlaceholder: Story = {
  args: {
    searchPlaceholder: 'Search AI systems...',
  },
};

export const WithActions: Story = {
  args: {
    searchPlaceholder: 'Search users...',
    onSearch: (value) => console.log('Search:', value),
    onFilter: () => console.log('Filter clicked'),
    onEditColumns: () => console.log('Edit columns clicked'),
    onExport: () => console.log('Export clicked'),
  },
};

export const InTableHeader: Story = {
  render: () => (
    <div className="w-full max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">AI Systems</h2>
          <p className="text-[0.8125rem]  text-muted-foreground">Manage your AI systems and configurations</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-[0.8125rem]  font-medium hover:bg-blue-700">
          Add System
        </button>
      </div>
      
      <TableActions
        searchPlaceholder="Search AI systems..."
        onSearch={(value) => console.log('Search:', value)}
        onFilter={() => console.log('Filter clicked')}
        onEditColumns={() => console.log('Edit columns clicked')}
        onExport={() => console.log('Export clicked')}
      />
      
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <div className="grid grid-cols-4 gap-4 text-[0.8125rem]  font-medium text-muted-foreground">
            <div>Name</div>
            <div>Provider</div>
            <div>Status</div>
            <div>Actions</div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-[0.8125rem]  text-muted-foreground">Table content would go here...</p>
        </div>
      </div>
    </div>
  ),
};

export const Compact: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <TableActions
        searchPlaceholder="Quick search..."
        onSearch={(value) => console.log('Search:', value)}
        onFilter={() => console.log('Filter clicked')}
        onEditColumns={() => console.log('Edit columns clicked')}
        onExport={() => console.log('Export clicked')}
        className="px-4 py-2"
      />
    </div>
  ),
};
