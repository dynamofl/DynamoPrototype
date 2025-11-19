import type { Meta, StoryObj } from '@storybook/react';
import { Banner } from '../../components/ui/banner';

const meta: Meta<typeof Banner> = {
  title: 'Feedback/Banner',
  component: Banner,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Banner

Banners display important messages or announcements to users. They can include actions and are typically displayed at the top of a page or section.

## Usage

Use banners to communicate:
- System announcements and maintenance windows  
- Success confirmations for completed actions
- Warnings that require user attention
- Errors with clear next steps
- Feature highlights and promotions

## Intent Variants

- **default**: General informational messages
- **emphasis**: Important information requiring attention  
- **success**: Confirm successful operations
- **warning**: Alert users to potential issues
- **danger**: Critical errors or destructive actions
- **primary**: Promote new features or announcements
        `,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    intent: {
      control: { type: 'select' },
      options: ['default', 'emphasis', 'success', 'warning', 'danger', 'primary'],
      description: 'Visual style variant to convey the appropriate level of importance',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
      },
    },
    width: {
      control: { type: 'select' },
      options: ['fit', 'full'],
      description: 'Banner width: fit (auto-width with max-width) or full (100% width)',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'full' },
      },
    },
    message: {
      control: { type: 'text' },
      description: 'Primary message text displayed prominently',
      table: {
        type: { summary: 'string' },
      },
    },
    description: {
      control: { type: 'text' },
      description: 'Secondary descriptive text providing additional context',
      table: {
        type: { summary: 'string' },
      },
    },
    showTitle: {
      control: { type: 'boolean' },
      description: 'Whether to display the message/title text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showDescription: {
      control: { type: 'boolean' },
      description: 'Whether to display the description text',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showVisualIndicator: {
      control: { type: 'boolean' },
      description: 'Whether to display the info icon',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showModalControl: {
      control: { type: 'boolean' },
      description: 'Whether to show the close button for dismissing the banner',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    showCta: {
      control: { type: 'select' },
      options: ['none', 'top', 'bottom'],
      description: 'Position of call-to-action buttons: none, top (inline), or bottom',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'bottom' },
      },
    },
    showAdditionalInfo: {
      control: { type: 'boolean' },
      description: 'Whether to display additional information slot',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    primaryAction: {
      description: 'Primary action button configuration with label and onClick handler',
      table: {
        type: { summary: '{ label: string, onClick: () => void }' },
      },
    },
    secondaryAction: {
      description: 'Secondary action button configuration with label and onClick handler',
      table: {
        type: { summary: '{ label: string, onClick: () => void }' },
      },
    },
    onClose: {
      description: 'Callback function triggered when the close button is clicked',
      table: {
        type: { summary: '() => void' },
      },
    },
    additionalInfoSlot: {
      description: 'React node to display additional information below the main content',
      table: {
        type: { summary: 'React.ReactNode' },
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    message: 'Message',
    description: 'Description',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    intent: 'default',
    secondaryAction: {
      label: 'Default',
      onClick: () => console.log('Secondary action clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Default banner appearance with standard styling, info icon, and dismiss functionality.',
      },
    },
  },
};

export const WithoutIcon: Story = {
  args: {
    message: 'Important notification',
    description: 'This banner does not have a visual indicator',
    showVisualIndicator: false,
    showModalControl: true,
    showCta: 'bottom',
    intent: 'default',
    secondaryAction: {
      label: 'Action',
      onClick: () => console.log('Action clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const WithoutCloseButton: Story = {
  args: {
    message: 'Persistent message',
    description: 'This banner cannot be dismissed',
    showVisualIndicator: true,
    showModalControl: false,
    showCta: 'bottom',
    intent: 'default',
    secondaryAction: {
      label: 'Learn More',
      onClick: () => console.log('Learn more clicked'),
    },
  },
};

export const Success: Story = {
  args: {
    message: 'Success!',
    description: 'Your operation completed successfully',
    intent: 'success',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    primaryAction: {
      label: 'Continue',
      onClick: () => console.log('Continue clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const Warning: Story = {
  args: {
    message: 'Warning',
    description: 'Please review the following information before proceeding',
    intent: 'warning',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    primaryAction: {
      label: 'Review',
      onClick: () => console.log('Review clicked'),
    },
    secondaryAction: {
      label: 'Cancel',
      onClick: () => console.log('Cancel clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const Danger: Story = {
  args: {
    message: 'Error',
    description: 'Something went wrong. Please try again or contact support.',
    intent: 'danger',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    primaryAction: {
      label: 'Retry',
      onClick: () => console.log('Retry clicked'),
    },
    secondaryAction: {
      label: 'Contact Support',
      onClick: () => console.log('Contact support clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const Primary: Story = {
  args: {
    message: 'New Feature Available',
    description: 'Check out our latest update with enhanced functionality',
    intent: 'primary',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    primaryAction: {
      label: 'Try Now',
      onClick: () => console.log('Try now clicked'),
    },
    secondaryAction: {
      label: 'Learn More',
      onClick: () => console.log('Learn more clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const Emphasis: Story = {
  args: {
    message: 'System Announcement',
    description: 'Important updates regarding your account',
    intent: 'emphasis',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    secondaryAction: {
      label: 'View Details',
      onClick: () => console.log('View details clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const TopActions: Story = {
  args: {
    message: 'Quick Action Required',
    description: 'Actions are displayed at the top of this banner',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'top',
    intent: 'default',
    primaryAction: {
      label: 'Primary',
      onClick: () => console.log('Primary action clicked'),
    },
    secondaryAction: {
      label: 'Secondary',
      onClick: () => console.log('Secondary action clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
  parameters: {
    docs: {
      description: {
        story: 'Banner with actions positioned inline at the top-right, ideal for compact layouts.',
      },
    },
  },
};

export const NoActions: Story = {
  args: {
    message: 'Information Only',
    description: 'This banner is for informational purposes only',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'none',
    intent: 'default',
    onClose: () => console.log('Banner closed'),
  },
};

export const WithAdditionalInfo: Story = {
  args: {
    message: 'System Maintenance',
    description: 'Scheduled maintenance will occur tonight',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    showAdditionalInfo: true,
    additionalInfoSlot: (
      <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded border">
        <p><strong>Maintenance Window:</strong> 11:00 PM - 2:00 AM EST</p>
        <p><strong>Affected Services:</strong> API, Dashboard</p>
        <p><strong>Expected Downtime:</strong> 15 minutes</p>
      </div>
    ),
    intent: 'emphasis',
    secondaryAction: {
      label: 'Schedule',
      onClick: () => console.log('Schedule clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};

export const MessageOnly: Story = {
  args: {
    message: 'Quick notification',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'none',
    intent: 'default',
    onClose: () => console.log('Banner closed'),
  },
};

export const AllIntents: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all available intent variants demonstrating different visual styles and use cases.',
      },
    },
  },
  render: () => (
    <div className="space-y-4 w-96">
      <Banner
        message="Default Intent"
        description="Standard banner appearance"
        intent="default"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        secondaryAction={{
          label: 'Action',
          onClick: () => console.log('Action clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
      
      <Banner
        message="Emphasis Intent"
        description="Highlighted information"
        intent="emphasis"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        secondaryAction={{
          label: 'View',
          onClick: () => console.log('View clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
      
      <Banner
        message="Success Intent"
        description="Operation successful"
        intent="success"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        primaryAction={{
          label: 'Continue',
          onClick: () => console.log('Continue clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
      
      <Banner
        message="Warning Intent"
        description="Attention required"
        intent="warning"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        secondaryAction={{
          label: 'Review',
          onClick: () => console.log('Review clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
      
      <Banner
        message="Danger Intent"
        description="Critical error occurred"
        intent="danger"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        primaryAction={{
          label: 'Fix',
          onClick: () => console.log('Fix clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
      
      <Banner
        message="Primary Intent"
        description="Important feature highlight"
        intent="primary"
        showVisualIndicator={true}
        showModalControl={true}
        showCta="bottom"
        primaryAction={{
          label: 'Try Now',
          onClick: () => console.log('Try now clicked'),
        }}
        onClose={() => console.log('Banner closed')}
      />
    </div>
  ),
};

export const ContentVisibility: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Examples showing how to control the visibility of title and description content independently.',
      },
    },
  },
  render: () => (
    <div className="space-y-4 w-96">
      <div>
        <h4 className="text-[0.8125rem]  font-medium mb-2">Both Title and Description</h4>
        <Banner
          message="Complete Banner"
          description="This shows both title and description text"
          showTitle={true}
          showDescription={true}
          intent="default"
          showVisualIndicator={true}
          showModalControl={true}
          showCta="bottom"
          secondaryAction={{
            label: 'Action',
            onClick: () => console.log('Action clicked'),
          }}
          onClose={() => console.log('Banner closed')}
        />
      </div>
      
      <div>
        <h4 className="text-[0.8125rem]  font-medium mb-2">Title Only</h4>
        <Banner
          message="Title Only Banner"
          description="This description is hidden"
          showTitle={true}
          showDescription={false}
          intent="success"
          showVisualIndicator={true}
          showModalControl={true}
          showCta="bottom"
          primaryAction={{
            label: 'Continue',
            onClick: () => console.log('Continue clicked'),
          }}
          onClose={() => console.log('Banner closed')}
        />
      </div>
      
      <div>
        <h4 className="text-[0.8125rem]  font-medium mb-2">Description Only</h4>
        <Banner
          message="This title is hidden"
          description="This banner shows only the description text without a title"
          showTitle={false}
          showDescription={true}
          intent="warning"
          showVisualIndicator={true}
          showModalControl={true}
          showCta="bottom"
          secondaryAction={{
            label: 'Review',
            onClick: () => console.log('Review clicked'),
          }}
          onClose={() => console.log('Banner closed')}
        />
      </div>
      
      <div>
        <h4 className="text-[0.8125rem]  font-medium mb-2">Actions Only (No Text)</h4>
        <Banner
          message="Hidden title"
          description="Hidden description"
          showTitle={false}
          showDescription={false}
          intent="primary"
          showVisualIndicator={true}
          showModalControl={true}
          showCta="bottom"
          primaryAction={{
            label: 'Action Only',
            onClick: () => console.log('Action clicked'),
          }}
          onClose={() => console.log('Banner closed')}
        />
      </div>
    </div>
  ),
};

export const WidthVariants: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Comparison of fit width (auto-sizing with max width) vs full width banners.',
      },
    },
  },
  render: () => (
    <div className="p-6 space-y-8 w-full bg-gray-50 min-h-screen">
      <div className="bg-white p-4 rounded border">
        <h4 className="text-[0.8125rem]  font-medium mb-4">Width: "fit" (auto-width with max-width)</h4>
        <div className="border-2 border-dashed border-blue-200 p-4">
          <p className="text-xs text-blue-600 mb-2">Container (full width available)</p>
          <Banner
            width="fit"
            message="Fit Width Banner"
            description="This banner adjusts to content size with a maximum width constraint"
            intent="default"
            showVisualIndicator={true}
            showModalControl={true}
            showCta="bottom"
            secondaryAction={{
              label: 'Action',
              onClick: () => console.log('Action clicked'),
            }}
            onClose={() => console.log('Banner closed')}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded border">
        <h4 className="text-[0.8125rem]  font-medium mb-4">Width: "full" (100% container width)</h4>
        <div className="border-2 border-dashed border-green-200 p-4">
          <p className="text-xs text-green-600 mb-2">Container (full width available)</p>
          <Banner
            width="full"
            message="Full Width Banner"
            description="This banner stretches to fill the entire available container width"
            intent="success"
            showVisualIndicator={true}
            showModalControl={true}
            showCta="bottom"
            secondaryAction={{
              label: 'Action',
              onClick: () => console.log('Action clicked'),
            }}
            onClose={() => console.log('Banner closed')}
          />
        </div>
      </div>
      
      <div className="bg-white p-4 rounded border">
        <h4 className="text-[0.8125rem]  font-medium mb-4">Side-by-Side Comparison</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="border-2 border-dashed border-blue-200 p-4">
              <p className="text-xs text-blue-600 mb-2">width="fit"</p>
              <Banner
                width="fit"
                message="Fit"
                description="Auto-sized"
                intent="primary"
                showVisualIndicator={true}
                showModalControl={true}
                onClose={() => console.log('Banner closed')}
              />
            </div>
          </div>
          <div>
            <div className="border-2 border-dashed border-green-200 p-4">
              <p className="text-xs text-green-600 mb-2">width="full"</p>
              <Banner
                width="full"
                message="Full"
                description="Container width"
                intent="warning"
                showVisualIndicator={true}
                showModalControl={true}
                onClose={() => console.log('Banner closed')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const WidthControl: Story = {
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Interactive example showing the width control in action. Switch between "fit" and "full" to see the difference.',
      },
    },
  },
  args: {
    message: 'Width Control Test',
    description: 'Change the width control to see the banner resize. "fit" = auto-width with max constraint, "full" = 100% width.',
    width: 'fit',
    intent: 'primary',
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    secondaryAction: {
      label: 'Test Action',
      onClick: () => console.log('Action clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
  render: (args) => (
    <div className="w-full border-2 border-dashed border-gray-300 p-6 bg-gray-50">
      <p className="text-[0.8125rem]  text-gray-600 mb-4">
        Container (dashed border shows available space)
      </p>
      <Banner {...args} />
      <p className="text-xs text-gray-500 mt-4">
        Current width: <strong>{args.width}</strong> - 
        {args.width === 'fit' ? ' Banner adjusts to content with max-width constraint' : ' Banner fills entire container width'}
      </p>
    </div>
  ),
};

export const Playground: Story = {
  args: {
    message: 'Customize this banner',
    description: 'Use the controls below to experiment with different props',
    width: 'full',
    showTitle: true,
    showDescription: true,
    showVisualIndicator: true,
    showModalControl: true,
    showCta: 'bottom',
    intent: 'default',
    primaryAction: {
      label: 'Primary',
      onClick: () => console.log('Primary action clicked'),
    },
    secondaryAction: {
      label: 'Secondary',
      onClick: () => console.log('Secondary action clicked'),
    },
    onClose: () => console.log('Banner closed'),
  },
};