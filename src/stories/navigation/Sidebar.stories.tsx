import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarPattern } from '@/components/patterns/ui-patterns/sidebar-pattern';
import type { SidebarGroup } from '@/components/patterns/ui-patterns/sidebar-pattern';
import { SidebarProvider } from '@/components/ui/sidebar';
import {
  Users,
  KeyRound,
  Settings,
  Home,
  BarChart3,
  FileText,
  Shield,
  Bell,
  CreditCard,
  HelpCircle,
  Box,
  Folder,
  Database,
  Download
} from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof SidebarPattern> = {
  title: 'Navigation/Sidebar',
  component: SidebarPattern,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `The Sidebar component provides vertical navigation for application sections or settings. It supports grouping navigation items, active states with visual indicators, and an optional back button for nested navigation. The sidebar uses a clean, minimal design with hover states and smooth transitions.`,
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
      <MemoryRouter>
        <SidebarProvider>
          <Story />
        </SidebarProvider>
      </MemoryRouter>
    ),
  ],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'settings'],
      description: 'Visual variant of the sidebar',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    backButton: {
      description: 'Back button configuration with label and navigation',
      table: {
        type: { summary: '{ label: string, onClick?: () => void, defaultPath?: string }' },
        category: 'Navigation',
      },
    },
    groups: {
      description: 'Array of sidebar groups with navigation items',
      table: {
        type: { summary: 'SidebarGroup[]' },
        category: 'Content',
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        category: 'Appearance',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic Variants
 *
 * Core sidebar configurations.
 *
 * Default sidebar with basic navigation.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
    groups: [
      {
        label: 'Main',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-4 w-4" />,
            onClick: () => console.log('Navigate to home'),
            isActive: true,
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => console.log('Navigate to analytics'),
            isActive: false,
          },
          {
            id: 'documents',
            label: 'Documents',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => console.log('Navigate to documents'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic sidebar with navigation items. The active item is highlighted with background color.',
      },
    },
  },
};

/**
 * Settings sidebar variant with back button.
 */
export const SettingsSidebar: Story = {
  tags: ['!dev'],
  args: {
    variant: 'settings',
    backButton: {
      label: 'Back to App',
      defaultPath: '/ai-systems',
    },
    groups: [
      {
        label: 'Settings',
        items: [
          {
            id: 'team-members',
            label: 'Team Members',
            icon: <Users className="h-4 w-4" />,
            onClick: () => console.log('Navigate to team members'),
            isActive: false,
          },
          {
            id: 'access-token',
            label: 'Access Token & API Keys',
            icon: <KeyRound className="h-4 w-4" />,
            onClick: () => console.log('Navigate to access tokens'),
            isActive: true,
          },
          {
            id: 'evaluation',
            label: 'Internal Models Usage',
            icon: <Box className="h-4 w-4" />,
            onClick: () => console.log('Navigate to evaluation'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Settings variant with back button for returning to the main app. Matches the actual Settings page sidebar.',
      },
    },
  },
};

/**
 * ### Multiple Groups
 *
 * Sidebars with multiple navigation sections.
 *
 * Sidebar with multiple grouped sections.
 */
export const MultipleGroups: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
    groups: [
      {
        label: 'Main',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-4 w-4" />,
            onClick: () => console.log('Navigate to home'),
            isActive: true,
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => console.log('Navigate to analytics'),
            isActive: false,
          },
        ],
      },
      {
        label: 'Content',
        items: [
          {
            id: 'documents',
            label: 'Documents',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => console.log('Navigate to documents'),
            isActive: false,
          },
          {
            id: 'folders',
            label: 'Folders',
            icon: <Folder className="h-4 w-4" />,
            onClick: () => console.log('Navigate to folders'),
            isActive: false,
          },
        ],
      },
      {
        label: 'Settings',
        items: [
          {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => console.log('Navigate to settings'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with multiple labeled groups organizing navigation items by category.',
      },
    },
  },
};

/**
 * ### With Back Button
 *
 * Sidebars with navigation back functionality.
 *
 * Sidebar with custom back button action.
 */
export const WithBackButton: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
    backButton: {
      label: 'Back to Dashboard',
      onClick: () => console.log('Custom back action'),
    },
    groups: [
      {
        label: 'Main',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-4 w-4" />,
            onClick: () => console.log('Navigate to home'),
            isActive: true,
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => console.log('Navigate to analytics'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Sidebar with back button that triggers a custom onClick action instead of navigation.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world sidebar configurations.
 *
 * Interactive settings sidebar.
 */
export const InteractiveSettings: Story = {
  tags: ['!dev'],
  render: () => {
    const [activePage, setActivePage] = useState('team-members');

    const groups: SidebarGroup[] = [
      {
        label: 'Settings',
        items: [
          {
            id: 'team-members',
            label: 'Team Members',
            icon: <Users className="h-4 w-4" />,
            onClick: () => setActivePage('team-members'),
            isActive: activePage === 'team-members',
          },
          {
            id: 'access-token',
            label: 'Access Token & API Keys',
            icon: <KeyRound className="h-4 w-4" />,
            onClick: () => setActivePage('access-token'),
            isActive: activePage === 'access-token',
          },
          {
            id: 'evaluation',
            label: 'Internal Models Usage',
            icon: <Box className="h-4 w-4" />,
            onClick: () => setActivePage('evaluation'),
            isActive: activePage === 'evaluation',
          },
        ],
      },
    ];

    return (
      <div className="flex h-screen">
        <SidebarPattern
          variant="settings"
          backButton={{
            label: 'Back to App',
            onClick: () => console.log('Back to app'),
          }}
          groups={groups}
        />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {activePage === 'team-members' && 'Team Members'}
              {activePage === 'access-token' && 'Access Token & API Keys'}
              {activePage === 'evaluation' && 'Internal Models Usage'}
            </h1>
            <p className="text-gray-600">
              {activePage === 'team-members' && 'Manage your team members and their permissions.'}
              {activePage === 'access-token' && 'Generate and manage API keys for accessing your account.'}
              {activePage === 'evaluation' && 'Configure internal model usage settings.'}
            </p>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive settings sidebar that updates the content area. Click different items to see the active state change.',
      },
    },
  },
};

/**
 * Dashboard sidebar with multiple sections.
 */
export const DashboardSidebar: Story = {
  tags: ['!dev'],
  render: () => {
    const [activeItem, setActiveItem] = useState('overview');

    const groups: SidebarGroup[] = [
      {
        label: 'Dashboard',
        items: [
          {
            id: 'overview',
            label: 'Overview',
            icon: <Home className="h-4 w-4" />,
            onClick: () => setActiveItem('overview'),
            isActive: activeItem === 'overview',
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => setActiveItem('analytics'),
            isActive: activeItem === 'analytics',
          },
        ],
      },
      {
        label: 'Data',
        items: [
          {
            id: 'documents',
            label: 'Documents',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => setActiveItem('documents'),
            isActive: activeItem === 'documents',
          },
          {
            id: 'database',
            label: 'Database',
            icon: <Database className="h-4 w-4" />,
            onClick: () => setActiveItem('database'),
            isActive: activeItem === 'database',
          },
        ],
      },
      {
        label: 'Account',
        items: [
          {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => setActiveItem('settings'),
            isActive: activeItem === 'settings',
          },
          {
            id: 'billing',
            label: 'Billing',
            icon: <CreditCard className="h-4 w-4" />,
            onClick: () => setActiveItem('billing'),
            isActive: activeItem === 'billing',
          },
        ],
      },
    ];

    return (
      <div className="flex h-screen">
        <SidebarPattern variant="default" groups={groups} />
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-4 capitalize">
              {activeItem}
            </h1>
            <div className="bg-gray-0 border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600">Content for {activeItem} section</p>
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete dashboard example with sidebar navigation and multiple grouped sections.',
      },
    },
  },
};

/**
 * Admin panel sidebar.
 */
export const AdminPanel: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
    groups: [
      {
        label: 'Overview',
        items: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            icon: <Home className="h-4 w-4" />,
            onClick: () => console.log('Dashboard'),
            isActive: true,
          },
        ],
      },
      {
        label: 'Management',
        items: [
          {
            id: 'users',
            label: 'Users',
            icon: <Users className="h-4 w-4" />,
            onClick: () => console.log('Users'),
            isActive: false,
          },
          {
            id: 'security',
            label: 'Security',
            icon: <Shield className="h-4 w-4" />,
            onClick: () => console.log('Security'),
            isActive: false,
          },
        ],
      },
      {
        label: 'System',
        items: [
          {
            id: 'notifications',
            label: 'Notifications',
            icon: <Bell className="h-4 w-4" />,
            onClick: () => console.log('Notifications'),
            isActive: false,
          },
          {
            id: 'exports',
            label: 'Export Data',
            icon: <Download className="h-4 w-4" />,
            onClick: () => console.log('Exports'),
            isActive: false,
          },
          {
            id: 'help',
            label: 'Help & Support',
            icon: <HelpCircle className="h-4 w-4" />,
            onClick: () => console.log('Help'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Admin panel sidebar with multiple sections for different management areas.',
      },
    },
  },
};

/**
 * Compact sidebar with minimal items.
 */
export const Compact: Story = {
  tags: ['!dev'],
  args: {
    variant: 'default',
    groups: [
      {
        label: 'Navigation',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-4 w-4" />,
            onClick: () => console.log('Home'),
            isActive: true,
          },
          {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => console.log('Settings'),
            isActive: false,
          },
        ],
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story: 'Minimal sidebar with just a few essential navigation items.',
      },
    },
  },
};

/**
 * Full application example.
 */
export const FullApplication: Story = {
  tags: ['!dev'],
  render: () => {
    const [activeItem, setActiveItem] = useState('home');

    const groups: SidebarGroup[] = [
      {
        label: 'Main',
        items: [
          {
            id: 'home',
            label: 'Home',
            icon: <Home className="h-4 w-4" />,
            onClick: () => setActiveItem('home'),
            isActive: activeItem === 'home',
          },
          {
            id: 'analytics',
            label: 'Analytics',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => setActiveItem('analytics'),
            isActive: activeItem === 'analytics',
          },
          {
            id: 'documents',
            label: 'Documents',
            icon: <FileText className="h-4 w-4" />,
            onClick: () => setActiveItem('documents'),
            isActive: activeItem === 'documents',
          },
        ],
      },
      {
        label: 'Settings',
        items: [
          {
            id: 'settings',
            label: 'Settings',
            icon: <Settings className="h-4 w-4" />,
            onClick: () => setActiveItem('settings'),
            isActive: activeItem === 'settings',
          },
          {
            id: 'help',
            label: 'Help',
            icon: <HelpCircle className="h-4 w-4" />,
            onClick: () => setActiveItem('help'),
            isActive: activeItem === 'help',
          },
        ],
      },
    ];

    return (
      <div className="flex h-screen">
        <SidebarPattern
          variant="default"
          backButton={{
            label: 'Back to Projects',
            onClick: () => console.log('Back'),
          }}
          groups={groups}
        />
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="border-b border-gray-200 bg-gray-0 px-8 py-4">
            <h1 className="text-xl font-semibold text-gray-900 capitalize">{activeItem}</h1>
          </header>

          {/* Content */}
          <main className="p-8">
            <div className="max-w-6xl">
              {activeItem === 'home' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-6 bg-gray-0 border border-gray-200 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">1,234</p>
                    </div>
                    <div className="p-6 bg-gray-0 border border-gray-200 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">$12,345</p>
                    </div>
                    <div className="p-6 bg-gray-0 border border-gray-200 rounded-lg">
                      <h3 className="text-sm font-medium text-gray-600">Active</h3>
                      <p className="text-3xl font-bold text-gray-900 mt-2">892</p>
                    </div>
                  </div>
                </div>
              )}
              {activeItem !== 'home' && (
                <div className="bg-gray-0 border border-gray-200 rounded-lg p-6">
                  <p className="text-gray-600">Content for {activeItem} section</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete application layout with sidebar, header, and main content area. Shows real-world integration.',
      },
    },
  },
};
