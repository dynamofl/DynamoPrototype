import type { Meta, StoryObj } from '@storybook/react';
import { MemoryRouter } from 'react-router-dom';
import { SidebarPattern } from '@/components/patterns/ui-patterns/sidebar-pattern';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Users, KeyRound, Settings, Home, BarChart3 } from 'lucide-react';

const meta: Meta<typeof SidebarPattern> = {
  title: 'Patterns/SidebarPattern',
  component: SidebarPattern,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'settings'],
      description: 'Sidebar variant',
    },
    backButton: {
      control: 'object',
      description: 'Back button configuration',
    },
    groups: {
      control: 'object',
      description: 'Sidebar groups configuration',
    },
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

// Sample data for different sidebar configurations
const settingsGroups = [
  {
    label: 'Settings',
    items: [
      {
        id: 'team-members',
        label: 'Team Members',
        icon: <Users className="h-4 w-4" />,
        onClick: () => console.log('Navigate to team members'),
        isActive: false
      },
      {
        id: 'access-token',
        label: 'Access Token & API Keys',
        icon: <KeyRound className="h-4 w-4" />,
        onClick: () => console.log('Navigate to access tokens'),
        isActive: true
      }
    ]
  }
];

const navigationGroups = [
  {
    label: 'Main',
    items: [
      {
        id: 'home',
        label: 'Home',
        icon: <Home className="h-4 w-4" />,
        onClick: () => console.log('Navigate to home'),
        isActive: true
      },
      {
        id: 'analytics',
        label: 'Analytics',
        icon: <BarChart3 className="h-4 w-4" />,
        onClick: () => console.log('Navigate to analytics'),
        isActive: false
      }
    ]
  },
  {
    label: 'Settings',
    items: [
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="h-4 w-4" />,
        onClick: () => console.log('Navigate to settings'),
        isActive: false
      }
    ]
  }
];

export const Default: Story = {
  args: {
    variant: 'default',
    groups: navigationGroups,
  },
};

export const SettingsSidebar: Story = {
  args: {
    variant: 'settings',
    backButton: {
      label: 'Back to App',
      defaultPath: '/ai-systems'
    },
    groups: settingsGroups,
  },
};

export const WithBackButton: Story = {
  args: {
    variant: 'default',
    backButton: {
      label: 'Back to Dashboard',
      onClick: () => console.log('Custom back action')
    },
    groups: navigationGroups,
  },
};

export const MultipleGroups: Story = {
  args: {
    variant: 'default',
    groups: [
      ...navigationGroups,
      {
        label: 'Tools',
        items: [
          {
            id: 'export',
            label: 'Export Data',
            icon: <BarChart3 className="h-4 w-4" />,
            onClick: () => console.log('Export data'),
            isActive: false
          }
        ]
      }
    ],
  },
};
