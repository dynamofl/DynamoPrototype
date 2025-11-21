import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Info, AlertCircle, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Alerts display brief, important messages in a way that attracts the user's attention without interrupting their current task. They provide contextual feedback messages for user actions with minimal visual disruption. Use alerts for inline notifications, validation messages, or system status updates that don't require immediate action.`,
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
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive'],
      description: 'Visual style variant for the alert',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes for styling',
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
 * Simple alert configurations showing core functionality.
 *
 * Default alert with standard styling.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <AlertTitle>Heads Up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the CLI.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic alert with default styling, ideal for general informational messages.',
      },
    },
  },
};

/**
 * Destructive alert for errors and warnings.
 */
export const Destructive: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert variant="destructive" className="w-96">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Red-themed alert for error messages and critical notifications.',
      },
    },
  },
};

/**
 * Alert without title, showing only description.
 */
export const WithoutTitle: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <AlertDescription>
        This alert doesn't have a title, just a description.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Minimal alert showing only the description text without a title.',
      },
    },
  },
};

/**
 * Alert with longer content demonstrating text wrapping.
 */
export const LongContent: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <AlertTitle>System Maintenance</AlertTitle>
      <AlertDescription>
        We will be performing scheduled maintenance on our servers from 2:00 AM to 4:00 AM EST on Sunday, December 15th.
        During this time, some features may be temporarily unavailable. We apologize for any inconvenience this may cause.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with longer text content that wraps across multiple lines.',
      },
    },
  },
};

/**
 * ### With Icons
 *
 * Alerts with icons for enhanced visual communication.
 *
 * Informational alert with info icon.
 */
export const WithInfoIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <Info className="h-4 w-4" />
      <AlertTitle>Information</AlertTitle>
      <AlertDescription>
        This is an informational alert with an icon.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with info icon for informational messages.',
      },
    },
  },
};

/**
 * Success alert with check circle icon.
 */
export const WithSuccessIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <CheckCircle className="h-4 w-4 text-green-600" />
      <AlertTitle>Success</AlertTitle>
      <AlertDescription>
        Your changes have been saved successfully.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with success icon for positive confirmations.',
      },
    },
  },
};

/**
 * Warning alert with triangle icon.
 */
export const WithWarningIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert className="w-96">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle>Warning</AlertTitle>
      <AlertDescription>
        This action cannot be undone. Please proceed with caution.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert with warning icon for cautionary messages.',
      },
    },
  },
};

/**
 * Destructive alert with error icon.
 */
export const DestructiveWithIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Alert variant="destructive" className="w-96">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        This is a destructive alert with an error icon.
      </AlertDescription>
    </Alert>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Destructive alert with error icon for critical alerts.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world usage patterns and complete implementations.
 *
 * Comparison of all alert variants.
 */
export const AllVariants: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Default Alert</AlertTitle>
        <AlertDescription>
          This is a default alert with standard styling.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Destructive Alert</AlertTitle>
        <AlertDescription>
          This is a destructive alert for errors and warnings.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Side-by-side comparison of default and destructive alert variants.',
      },
    },
  },
};

/**
 * Form validation alerts showing different states.
 */
export const FormValidation: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-6 w-96">
      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-900">Success State</h4>
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Form Submitted</AlertTitle>
          <AlertDescription>
            Your form has been submitted successfully.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-900">Warning State</h4>
        <Alert>
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle>Incomplete Information</AlertTitle>
          <AlertDescription>
            Some optional fields are empty. You can still submit the form.
          </AlertDescription>
        </Alert>
      </div>

      <div>
        <h4 className="text-sm font-medium mb-2 text-gray-900">Error State</h4>
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Validation Failed</AlertTitle>
          <AlertDescription>
            Please fix the errors below before submitting.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example showing alerts for different form validation states: success, warning, and error.',
      },
    },
  },
};

/**
 * System status alerts for different conditions.
 */
export const SystemStatus: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>System Update Available</AlertTitle>
        <AlertDescription>
          A new version is available. Update now to get the latest features.
        </AlertDescription>
      </Alert>

      <Alert>
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle>Scheduled Maintenance</AlertTitle>
        <AlertDescription>
          System will be under maintenance tonight from 11 PM to 2 AM.
        </AlertDescription>
      </Alert>

      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertTitle>All Systems Operational</AlertTitle>
        <AlertDescription>
          All services are running normally.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'System status notifications showing updates, maintenance, and operational status.',
      },
    },
  },
};

/**
 * Alerts with action buttons and links.
 */
export const WithActions: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-96">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>New Features Available</AlertTitle>
        <AlertDescription className="mt-2">
          Check out our latest updates and improvements.
          <div className="mt-3 flex gap-2">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-0 bg-gray-900 rounded hover:bg-gray-800 transition-colors">
              Learn More
            </button>
            <button className="px-3 py-1.5 text-xs font-medium text-gray-900 border border-gray-300 rounded hover:bg-gray-50 transition-colors">
              Dismiss
            </button>
          </div>
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Connection Failed</AlertTitle>
        <AlertDescription className="mt-2">
          Unable to connect to the server. Please try again.
          <div className="mt-3">
            <button className="px-3 py-1.5 text-xs font-medium text-gray-0 bg-red-600 rounded hover:bg-red-700 transition-colors">
              Retry Connection
            </button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alerts with embedded action buttons for user interaction.',
      },
    },
  },
};

/**
 * Compact alerts without titles for minimal space usage.
 */
export const CompactAlerts: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-3 w-96">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Your settings have been updated.
        </AlertDescription>
      </Alert>

      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          File uploaded successfully.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid credentials provided.
        </AlertDescription>
      </Alert>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact alerts without titles for brief notifications that save vertical space.',
      },
    },
  },
};

/**
 * Alerts in different contexts and layouts.
 */
export const InContext: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-6 w-full max-w-2xl">
      <div className="border border-gray-200 rounded-lg p-6 bg-gray-0">
        <h3 className="text-lg font-medium mb-4 text-gray-900">Account Settings</h3>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Email Verification Required</AlertTitle>
          <AlertDescription>
            Please verify your email address to enable all features.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-900">Name</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="Your name"
            />
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Alert displayed within a form or settings panel, showing contextual usage.',
      },
    },
  },
};
