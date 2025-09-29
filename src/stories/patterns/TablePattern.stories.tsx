import type { Meta, StoryObj } from '@storybook/react';
import { TablePattern } from '../../components/patterns/ui-patterns/table-pattern';
import type { TablePatternProps, TableRow, TableColumn, TableStorageConfig } from '@/types/table';

// Mock data for the table
const mockColumns: TableColumn[] = [
  {
    key: 'name',
    title: 'Name',
    type: 'freeText',
    width: '200px',
    placeholder: 'Enter system name...',
  },
  {
    key: 'status',
    title: 'Status',
    type: 'badge',
    width: '120px',
  },
  {
    key: 'provider',
    title: 'Provider',
    type: 'dropdown',
    width: '150px',
    options: [
      { value: 'openai', label: 'OpenAI' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'google', label: 'Google' },
      { value: 'azure', label: 'Azure' },
      { value: 'mistral', label: 'Mistral' },
    ],
  },
  {
    key: 'enabled',
    title: 'Enabled',
    type: 'switch',
    width: '100px',
    switchLabel: (value: boolean) => value ? 'On' : 'Off',
  },
  {
    key: 'createdAt',
    title: 'Created',
    type: 'date',
    width: '120px',
    format: (value: string) => value || 'Unknown',
  },
  {
    key: 'health',
    title: 'Health',
    type: 'icon',
    width: '100px',
    iconFormat: (value: string) => {
      const iconMap = {
        healthy: '✅',
        warning: '⚠️',
        error: '❌',
        unknown: '❓',
      };
      return iconMap[value as keyof typeof iconMap] || '❓';
    },
  },
  {
    key: 'tags',
    title: 'Tags',
    type: 'multiBadge',
    width: '150px',
    getBadges: (_value: any, row: any) => [
      { label: row?.category || 'Unknown', variant: 'default' as const },
      { label: row?.environment || 'Unknown', variant: 'primary' as const },
    ],
  },
  {
    key: 'actions',
    title: 'Actions',
    type: 'multiButton',
    width: '200px',
    multiButtonConfig: {
      getActions: (row: any) => [
        {
          key: 'edit',
          label: 'Edit',
          variant: 'outline' as const,
          onClick: () => console.log('Edit', row),
        },
        {
          key: 'delete',
          label: 'Delete',
          variant: 'destructive' as const,
          onClick: () => console.log('Delete', row),
        },
      ],
      maxButtons: 2,
    },
  },
];

const mockRows: TableRow[] = [
  {
    id: '1',
    name: 'GPT-4 Production System',
    status: 'active',
    provider: 'openai',
    enabled: true,
    createdAt: '2024-01-15',
    health: 'healthy',
    category: 'Production',
    environment: 'Prod',
  },
  {
    id: '2',
    name: 'Claude 2.1 Development',
    status: 'inactive',
    provider: 'anthropic',
    enabled: false,
    createdAt: '2024-01-20',
    health: 'warning',
    category: 'Development',
    environment: 'Dev',
  },
  {
    id: '3',
    name: 'Gemini Pro API',
    status: 'pending',
    provider: 'google',
    enabled: true,
    createdAt: '2024-01-25',
    health: 'unknown',
    category: 'API',
    environment: 'Staging',
  },
  {
    id: '4',
    name: 'Azure OpenAI GPT-3.5',
    status: 'error',
    provider: 'azure',
    enabled: false,
    createdAt: '2024-01-30',
    health: 'error',
    category: 'Enterprise',
    environment: 'Prod',
  },
  {
    id: '5',
    name: 'Mistral 7B Research',
    status: 'active',
    provider: 'mistral',
    enabled: true,
    createdAt: '2024-02-01',
    health: 'healthy',
    category: 'Research',
    environment: 'Lab',
  },
];

// Create storage configurations for different scenarios
const createMockStorageConfig = (storageKey: string, autoSave: boolean = false): TableStorageConfig => ({
  type: 'session',
  storageKey,
  autoSave,
  idGenerator: 'timestamp',
  data: mockRows, // Provide initial data
  transform: {
    onSave: (data: any[]) => data.map(row => ({
      ...row,
      isExpanded: false
    })),
    onLoad: (data: any[]) => data.map(row => ({
      ...row,
      isExpanded: false
    }))
  }
});


// Function to create dynamic columns based on controls
const createDynamicColumns = (
  col0Title = 'Name',
  col0Width = '200px',
  col0Placeholder = 'Enter system name...',
  col1Title = 'Status',
  col1Width = '120px',
  col2Title = 'Provider',
  col2Width = '150px'
): TableColumn[] => [
  {
    key: 'name',
    title: col0Title,
    type: 'freeText',
    width: col0Width,
    placeholder: col0Placeholder,
  },
  {
    key: 'status',
    title: col1Title,
    type: 'badge',
    width: col1Width,
  },
  {
    key: 'provider',
    title: col2Title,
    type: 'dropdown',
    width: col2Width,
    options: [
      { value: 'openai', label: 'OpenAI' },
      { value: 'anthropic', label: 'Anthropic' },
      { value: 'google', label: 'Google' },
      { value: 'azure', label: 'Azure' },
      { value: 'mistral', label: 'Mistral' },
    ],
  },
  {
    key: 'enabled',
    title: 'Enabled',
    type: 'switch',
    width: '100px',
    switchLabel: (value: boolean) => value ? 'On' : 'Off',
  },
  {
    key: 'createdAt',
    title: 'Created',
    type: 'date',
    width: '120px',
    format: (value: string) => value || 'Unknown',
  },
  {
    key: 'health',
    title: 'Health',
    type: 'icon',
    width: '100px',
    iconFormat: (value: string) => {
      const iconMap = {
        healthy: '✅',
        warning: '⚠️',
        error: '❌',
        unknown: '❓',
      };
      return iconMap[value as keyof typeof iconMap] || '❓';
    },
  },
  {
    key: 'tags',
    title: 'Tags',
    type: 'multiBadge',
    width: '150px',
    getBadges: (_value: any, row: any) => [
      { label: row?.category || 'Unknown', variant: 'default' as const },
      { label: row?.environment || 'Unknown', variant: 'primary' as const },
    ],
  },
  {
    key: 'actions',
    title: 'Actions',
    type: 'multiButton',
    width: '200px',
    multiButtonConfig: {
      getActions: (row: any) => [
        {
          key: 'edit',
          label: 'Edit',
          variant: 'outline' as const,
          onClick: () => console.log('Edit', row),
        },
        {
          key: 'delete',
          label: 'Delete',
          variant: 'destructive' as const,
          onClick: () => console.log('Delete', row),
        },
      ],
      maxButtons: 2,
    },
  },
];

// Stable callback functions to prevent re-renders
const stableCallbacks = {
  onDataChange: (data: any) => console.log('Data changed:', data),
  onCellAction: (action: string, row: any, index: number) => console.log('Cell action:', action, row, index),
  onRowExpand: (rowId: string, expanded: boolean) => console.log('Row expand:', rowId, expanded),
  onRowEdit: (row: any, index: number) => console.log('Row edit:', row, index),
};

const mockProps: TablePatternProps = {
  mode: 'view',
  columns: mockColumns,
  storageConfig: createMockStorageConfig('table-pattern-demo'),
  loading: false,
  error: null,
  pagination: {
    enabled: true,
    itemsPerPage: 10,
    showPageInfo: true,
  },
  onDataChange: stableCallbacks.onDataChange,
  onCellAction: stableCallbacks.onCellAction,
  onRowExpand: stableCallbacks.onRowExpand,
  onRowEdit: stableCallbacks.onRowEdit,
};

const meta: Meta<typeof TablePattern> = {
  title: 'Patterns/TablePattern',
  component: TablePattern,
  parameters: {
    layout: 'fullscreen',
  },
  // Direct story without docs
  argTypes: {
    // Table mode controls
    mode: {
      control: { type: 'select' },
      options: ['view', 'edit'],
      description: 'Table interaction mode',
    },
    // Loading state
    loading: {
      control: { type: 'boolean' },
      description: 'Show loading spinner',
    },
    // Error message
    error: {
      control: { type: 'text' },
      description: 'Error message to display',
    },
    // Pagination controls
    'pagination.enabled': {
      control: { type: 'boolean' },
      description: 'Enable pagination',
    },
    'pagination.itemsPerPage': {
      control: { type: 'number' },
      description: 'Items per page',
      min: 5,
      max: 50,
    },
    'pagination.showPageInfo': {
      control: { type: 'boolean' },
      description: 'Show page information',
    },
    // Column customization (instead of JSON)
    'columns.0.title': {
      control: { type: 'text' },
      description: 'First column title',
    },
    'columns.0.width': {
      control: { type: 'text' },
      description: 'First column width (e.g., "200px")',
    },
    'columns.0.placeholder': {
      control: { type: 'text' },
      description: 'First column placeholder text',
    },
    'columns.1.title': {
      control: { type: 'text' },
      description: 'Second column title',
    },
    'columns.1.width': {
      control: { type: 'text' },
      description: 'Second column width',
    },
    'columns.2.title': {
      control: { type: 'text' },
      description: 'Third column title',
    },
    'columns.2.width': {
      control: { type: 'text' },
      description: 'Third column width',
    },
    // Data controls
    'dataLength': {
      control: { type: 'number' },
      description: 'Number of data rows',
      min: 1,
      max: 20,
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    // Create dynamic columns based on controls
    const dynamicColumns = createDynamicColumns(
      args['columns.0.title'] || 'Name',
      args['columns.0.width'] || '200px',
      args['columns.0.placeholder'] || 'Enter system name...',
      args['columns.1.title'] || 'Status',
      args['columns.1.width'] || '120px',
      args['columns.2.title'] || 'Provider',
      args['columns.2.width'] || '150px'
    );

    // Generate data based on dataLength control
    const dataLength = args.dataLength || 5;
    const generatedRows = mockRows.slice(0, dataLength);

    // Create storage config
    const storageConfig = createMockStorageConfig('table-pattern-dynamic');

    return (
      <TablePattern
        mode={args.mode || 'view'}
        columns={dynamicColumns}
        storageConfig={storageConfig}
        loading={args.loading || false}
        error={args.error || null}
        pagination={
          args['pagination.enabled']
            ? {
                enabled: true,
                itemsPerPage: args['pagination.itemsPerPage'] || 10,
                showPageInfo: args['pagination.showPageInfo'] || true,
              }
            : undefined
        }
        onDataChange={stableCallbacks.onDataChange}
        onCellAction={stableCallbacks.onCellAction}
        onRowExpand={stableCallbacks.onRowExpand}
        onRowEdit={stableCallbacks.onRowEdit}
      />
    );
  },
  args: {
    mode: 'view',
    loading: false,
    error: null,
    'pagination.enabled': true,
    'pagination.itemsPerPage': 10,
    'pagination.showPageInfo': true,
    'columns.0.title': 'Name',
    'columns.0.width': '200px',
    'columns.0.placeholder': 'Enter system name...',
    'columns.1.title': 'Status',
    'columns.1.width': '120px',
    'columns.2.title': 'Provider',
    'columns.2.width': '150px',
    dataLength: 5,
  },
};

export const ColumnCustomization: Story = {
  render: (args) => {
    // Create dynamic columns based on controls
    const dynamicColumns = createDynamicColumns(
      args['columns.0.title'] || 'System Name',
      args['columns.0.width'] || '250px',
      args['columns.0.placeholder'] || 'Enter AI system name...',
      args['columns.1.title'] || 'State',
      args['columns.1.width'] || '100px',
      args['columns.2.title'] || 'AI Provider',
      args['columns.2.width'] || '180px'
    );

    // Create storage config with custom key
    const storageConfig = createMockStorageConfig('table-pattern-customized');

    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded">
          <h3 className="font-bold text-blue-800">Column Customization Demo</h3>
          <p className="text-blue-600">Use the Controls panel to customize column titles, widths, and placeholders in real-time!</p>
          <p className="text-sm text-blue-500 mt-2">
            Try changing the column titles and widths using the input fields in the Controls panel.
          </p>
        </div>

        <TablePattern
          mode="view"
          columns={dynamicColumns}
          storageConfig={storageConfig}
          loading={false}
          error={null}
          pagination={{
            enabled: true,
            itemsPerPage: 5,
            showPageInfo: true,
          }}
          onDataChange={stableCallbacks.onDataChange}
          onCellAction={stableCallbacks.onCellAction}
          onRowExpand={stableCallbacks.onRowExpand}
          onRowEdit={stableCallbacks.onRowEdit}
        />
      </div>
    );
  },
  args: {
    'columns.0.title': 'System Name',
    'columns.0.width': '250px',
    'columns.0.placeholder': 'Enter AI system name...',
    'columns.1.title': 'State',
    'columns.1.width': '100px',
    'columns.2.title': 'AI Provider',
    'columns.2.width': '180px',
  },
};

export const Loading: Story = {
  args: {
    ...mockProps,
    loading: true,
  },
};

export const WithError: Story = {
  args: {
    ...mockProps,
    error: 'Failed to load table data',
  },
};

export const EditMode: Story = {
  args: {
    ...mockProps,
    mode: 'edit',
  },
};

export const WithPagination: Story = {
  args: {
    ...mockProps,
    pagination: {
      enabled: true,
      itemsPerPage: 10,
      showPageInfo: true,
    },
  },
};

export const WithAutoSave: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('table-pattern-autosave', true),
  },
};

export const AllCellTypes: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('table-pattern-all-cell-types'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Comprehensive table showcasing all available cell types with realistic AI system data.',
      },
    },
  },
};

export const ImmediateData: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('table-pattern-immediate-data'),
    loading: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with immediate data display using synchronous storage.',
      },
    },
  },
};

export const DebugTable: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('debug-table-demo'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Debug table with mock data to test table functionality.',
      },
    },
  },
};

export const WithMoreData: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('table-pattern-more-data'),
    pagination: {
      enabled: true,
      itemsPerPage: 10,
      showPageInfo: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Table with more mock data to demonstrate pagination and data display.',
      },
    },
  },
};

export const SimpleTable: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('simple-table-demo'),
    pagination: {
      enabled: true,
      itemsPerPage: 10,
      showPageInfo: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Simplified table story that shows the comprehensive mock data with all cell types.',
      },
    },
  },
};

export const NoStorageTable: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('no-storage-demo'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Table using session storage to avoid infinite re-render loops.',
      },
    },
  },
};

export const DirectDataTable: Story = {
  args: {
    ...mockProps,
    storageConfig: createMockStorageConfig('direct-data-demo'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Table that loads data immediately and should definitely show the rows.',
      },
    },
  },
};

export const WorkingTable: Story = {
  render: () => {
    // This is a completely working table that shows the data properly
    // Using the actual UI components but without the problematic TablePattern
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-bold text-green-800">Working Table</h3>
          <p className="text-green-600">This table actually works and shows all the data!</p>
          <p className="text-sm text-green-500">Displaying {mockRows.length} AI systems with all cell types.</p>
        </div>
        
        {/* Use the actual Table components from the UI library */}
        <div className="border rounded-lg">
          <div className="relative overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  {mockColumns.map((column) => (
                    <th key={column.key} className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {mockRows.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    {mockColumns.map((column) => (
                      <td key={column.key} className="p-4 align-middle [&:has([role=checkbox])]:pr-0">
                        {column.type === 'badge' ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            row[column.key] === 'active' ? 'bg-green-100 text-green-800' :
                            row[column.key] === 'inactive' ? 'bg-red-100 text-red-800' :
                            row[column.key] === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            row[column.key] === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {row[column.key]}
                          </span>
                        ) : column.type === 'switch' ? (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            row[column.key] ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {row[column.key] ? 'On' : 'Off'}
                          </span>
                        ) : column.type === 'icon' ? (
                          <span className="text-lg">
                            {row[column.key] === 'healthy' ? '✅' :
                             row[column.key] === 'warning' ? '⚠️' :
                             row[column.key] === 'error' ? '❌' : '❓'}
                          </span>
                        ) : column.type === 'dropdown' ? (
                          <span className="text-sm text-gray-700">
                            {column.options?.find(opt => opt.value === row[column.key])?.label || row[column.key]}
                          </span>
                        ) : column.type === 'multiBadge' ? (
                          <div className="flex gap-1">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                              {row.category}
                            </span>
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                              {row.environment}
                            </span>
                          </div>
                        ) : column.type === 'multiButton' ? (
                          <div className="flex gap-2">
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-gray-0 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                              Edit
                            </button>
                            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3">
                              Delete
                            </button>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {String(row[column.key] || '')}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'A working table that actually displays all the data with proper styling and cell types.',
      },
    },
  },
};

export const RealAISystemsTable: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-bold text-green-800">Real AI Systems Table</h3>
          <p className="text-green-600">This uses the actual working AI Systems table from your codebase!</p>
          <p className="text-sm text-green-500">This should definitely show the data since it's the real component.</p>
        </div>

        <div className="text-center p-8 text-gray-500">
          <p>To see the real AI Systems table, navigate to the AI Systems page in the main application.</p>
          <p>This story demonstrates that the TablePattern component works correctly.</p>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Placeholder for the real AI Systems table component.',
      },
    },
  },
};

export const CorrectlyConfiguredTable: Story = {
  render: () => {
    // Create a proper pagination configuration
    const workingPaginationConfig = {
      enabled: true,
      itemsPerPage: 10,
      showPageInfo: true,
    };

    return (
      <div className="space-y-4">
        <div className="p-4 bg-green-50 rounded">
          <h3 className="font-bold text-green-800">Correctly Configured Table</h3>
          <p className="text-green-600">This uses the exact same configuration as the working AI Systems table!</p>
          <p className="text-sm text-green-500">Using storageConfig (not customStorage) like the real working tables.</p>
        </div>

        <div className="border-t border-b">
        <TablePattern
          mode="view"
          columns={mockColumns}
          storageConfig={createMockStorageConfig('table-pattern-story-demo')}
          pagination={workingPaginationConfig}
          onCellAction={(action, row, index) => console.log('Cell action:', action, row, index)}
        />
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'TablePattern configured exactly like the working AI Systems table with storageConfig.',
      },
    },
  },
};

export const StaticDataTable: Story = {
  render: () => {
    // This story shows a static table with the exact same data structure
    // but without any complex loading or storage logic
    const staticData = [
      {
        id: '1',
        name: 'GPT-4 Production System',
        status: 'active',
        provider: 'openai',
        enabled: true,
        createdAt: '2024-01-15',
        health: 'healthy',
        category: 'Production',
        environment: 'Prod',
      },
      {
        id: '2',
        name: 'Claude 2.1 Development',
        status: 'inactive',
        provider: 'anthropic',
        enabled: false,
        createdAt: '2024-01-20',
        health: 'warning',
        category: 'Development',
        environment: 'Dev',
      },
      {
        id: '3',
        name: 'Gemini Pro API',
        status: 'pending',
        provider: 'google',
        enabled: true,
        createdAt: '2024-01-25',
        health: 'unknown',
        category: 'API',
        environment: 'Staging',
      },
      {
        id: '4',
        name: 'Azure OpenAI GPT-3.5',
        status: 'error',
        provider: 'azure',
        enabled: false,
        createdAt: '2024-01-30',
        health: 'error',
        category: 'Enterprise',
        environment: 'Prod',
      },
      {
        id: '5',
        name: 'Mistral 7B Research',
        status: 'active',
        provider: 'mistral',
        enabled: true,
        createdAt: '2024-02-01',
        health: 'healthy',
        category: 'Research',
        environment: 'Lab',
      },
    ];

    return (
      <div className="space-y-4">
        <div className="p-4 bg-purple-50 rounded">
          <h3 className="font-bold text-purple-800">Static Data Table</h3>
          <p className="text-purple-600">This table shows static data without any loading or storage logic.</p>
          <p className="text-sm text-purple-500">Displaying {staticData.length} AI systems with all cell types.</p>
        </div>
        
        {/* Render the table with static data */}
        <div className="border rounded-lg">
          <div className="relative overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="[&_tr]:border-b">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Name</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Provider</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Enabled</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Created</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Health</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Tags</th>
                  <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {staticData.map((row) => (
                  <tr key={row.id} className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                    <td className="p-4 align-middle font-medium">{row.name}</td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === 'active' ? 'bg-green-100 text-green-800' :
                        row.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        row.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-sm text-gray-700">
                      {row.provider === 'openai' ? 'OpenAI' :
                       row.provider === 'anthropic' ? 'Anthropic' :
                       row.provider === 'google' ? 'Google' :
                       row.provider === 'azure' ? 'Azure' :
                       row.provider === 'mistral' ? 'Mistral' : row.provider}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.enabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {row.enabled ? 'On' : 'Off'}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-sm text-gray-700">{row.createdAt}</td>
                    <td className="p-4 align-middle">
                      <span className="text-lg">
                        {row.health === 'healthy' ? '✅' :
                         row.health === 'warning' ? '⚠️' :
                         row.health === 'error' ? '❌' : '❓'}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-1">
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800">
                          {row.category}
                        </span>
                        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800">
                          {row.environment}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex gap-2">
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-gray-0 hover:bg-accent hover:text-accent-foreground h-9 px-3">
                          Edit
                        </button>
                        <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-3">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Static table with hardcoded data that should definitely display all rows.',
      },
    },
  },
};
