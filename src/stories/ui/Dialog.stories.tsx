import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogFooterButtonSet,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  type DialogContentProps,
} from '../../components/ui/dialog';
import { Info } from 'lucide-react';

// Custom story args interface
interface DialogStoryArgs extends DialogContentProps {
  showCloseButton: boolean;
  showIcon: boolean;
  showSubtitle: boolean;
  scrollable: boolean;
  buttonVariant: 'default' | 'danger' | 'success';
  footerAlign: 'left' | 'center' | 'right';
}

const meta: Meta<DialogStoryArgs> = {
  title: 'UI/Dialog',
  component: DialogContent,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
# Dialog

A dialog is a window overlaid on either the primary window or another dialog window. Content behind a dialog is inert, meaning that users cannot interact with it.

## Features

- **Size variants**: Small, Medium, Large, and Extra Large sizes
- **Appearance modes**: Default, Warning, Danger, and Success states
- **Flexible content**: Supports header with icons, scrollable body, and customizable footer
- **Accessibility**: Built on Radix UI Dialog primitive with full keyboard navigation and screen reader support
- **Responsive**: Adapts to different screen sizes while maintaining usability

## When to use

**Use a dialog when:**
- You need to interrupt the user's workflow to get input or confirmation
- Displaying critical information that requires immediate attention
- Creating or editing content that needs to be isolated from the main interface
- Showing detailed information that would clutter the main view

**Don't use a dialog when:**
- The information is not critical and can be shown inline
- The user needs to reference content behind the dialog
- Simple notifications that don't require interaction (use Toast instead)
- Complex workflows that require multiple steps (consider a dedicated page)

## Anatomy

A dialog consists of:
1. **Overlay**: Semi-transparent background that blocks interaction with content behind
2. **Container**: The dialog box itself with defined width based on size variant
3. **Header**: Contains title, optional icon, optional subtitle, and close button
4. **Body**: Main content area that can be scrollable based on content length
5. **Footer**: Action buttons, typically primary and secondary actions
        `,
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
      description: 'Dialog size variant',
    },
    showCloseButton: {
      control: 'boolean',
      description: 'Show close button in header',
    },
    showIcon: {
      control: 'boolean',
      description: 'Show icon in header',
    },
    showSubtitle: {
      control: 'boolean',
      description: 'Show subtitle in header',
    },
    scrollable: {
      control: 'boolean',
      description: 'Enable scrolling in dialog body',
    },
    buttonVariant: {
      control: 'select',
      options: ['default', 'danger', 'success'],
      description: 'Button set variant',
    },
    footerAlign: {
      control: 'select',
      options: ['left', 'center', 'right'],
      description: 'Footer button alignment',
    },
  },
  args: {
    size: 'md',
    showCloseButton: true,
    showIcon: false,
    showSubtitle: false,
    scrollable: false,
    buttonVariant: 'default',
    footerAlign: 'right',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Interactive story with full controls
export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Interactive Dialog

This story demonstrates all available dialog properties and controls. Use the Controls panel to experiment with different combinations of:

- **Size**: Controls the dialog width (sm: 400px, md: 600px, lg: 752px, xl: 968px)
- **Header options**: Toggle close button, icon display, and subtitle
- **Body behavior**: Enable/disable scrolling for long content
- **Footer styling**: Choose button variants and alignment

**Try this:** Enable scrolling and change the size to see how the body adapts its max-height based on the dialog size.
        `,
      },
    },
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Open Interactive Dialog</Button>
        </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader 
          showCloseButton={args.showCloseButton} 
          showIcon={args.showIcon}
          icon={<Info className="h-5 w-5 text-blue-600" />}
        >
          <DialogTitle>Interactive Dialog</DialogTitle>
          {args.showSubtitle && (
            <DialogDescription>
              This dialog demonstrates all the available controls
            </DialogDescription>
          )}
        </DialogHeader>
        <DialogBody scrollable={args.scrollable} size={args.size}>
          <div className="space-y-4">
            <p className="text-[0.8125rem]  text-gray-600">
              This is the dialog body content. You can control various aspects of this dialog 
              using the Storybook controls panel.
            </p>
            {args.scrollable && (
              <div className="space-y-2">
                {Array.from({ length: 10 }, (_, i) => (
                  <p key={i} className="text-[0.8125rem]  text-gray-500">
                    Scrollable content line {i + 1}. This demonstrates the scrolling behavior 
                    when the content exceeds the dialog height.
                  </p>
                ))}
              </div>
            )}
          </div>
        </DialogBody>
        <DialogFooter align={args.footerAlign}>
          <DialogFooterButtonSet
            variant={args.buttonVariant}
            primaryText={args.buttonVariant === 'danger' ? 'Delete' : args.buttonVariant === 'success' ? 'Save' : 'Accept'}
            secondaryText="Cancel"
            onPrimaryClick={() => console.log('Primary clicked')}
            onSecondaryClick={() => console.log('Secondary clicked')}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Default Dialog

A standard confirmation dialog with title, description, body content, and action buttons. This is the most common dialog pattern for user confirmations and simple interactions.

**Key features:**
- Clear title and description
- Focused body content
- Primary and secondary actions
- Default medium size
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </DialogDescription>
        </DialogHeader>
        <DialogBody size="md">
          <p className="text-[0.8125rem]  text-gray-600">
            Please confirm that you want to proceed with this action.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet
            variant="danger"
            primaryText="Delete Account"
            secondaryText="Cancel"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

// Size variant stories
export const SmallSize: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Small Dialog (400px)

Use for quick confirmations, simple forms, or minimal content. The small size encourages concise messaging and essential actions only.

**Best for:**
- Yes/No confirmations
- Single field forms
- Quick notifications
- Simple choices
        `,
      },
    },
  },
  args: {
    size: 'sm',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Small Dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Small Dialog</DialogTitle>
          <DialogDescription>
            This is a small-sized dialog for quick interactions.
          </DialogDescription>
        </DialogHeader>
        <DialogBody size={args.size}>
          <p className="text-[0.8125rem]  text-gray-600">
            Compact content for quick actions.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const MediumSize: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Medium Dialog (600px) - Default

The default size for most dialog use cases. Provides a good balance between content space and focus.

**Best for:**
- Standard forms
- Content with moderate detail
- Most confirmation dialogs
- General purpose interactions
        `,
      },
    },
  },
  args: {
    size: 'md',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Medium Dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Medium Dialog</DialogTitle>
          <DialogDescription>
            This is a medium-sized dialog for standard interactions.
          </DialogDescription>
        </DialogHeader>
        <DialogBody size={args.size}>
          <div className="space-y-4">
            <p className="text-[0.8125rem]  text-gray-600">
              Standard content area with comfortable spacing.
            </p>
            <div className="grid gap-2">
              <label className="text-[0.8125rem]  font-medium">Example field:</label>
              <input className="px-3 py-2 border rounded-md" placeholder="Enter text..." />
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const LargeSize: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Large Dialog (752px)

Provides more space for detailed forms, content with multiple sections, or when you need to display more information without scrolling.

**Best for:**
- Multi-section forms
- Detailed information display
- Content with side-by-side layouts
- Tables or lists that need more width
        `,
      },
    },
  },
  args: {
    size: 'lg',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Large Dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Large Dialog</DialogTitle>
          <DialogDescription>
            This is a large-sized dialog for detailed content.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6">
            <p className="text-[0.8125rem]  text-gray-600">
              Expanded content area for detailed forms or information.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium">First Name:</label>
                <input className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium">Last Name:</label>
                <input className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-[0.8125rem]  font-medium">Description:</label>
                <textarea className="w-full px-3 py-2 border rounded-md" rows={3} />
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const ExtraLargeSize: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Extra Large Dialog (968px)

Maximum width for complex interfaces, data tables, or when you need to show substantial amounts of information in a single view.

**Best for:**
- Complex forms with many fields
- Data tables or grids
- Multi-step workflows
- Rich content layouts
- Advanced configuration panels
        `,
      },
    },
  },
  args: {
    size: 'xl',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Extra Large Dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Extra Large Dialog</DialogTitle>
          <DialogDescription>
            This is an extra large dialog for complex content and workflows.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-6">
            <p className="text-[0.8125rem]  text-gray-600">
              Maximum width dialog for complex forms, tables, or detailed information.
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium">Category:</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Select category</option>
                  <option>Option 1</option>
                  <option>Option 2</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium">Priority:</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Select priority</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium">Status:</label>
                <select className="w-full px-3 py-2 border rounded-md">
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>
            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Advanced Options</h4>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-[0.8125rem] ">Enable notifications</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded" />
                  <span className="text-[0.8125rem] ">Auto-save changes</span>
                </label>
              </div>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

// Appearance variant stories
export const DefaultAppearance: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Default Appearance

Standard dialog appearance for general use cases. Uses neutral colors and standard button styling.

**When to use:**
- General information or forms
- Standard confirmations
- Non-critical interactions
- Default state for most dialogs
        `,
      },
    },
  },
  args: {
    buttonVariant: 'default',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Default Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Default Appearance</DialogTitle>
          <DialogDescription>
            This dialog uses the default appearance with standard styling.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <p className="text-[0.8125rem]  text-gray-600">
            Standard dialog content with default button styling.
          </p>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet variant={args.buttonVariant} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const WarningAppearance: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Warning Appearance

Use warning appearance for actions that require user attention but are not destructive. Features yellow/amber accent colors and warning iconography.

**When to use:**
- Actions that need caution
- Important notices
- Potentially risky but reversible actions
- System warnings or advisories
        `,
      },
    },
  },
  args: {
    buttonVariant: 'default',
    showIcon: true,
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-50">
          Open Warning Dialog
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader 
          showIcon={args.showIcon}
          icon={
            <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
              <Info className="h-3 w-3 text-yellow-600" />
            </div>
          }
        >
          <DialogTitle>Warning: Important Notice</DialogTitle>
          <DialogDescription>
            Please review the following information carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-[0.8125rem]  text-yellow-800">
              This action may have important consequences. Please ensure you understand 
              the implications before continuing.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            variant="default"
            primaryText="I Understand"
            secondaryText="Cancel"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const DangerAppearance: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Danger Appearance

Use danger appearance for destructive actions that cannot be undone. Features red accent colors and uses danger button styling.

**When to use:**
- Permanent deletions
- Destructive actions
- Critical warnings
- Actions that will lose data
- Security-related confirmations
        `,
      },
    },
  },
  args: {
    buttonVariant: 'danger',
    showIcon: true,
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="destructive">Open Danger Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader 
          showIcon={args.showIcon}
          icon={
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
              <Info className="h-3 w-3 text-red-600" />
            </div>
          }
        >
          <DialogTitle>Danger: Destructive Action</DialogTitle>
          <DialogDescription>
            This action cannot be undone. Please confirm you want to proceed.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-[0.8125rem]  text-red-800">
              <strong>Warning:</strong> This will permanently delete all associated data 
              and cannot be recovered.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            variant={args.buttonVariant}
            primaryText="Delete Permanently"
            secondaryText="Cancel"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const SuccessAppearance: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Success Appearance

Use success appearance for positive confirmations and completed actions. Features green accent colors and success button styling.

**When to use:**
- Successful completions
- Positive confirmations
- Achievement notifications
- Save/submit confirmations
- Process completion dialogs
        `,
      },
    },
  },
  args: {
    buttonVariant: 'success',
    showIcon: true,
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">Open Success Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader 
          showIcon={args.showIcon}
          icon={
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
              <Info className="h-3 w-3 text-green-600" />
            </div>
          }
        >
          <DialogTitle>Success: Action Complete</DialogTitle>
          <DialogDescription>
            Your action has been completed successfully.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-[0.8125rem]  text-green-800">
              The operation was completed successfully. All changes have been saved.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            variant={args.buttonVariant}
            primaryText="Continue"
            secondaryText="Close"
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

// DialogBody showcase stories
export const ScrollableContent: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Scrollable Content

Demonstrates how the dialog body handles long content with scrolling. The max-height is automatically set based on the dialog size:

- **Small**: 180px max-height
- **Medium**: 300px max-height
- **Large**: 400px max-height
- **Extra Large**: 500px max-height

**Best practices:**
- Use scrolling when content length is unpredictable
- Ensure important actions remain visible in the footer
- Consider pagination for very long lists
        `,
      },
    },
  },
  args: {
    scrollable: true,
    size: 'md',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Scrollable Dialog</Button>
      </DialogTrigger>
      <DialogContent size={args.size}>
        <DialogHeader>
          <DialogTitle>Scrollable Content</DialogTitle>
          <DialogDescription>
            This dialog demonstrates scrollable content within the dialog body.
          </DialogDescription>
        </DialogHeader>
        <DialogBody scrollable={args.scrollable} size={args.size}>
          <div className="space-y-4">
            <p className="text-[0.8125rem]  text-gray-600">
              This content area is scrollable when it exceeds the maximum height.
            </p>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i} className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-medium">Content Block {i + 1}</h4>
                <p className="text-[0.8125rem]  text-gray-600">
                  This is example content that demonstrates how the dialog body 
                  handles overflow with scrolling. Each block contains meaningful 
                  information that users might need to scroll through.
                </p>
              </div>
            ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet primaryText="Got it" primaryOnly />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const CenteredContent: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Centered Content

Shows how content is centered within the dialog body when scrolling is disabled. This is ideal for focused, concise content that doesn't require scrolling.

**Best for:**
- Simple messages
- Single actions or confirmations
- Icons with text
- Progress indicators
- Error states
        `,
      },
    },
  },
  args: {
    scrollable: false,
    size: 'md',
  },
  render: (args) => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Centered Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Centered Content</DialogTitle>
          <DialogDescription>
            This dialog shows content centered within the dialog body.
          </DialogDescription>
        </DialogHeader>
        <DialogBody scrollable={args.scrollable} size={args.size}>
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Info className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium">Action Required</h3>
            <p className="text-[0.8125rem]  text-gray-600 max-w-sm mx-auto">
              Please review and confirm the details before proceeding with this action.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

// DialogFooterButtonSet showcase stories
export const ButtonSetVariants: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Button Set Variants

Demonstrates the three button variants available in DialogFooterButtonSet:

- **Default**: Standard blue primary button with neutral secondary
- **Danger**: Red primary button for destructive actions
- **Success**: Green primary button for positive actions

**Button hierarchy:**
- Primary button (right): Main action the user should take
- Secondary button (left): Alternative or cancel action
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 gap-4">
        <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Default Buttons</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Default Button Set</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">Standard button styling.</p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet variant="default" />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-red-300">
            Danger Buttons
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Danger Button Set</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">Destructive action styling.</p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet 
              variant="danger" 
              primaryText="Delete"
              secondaryText="Cancel"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="border-green-300">
            Success Buttons
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success Button Set</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">Positive action styling.</p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet 
              variant="success" 
              primaryText="Save"
              secondaryText="Cancel"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  ),
};

export const CustomButtonText: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Custom Button Text

Shows how to customize button labels and add click handlers. You can provide custom text for both primary and secondary buttons to match your specific use case.

**Examples:**
- "Save" / "Cancel" for forms
- "Delete" / "Keep" for deletions
- "Continue" / "Go Back" for workflows
- "Accept" / "Decline" for agreements
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Custom Button Text</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Custom Button Labels</DialogTitle>
          <DialogDescription>
            This demonstrates custom button text and single button mode.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="space-y-4">
            <p className="text-[0.8125rem]  text-gray-600">
              You can customize button text and even show only a primary button.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            primaryText="Let's Go!"
            secondaryText="Maybe Later"
            onPrimaryClick={() => alert('Primary clicked!')}
            onSecondaryClick={() => alert('Secondary clicked!')}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

export const SingleButton: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Single Button Mode

Demonstrates the \`primaryOnly\` prop which shows only the primary button. This is useful for informational dialogs that only need acknowledgment.

**When to use single button:**
- Informational messages
- Success notifications
- Error messages
- Simple acknowledgments
- "Got it" or "OK" interactions
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Single Button</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Information</DialogTitle>
          <DialogDescription>
            This dialog shows only a primary button.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-[0.8125rem]  text-gray-600">
              This is an informational dialog that only needs an acknowledgment.
            </p>
          </div>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            primaryText="Got it"
            primaryOnly
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};

// Footer alignment stories
export const FooterAlignment: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Footer Alignment

Demonstrates the three footer alignment options: left, center, and right. The alignment affects how the button set is positioned within the footer area.

**Alignment options:**
- **Left**: Buttons aligned to the left side (unusual but available)
- **Center**: Buttons centered (good for single actions)
- **Right**: Buttons aligned to the right (default, follows standard patterns)

**Best practices:**
- Use right alignment for most dialogs (standard convention)
- Use center alignment for single-button informational dialogs
- Use left alignment sparingly, only when it makes contextual sense
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 gap-4">
        <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Left Aligned</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Left Aligned Footer</DialogTitle>
            <DialogDescription>
              Buttons are aligned to the left side of the footer.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              This demonstrates left-aligned footer buttons.
            </p>
          </DialogBody>
          <DialogFooter align="left">
            <DialogFooterButtonSet 
              primaryText="Continue"
              secondaryText="Cancel"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Center Aligned</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Center Aligned Footer</DialogTitle>
            <DialogDescription>
              Buttons are centered in the footer area.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              This demonstrates center-aligned footer buttons.
            </p>
          </DialogBody>
          <DialogFooter align="center">
            <DialogFooterButtonSet 
              primaryText="Acknowledge"
              primaryOnly
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Right Aligned (Default)</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Right Aligned Footer</DialogTitle>
            <DialogDescription>
              Buttons are aligned to the right side (default behavior).
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              This demonstrates right-aligned footer buttons (standard).
            </p>
          </DialogBody>
          <DialogFooter align="right">
            <DialogFooterButtonSet 
              primaryText="Accept"
              secondaryText="Cancel"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  ),
};

// Header variations stories
export const HeaderVariations: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Header Variations

Demonstrates different header configurations including icons, close buttons, and subtitle combinations.

**Header options:**
- **Close button**: Can be hidden for modal dialogs that require action
- **Icons**: Visual indicators for context (info, warning, success, etc.)
- **Subtitles**: Additional context below the main title

**Best practices:**
- Use icons to reinforce the dialog's purpose
- Include close button unless the dialog requires mandatory action
- Keep subtitles concise and helpful
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <div className="grid grid-cols-1 gap-4">
        <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">With Icon & Subtitle</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader 
            showIcon={true}
            icon={<Info className="h-5 w-5 text-blue-600" />}
          >
            <DialogTitle>Information Required</DialogTitle>
            <DialogDescription>
              Please provide the following details to continue
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              Header with icon and descriptive subtitle.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">No Close Button</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader showCloseButton={false}>
            <DialogTitle>Mandatory Action</DialogTitle>
            <DialogDescription>
              This action must be completed before continuing
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              Header without close button for mandatory actions.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet 
              primaryText="Complete"
              secondaryText="Cancel"
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">Minimal Header</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Simple Dialog</DialogTitle>
          </DialogHeader>
          <DialogBody>
            <p className="text-[0.8125rem]  text-gray-600">
              Minimal header with just title and close button.
            </p>
          </DialogBody>
          <DialogFooter>
            <DialogFooterButtonSet primaryText="OK" primaryOnly />
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  ),
};

// Complex form example
export const ComplexFormExample: Story = {
  parameters: {
    docs: {
      description: {
        story: `
### Complex Form Example

A real-world example showing how to use the dialog for a complex form with multiple field types, validation states, and practical interactions.

**Features demonstrated:**
- Form fields with labels and validation
- Mixed input types (text, select, textarea, checkbox)
- Large dialog size for complex content
- Practical button labels and actions
- Proper spacing and layout

**Use cases:**
- User registration forms
- Content creation dialogs
- Settings configuration
- Data entry interfaces
        `,
      },
    },
  },
  render: () => (
    <div className="flex justify-center">
      <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          Create New Project
        </Button>
      </DialogTrigger>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>
            Set up your new project with the details below. All fields marked with * are required.
          </DialogDescription>
        </DialogHeader>
        <DialogBody>
          <form className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium text-gray-600">
                  Project Name *
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium text-gray-600">
                  Project Type *
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select type</option>
                  <option value="web">Web Application</option>
                  <option value="mobile">Mobile App</option>
                  <option value="api">API Service</option>
                  <option value="library">Library</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[0.8125rem]  font-medium text-gray-600">
                Description
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={3}
                placeholder="Describe your project..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium text-gray-600">
                  Repository URL
                </label>
                <input 
                  type="url" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[0.8125rem]  font-medium text-gray-600">
                  Team Size
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="1">1 person</option>
                  <option value="2-5">2-5 people</option>
                  <option value="6-10">6-10 people</option>
                  <option value="11+">11+ people</option>
                </select>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="text-[0.8125rem]  font-medium text-gray-900 mb-3">Project Settings</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-[0.8125rem]  text-gray-600">Enable automatic deployments</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-[0.8125rem]  text-gray-600">Require code reviews</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" defaultChecked />
                  <span className="text-[0.8125rem]  text-gray-600">Send email notifications</span>
                </label>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-[0.8125rem]  font-medium text-blue-900">Getting Started</h4>
                  <p className="text-[0.8125rem]  text-blue-700 mt-1">
                    Once created, you'll be able to configure additional settings like integrations, 
                    deployment pipelines, and team permissions from the project dashboard.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </DialogBody>
        <DialogFooter>
          <DialogFooterButtonSet 
            variant="success"
            primaryText="Create Project"
            secondaryText="Cancel"
            onPrimaryClick={() => console.log('Creating project...')}
            onSecondaryClick={() => console.log('Cancelled')}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </div>
  ),
};
