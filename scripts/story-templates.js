/**
 * Story Templates for Different Component Types
 */

const STORY_TEMPLATES = {
  // Basic component template
  default: `import type { Meta, StoryObj } from '@storybook/react';
import { {COMPONENT_NAME} } from '@/components/patterns/ui-patterns/{FILE_NAME}';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Patterns/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add your component's props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
`,

  // Icon component template
  icon: `import type { Meta, StoryObj } from '@storybook/react';
import { {COMPONENT_NAME} } from '@/components/patterns/ui-patterns/{FILE_NAME}';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Patterns/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    className: '',
  },
};

export const WithCustomSize: Story = {
  args: {
    className: 'w-12 h-12',
  },
};
`,

  // Dialog/Sheet component template
  dialog: `import type { Meta, StoryObj } from '@storybook/react';
import { {COMPONENT_NAME} } from '@/components/patterns/ui-patterns/{FILE_NAME}';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Patterns/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback when open state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DialogWrapper = (args) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <{COMPONENT_NAME} 
        {...args} 
        open={open} 
        onOpenChange={setOpen}
      />
    </div>
  );
};

export const Default: Story = {
  render: DialogWrapper,
  args: {
    title: 'Example Dialog',
    description: 'This is an example dialog component',
  },
};
`,

  // Table component template
  table: `import type { Meta, StoryObj } from '@storybook/react';
import { {COMPONENT_NAME} } from '@/components/patterns/ui-patterns/{FILE_NAME}';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Patterns/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    data: {
      control: 'object',
      description: 'Table data',
    },
    columns: {
      control: 'object',
      description: 'Table columns configuration',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Sample data for stories
const sampleData = [
  { id: 1, name: 'Item 1', status: 'active' },
  { id: 2, name: 'Item 2', status: 'inactive' },
  { id: 3, name: 'Item 3', status: 'pending' },
];

const sampleColumns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Name' },
  { key: 'status', label: 'Status' },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: sampleColumns,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: sampleColumns,
  },
};
`,

  // Navigation component template
  navigation: `import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { {COMPONENT_NAME} } from '@/components/patterns/ui-patterns/{FILE_NAME}';

const meta: Meta<typeof {COMPONENT_NAME}> = {
  title: 'Patterns/{COMPONENT_NAME}',
  component: {COMPONENT_NAME},
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add navigation-specific props here
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default navigation props here
  },
};
`,
};

// Component type detection based on filename
function detectComponentType(fileName) {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('icon')) return 'icon';
  if (lowerFileName.includes('dialog') || lowerFileName.includes('sheet')) return 'dialog';
  if (lowerFileName.includes('table')) return 'table';
  if (lowerFileName.includes('bar') || lowerFileName.includes('breadcrumb') || lowerFileName.includes('nav')) return 'navigation';
  
  return 'default';
}

function getStoryTemplate(componentName, fileName) {
  const componentType = detectComponentType(fileName);
  return STORY_TEMPLATES[componentType] || STORY_TEMPLATES.default;
}

export {
  getStoryTemplate,
  detectComponentType,
};
