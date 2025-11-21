import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../../components/ui/tooltip';
import { Info, HelpCircle, AlertCircle } from 'lucide-react';

const meta: Meta<typeof Tooltip> = {
  title: 'Feedback/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Tooltips display informative text when users hover over, focus on, or tap an element. They provide contextual help without cluttering the interface. Use tooltips for brief descriptions, labels for icon buttons, or additional information about form fields.`,
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
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
  argTypes: {
    open: {
      control: { type: 'boolean' },
      description: 'Controls the open state of the tooltip',
      table: {
        type: { summary: 'boolean' },
        category: 'State',
      },
    },
    defaultOpen: {
      control: { type: 'boolean' },
      description: 'The initial open state in uncontrolled mode',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    onOpenChange: {
      action: 'open-changed',
      description: 'Callback fired when the open state changes',
      table: {
        category: 'Events',
      },
    },
    delayDuration: {
      control: { type: 'number' },
      description: 'The delay before the tooltip opens (ms)',
      table: {
        type: { summary: 'number' },
        defaultValue: { summary: '700' },
        category: 'Behavior',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic Variants
 *
 * Simple tooltip examples showing core functionality.
 *
 * Basic tooltip that appears on hover or focus.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover Me</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This is a tooltip</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Tooltip with longer descriptive text for more detailed information.
 */
export const LongText: Story = {
  tags: ['!dev'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Detailed Info</Button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">This is a longer tooltip that contains more detailed information about the action or element. It wraps to multiple lines when needed.</p>
      </TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips can contain longer text that wraps across multiple lines for more detailed explanations.',
      },
    },
  },
};

/**
 * ### Icon Buttons
 *
 * Tooltips are essential for icon buttons to provide context.
 *
 * Tooltip providing label for an info icon button.
 */
export const InfoIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Click for more information</p>
      </TooltipContent>
    </Tooltip>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon buttons should always have tooltips to explain their purpose.',
      },
    },
  },
};

/**
 * Help icon with tooltip explaining the feature.
 */
export const HelpIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Get help with this feature</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * Alert icon with warning tooltip.
 */
export const AlertIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon">
          <AlertCircle className="h-4 w-4 text-amber-600" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>This action requires confirmation</p>
      </TooltipContent>
    </Tooltip>
  ),
};

/**
 * ### Form Elements
 *
 * Tooltips providing contextual help in forms.
 *
 * Form field with tooltip explaining requirements.
 */
export const FormField: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-2 w-80">
      <div className="flex items-center space-x-2">
        <label className="text-[0.8125rem] font-medium text-gray-900">Password</label>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
              <Info className="h-3.5 w-3.5 text-gray-500" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Password must be at least 8 characters long</p>
          </TooltipContent>
        </Tooltip>
      </div>
      <input
        type="password"
        placeholder="Enter your password"
        className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Use tooltips next to form field labels to provide additional context or validation requirements.',
      },
    },
  },
};

/**
 * Multiple form fields with individual tooltips.
 */
export const FormWithTooltips: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-[0.8125rem] font-medium text-gray-900">Email</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <Info className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>We'll never share your email with anyone else</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          type="email"
          placeholder="Enter your email"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <label className="text-[0.8125rem] font-medium text-gray-900">Username</label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-4 w-4 p-0">
                <Info className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Username must be unique and 3-20 characters</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <input
          type="text"
          placeholder="Choose a username"
          className="flex h-10 w-full rounded-md border border-gray-300 bg-gray-0 px-3 py-2 text-[0.8125rem] ring-offset-background placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Each form field can have its own tooltip explaining specific requirements or providing helpful context.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world usage patterns and combinations.
 *
 * Action buttons with tooltips explaining their purpose.
 */
export const ActionButtons: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex gap-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Save</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Save your changes (Ctrl+S)</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Cancel</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Discard all changes</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="destructive">Delete</Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Permanently delete this item</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple tooltips can be used together for groups of actions. Each tooltip can include keyboard shortcuts if applicable.',
      },
    },
  },
};

/**
 * Tooltips in a table providing context for row actions.
 */
export const TableActions: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="w-full max-w-2xl">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left p-3 text-[0.8125rem] font-medium text-gray-900">Name</th>
            <th className="text-left p-3 text-[0.8125rem] font-medium text-gray-900">Status</th>
            <th className="text-left p-3 text-[0.8125rem] font-medium text-gray-900">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-gray-200">
            <td className="p-3 text-[0.8125rem]">John Doe</td>
            <td className="p-3">
              <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-450 rounded-full">Active</span>
            </td>
            <td className="p-3">
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit user details</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this user</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
          <tr className="border-b border-gray-200">
            <td className="p-3 text-[0.8125rem]">Jane Smith</td>
            <td className="p-3">
              <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-450 rounded-full">Pending</span>
            </td>
            <td className="p-3">
              <div className="flex gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit user details</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">Delete</Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Delete this user</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tooltips are commonly used in data tables to explain row-level actions without adding visual clutter.',
      },
    },
  },
};

/**
 * Icon toolbar with tooltips for each action.
 */
export const IconToolbar: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex gap-1 p-2 border border-gray-200 rounded-lg bg-gray-0 w-fit">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Edit</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Copy</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Delete</p>
        </TooltipContent>
      </Tooltip>

      <div className="w-px bg-gray-200 mx-1" />

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Download</p>
        </TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Share</p>
        </TooltipContent>
      </Tooltip>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon toolbars rely heavily on tooltips to communicate what each icon does. This is a common pattern in rich text editors and design tools.',
      },
    },
  },
};
