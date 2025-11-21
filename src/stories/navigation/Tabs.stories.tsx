import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, Settings, Bell, CreditCard, User } from 'lucide-react';

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Tabs organize content into separate views where only one view is visible at a time. They feature a smooth animated indicator that slides between tabs using Framer Motion. Use tabs to organize related content and reduce clutter, making it easier for users to find what they need without leaving the page.`,
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
    defaultValue: {
      control: { type: 'text' },
      description: 'The value of the tab that should be active by default',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the active tab',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    onValueChange: {
      description: 'Callback fired when the active tab changes',
      table: {
        type: { summary: '(value: string) => void' },
        category: 'Events',
      },
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'The orientation of the tabs',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'horizontal' },
        category: 'Layout',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic Variants
 *
 * Core tab configurations.
 *
 * Default two-tab layout.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Account</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Make changes to your account here. Click save when you're done.
          </p>
          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            />
          </div>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Password</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Change your password here. After saving, you'll be logged out.
          </p>
          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Current Password</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900"
            />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic two-tab layout with smooth animated indicator. Click between tabs to see the animation.',
      },
    },
  },
};

/**
 * Three-tab configuration.
 */
export const ThreeTabs: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="overview" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="reports">Reports</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Overview</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Get a high-level view of your dashboard metrics and key performance indicators.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Total Users</h4>
              <p className="text-2xl font-bold text-gray-900">1,234</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-900">Revenue</h4>
              <p className="text-2xl font-bold text-gray-900">$12,345</p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Detailed analytics and insights about your application usage.
          </p>
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <p className="text-[0.8125rem] text-gray-600">Analytics content would go here...</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="reports">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Reports</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Generate and download various reports for your business needs.
          </p>
          <div className="mt-4 p-4 border border-gray-200 rounded-lg">
            <p className="text-[0.8125rem] text-gray-600">Reports content would go here...</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Three-tab configuration showing dashboard sections.',
      },
    },
  },
};

/**
 * Four tabs showing more navigation options.
 */
export const FourTabs: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="general" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      <TabsContent value="general">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Configure your general application preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="security">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Security</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your security settings and two-factor authentication.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Control how and when you receive notifications.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Billing</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your subscription and payment methods.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Four-tab configuration for settings pages with multiple sections.',
      },
    },
  },
};

/**
 * ### States
 *
 * Different tab states and behaviors.
 *
 * Tab with disabled state.
 */
export const WithDisabled: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="active" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
        <TabsTrigger value="another">Another</TabsTrigger>
      </TabsList>
      <TabsContent value="active">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Active Tab</h3>
          <p className="text-[0.8125rem] text-gray-600">This is the active tab content.</p>
        </div>
      </TabsContent>
      <TabsContent value="disabled">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Disabled Tab</h3>
          <p className="text-[0.8125rem] text-gray-600">
            This tab is disabled and cannot be accessed.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="another">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Another Tab</h3>
          <p className="text-[0.8125rem] text-gray-600">This is another tab with content.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs can be disabled to prevent interaction when content is unavailable or access is restricted.',
      },
    },
  },
};

/**
 * ### With Icons
 *
 * Tabs enhanced with icons for better visual recognition.
 *
 * Tabs with leading icons.
 */
export const WithIcons: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="profile" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="profile" className="gap-2">
          <User className="w-4 h-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger value="settings" className="gap-2">
          <Settings className="w-4 h-4" />
          Settings
        </TabsTrigger>
        <TabsTrigger value="billing" className="gap-2">
          <CreditCard className="w-4 h-4" />
          Billing
        </TabsTrigger>
        <TabsTrigger value="notifications" className="gap-2">
          <Bell className="w-4 h-4" />
          Notifications
        </TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Profile</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your profile information and preferences.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Configure your application settings.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Billing</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your subscription and payment methods.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Control notification preferences.
          </p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tabs with icons provide better visual recognition and make navigation more intuitive.',
      },
    },
  },
};

/**
 * Icon-only tabs for compact navigation.
 */
export const IconOnly: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="files" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="files" title="Files">
          <FileText className="w-4 h-4" />
        </TabsTrigger>
        <TabsTrigger value="settings" title="Settings">
          <Settings className="w-4 h-4" />
        </TabsTrigger>
        <TabsTrigger value="notifications" title="Notifications">
          <Bell className="w-4 h-4" />
        </TabsTrigger>
        <TabsTrigger value="billing" title="Billing">
          <CreditCard className="w-4 h-4" />
        </TabsTrigger>
      </TabsList>
      <TabsContent value="files">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Files</h3>
          <p className="text-[0.8125rem] text-gray-600">Manage your files and documents.</p>
        </div>
      </TabsContent>
      <TabsContent value="settings">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Settings</h3>
          <p className="text-[0.8125rem] text-gray-600">Configure application settings.</p>
        </div>
      </TabsContent>
      <TabsContent value="notifications">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          <p className="text-[0.8125rem] text-gray-600">View and manage notifications.</p>
        </div>
      </TabsContent>
      <TabsContent value="billing">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Billing</h3>
          <p className="text-[0.8125rem] text-gray-600">Manage billing and subscriptions.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only tabs save space while maintaining clear navigation. Hover to see tooltips.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world usage patterns.
 *
 * Settings page with multiple sections.
 */
export const SettingsPage: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="general" className="w-[600px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your general application preferences.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Language</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]">
              <option>English</option>
              <option>Spanish</option>
              <option>French</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Timezone</label>
            <select className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]">
              <option>UTC</option>
              <option>EST</option>
              <option>PST</option>
            </select>
          </div>

          <Button>Save Changes</Button>
        </div>
      </TabsContent>

      <TabsContent value="account" className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
          <p className="text-[0.8125rem] text-gray-600">Update your account details.</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Email</label>
            <input
              type="email"
              defaultValue="user@example.com"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Display Name</label>
            <input
              type="text"
              defaultValue="John Doe"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]"
            />
          </div>

          <Button>Update Account</Button>
        </div>
      </TabsContent>

      <TabsContent value="security" className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
          <p className="text-[0.8125rem] text-gray-600">
            Manage your password and security preferences.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">Current Password</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[0.8125rem] font-medium text-gray-900">New Password</label>
            <input
              type="password"
              className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem]"
            />
          </div>

          <Button>Change Password</Button>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Complete settings page example with multiple sections and form controls.',
      },
    },
  },
};

/**
 * Dashboard with data visualizations.
 */
export const Dashboard: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="overview" className="w-[700px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Dashboard Overview</h3>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-[0.8125rem] text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">2,543</p>
              <p className="text-xs text-green-600">+12% from last month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-[0.8125rem] text-gray-600">Revenue</p>
              <p className="text-3xl font-bold text-gray-900">$45,231</p>
              <p className="text-xs text-green-600">+8% from last month</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <p className="text-[0.8125rem] text-gray-600">Active Sessions</p>
              <p className="text-3xl font-bold text-gray-900">892</p>
              <p className="text-xs text-amber-600">-3% from last week</p>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="analytics">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Analytics</h3>
          <div className="h-64 border border-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-600">Chart visualization would go here</p>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="activity">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-3 border border-gray-200 rounded-lg">
                <p className="text-[0.8125rem] font-medium text-gray-900">
                  Activity Item {i}
                </p>
                <p className="text-xs text-gray-600">Description of the activity</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Dashboard example with metrics, analytics, and activity feed sections.',
      },
    },
  },
};

/**
 * Compact tabs for mobile or constrained spaces.
 */
export const Compact: Story = {
  tags: ['!dev'],
  render: () => (
    <Tabs defaultValue="all" className="w-[300px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="archived">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="all">
        <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">All Items</h4>
          <p className="text-xs text-gray-600">Showing all items in your list</p>
        </div>
      </TabsContent>
      <TabsContent value="active">
        <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Active Items</h4>
          <p className="text-xs text-gray-600">Showing only active items</p>
        </div>
      </TabsContent>
      <TabsContent value="archived">
        <div className="space-y-2 p-4 border border-gray-200 rounded-lg">
          <h4 className="font-medium text-gray-900">Archived Items</h4>
          <p className="text-xs text-gray-600">Showing archived items</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact tab layout optimized for mobile or constrained spaces with equal-width tabs.',
      },
    },
  },
};
