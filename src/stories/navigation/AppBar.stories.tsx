import type { Meta, StoryObj } from '@storybook/react';
import { AppBar } from '@/components/patterns/ui-patterns/app-bar';
import type { BreadcrumbItem, AppBarActionButton } from '@/components/patterns/ui-patterns/app-bar';
import { MemoryRouter } from 'react-router-dom';
import { Play, Settings } from 'lucide-react';
import { useState } from 'react';

// Wrapper to provide routing context
const AppBarWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <MemoryRouter initialEntries={['/ai-systems']}>
      {children}
    </MemoryRouter>
  );
};

const meta: Meta<typeof AppBar> = {
  title: 'Navigation/App Bar',
  component: AppBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `The AppBar component provides top-level navigation for the application. It supports two variants: a default variant with main navigation links, and a breadcrumb variant for hierarchical navigation within specific sections. The component includes profile management, theme switching, and support for custom action buttons.`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <AppBarWrapper>
        <Story />
      </AppBarWrapper>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'breadcrumb'],
      description: 'Visual variant of the app bar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    breadcrumbs: {
      description: 'Array of breadcrumb items for navigation hierarchy',
      table: {
        type: { summary: 'BreadcrumbItem[]' },
        category: 'Navigation',
      },
    },
    currentSection: {
      description: 'Current section information with optional dropdown',
      table: {
        type: { summary: 'object' },
        category: 'Navigation',
      },
    },
    actionButtons: {
      description: 'Array of action buttons displayed in the app bar',
      table: {
        type: { summary: 'AppBarActionButton[]' },
        category: 'Actions',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic Variants
 *
 * Core app bar configurations.
 *
 * Default variant with main navigation links.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
  },
  parameters: {
    docs: {
      description: {
        story: 'Default app bar showing main navigation with Projects, AI Systems, and Policies links. Includes Beta Features access and profile dropdown with theme controls.',
      },
    },
  },
};

/**
 * Simple breadcrumb variant without navigation.
 */
export const BreadcrumbSimple: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
  },
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb variant showing just the logo with Beta Features and profile controls.',
      },
    },
  },
};

/**
 * ### Breadcrumb Navigation
 *
 * Hierarchical navigation patterns.
 *
 * Breadcrumb with navigation trail.
 */
export const WithBreadcrumbs: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
      { name: 'Customer Support Bot', path: '/ai-systems/123', current: true },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb navigation showing the current location within the app hierarchy. Breadcrumb items are clickable links except for the current page.',
      },
    },
  },
};

/**
 * Breadcrumb with current section display.
 */
export const WithCurrentSection: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Breadcrumb with a highlighted current section showing the active item.',
      },
    },
  },
};

/**
 * Current section with badge indicator.
 */
export const WithBadge: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
      badge: 'v2.1',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Current section with a badge showing version or status information.',
      },
    },
  },
};

/**
 * Current section with dropdown selection.
 */
export const WithDropdown: Story = {
  tags: ['!dev'],
  render: () => {
    const [selectedId, setSelectedId] = useState('system-1');

    const dropdownOptions = [
      { id: 'system-1', name: 'Customer Support Bot', isActive: selectedId === 'system-1' },
      { id: 'system-2', name: 'Sales Assistant', isActive: selectedId === 'system-2' },
      { id: 'system-3', name: 'Content Generator', isActive: selectedId === 'system-3' },
    ];

    return (
      <AppBar
        variant="breadcrumb"
        breadcrumbs={[
          { name: 'AI Systems', path: '/ai-systems' },
        ]}
        currentSection={{
          name: dropdownOptions.find(opt => opt.id === selectedId)?.name || 'Customer Support Bot',
          badge: 'v2.1',
          dropdownOptions,
          onDropdownSelect: (id) => {
            setSelectedId(id);
            console.log('Selected:', id);
          },
        }}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive dropdown allowing users to switch between different items (e.g., different AI systems). Click the chevron icon to see available options.',
      },
    },
  },
};

/**
 * ### Action Buttons
 *
 * Custom actions in the app bar.
 *
 * Single primary action button.
 */
export const WithActionButton: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
    },
    actionButtons: [
      {
        label: 'Run Test',
        onClick: () => console.log('Run test clicked'),
        variant: 'primary',
        icon: <Play className="w-3 h-3" />,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'App bar with a primary action button for quick access to key functionality.',
      },
    },
  },
};

/**
 * Multiple action buttons with different variants.
 */
export const MultipleActions: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
    },
    actionButtons: [
      {
        label: 'Settings',
        onClick: () => console.log('Settings clicked'),
        variant: 'secondary',
        icon: <Settings className="w-3 h-3" />,
      },
      {
        label: 'Run Test',
        onClick: () => console.log('Run test clicked'),
        variant: 'primary',
        icon: <Play className="w-3 h-3" />,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Multiple action buttons showing both primary and secondary actions.',
      },
    },
  },
};

/**
 * Action button in loading state.
 */
export const LoadingAction: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
    },
    actionButtons: [
      {
        label: 'Running...',
        onClick: () => console.log('Run test clicked'),
        variant: 'primary',
        icon: <Play className="w-3 h-3" />,
        loading: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Action button showing loading state during async operations.',
      },
    },
  },
};

/**
 * Disabled action button.
 */
export const DisabledAction: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
    ],
    currentSection: {
      name: 'Customer Support Bot',
    },
    actionButtons: [
      {
        label: 'Run Test',
        onClick: () => console.log('Run test clicked'),
        variant: 'primary',
        icon: <Play className="w-3 h-3" />,
        disabled: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Disabled action button when the action is not currently available.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Complete real-world examples.
 *
 * Complete evaluation page navigation.
 */
export const EvaluationPage: Story = {
  tags: ['!dev'],
  render: () => {
    const [selectedId, setSelectedId] = useState('eval-1');

    const evaluations = [
      { id: 'eval-1', name: 'Production Test - Jan 15', isActive: selectedId === 'eval-1' },
      { id: 'eval-2', name: 'Staging Test - Jan 14', isActive: selectedId === 'eval-2' },
      { id: 'eval-3', name: 'Development Test - Jan 13', isActive: selectedId === 'eval-3' },
    ];

    return (
      <AppBar
        variant="breadcrumb"
        breadcrumbs={[
          { name: 'AI Systems', path: '/ai-systems' },
          { name: 'Customer Support Bot', path: '/ai-systems/123' },
        ]}
        currentSection={{
          name: evaluations.find(e => e.id === selectedId)?.name || 'Production Test - Jan 15',
          dropdownOptions: evaluations,
          onDropdownSelect: (id) => {
            setSelectedId(id);
            console.log('Selected evaluation:', id);
          },
        }}
        actionButtons={[
          {
            label: 'Settings',
            onClick: () => console.log('Settings clicked'),
            variant: 'secondary',
            icon: <Settings className="w-3 h-3" />,
          },
          {
            label: 'Run Evaluation',
            onClick: () => console.log('Run evaluation clicked'),
            variant: 'primary',
            icon: <Play className="w-3 h-3" />,
          },
        ]}
      />
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete example showing an evaluation page with breadcrumb navigation, evaluation selector dropdown, and action buttons.',
      },
    },
  },
};

/**
 * System configuration page.
 */
export const SystemConfiguration: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
      { name: 'Customer Support Bot', path: '/ai-systems/123' },
    ],
    currentSection: {
      name: 'Configuration',
    },
    actionButtons: [
      {
        label: 'Save Changes',
        onClick: () => console.log('Save clicked'),
        variant: 'primary',
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Configuration page showing deep navigation hierarchy with save action.',
      },
    },
  },
};

/**
 * Multiple breadcrumb levels.
 */
export const DeepNavigation: Story = {
  tags: ['!dev'],
  args: {
    variant: 'breadcrumb',
    breadcrumbs: [
      { name: 'AI Systems', path: '/ai-systems' },
      { name: 'Customer Support Bot', path: '/ai-systems/123' },
      { name: 'Evaluations', path: '/ai-systems/123/evaluations' },
      { name: 'Test Results', path: '/ai-systems/123/evaluations/456' },
    ],
    currentSection: {
      name: 'Conversation #42',
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Deep navigation hierarchy with multiple breadcrumb levels showing complex app structure.',
      },
    },
  },
};

/**
 * Comparison of both variants.
 */
export const VariantComparison: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-900 px-6">Default Variant</h4>
        <AppBar variant="default" />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-2 text-gray-900 px-6">Breadcrumb Variant</h4>
        <AppBar
          variant="breadcrumb"
          breadcrumbs={[
            { name: 'AI Systems', path: '/ai-systems' },
            { name: 'Customer Support Bot', path: '/ai-systems/123' },
          ]}
          currentSection={{
            name: 'Evaluation Results',
            badge: 'Live',
          }}
          actionButtons={[
            {
              label: 'Run Test',
              onClick: () => console.log('Run test'),
              variant: 'primary',
              icon: <Play className="w-3 h-3" />,
            },
          ]}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of default and breadcrumb variants showing their different use cases.',
      },
    },
  },
};
