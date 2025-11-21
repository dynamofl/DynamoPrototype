import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

// Wrapper component to showcase toast functionality
const ToastDemo = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <Toaster />
      <div className="flex items-center justify-center min-h-[200px]">
        {children}
      </div>
    </>
  );
};

const meta: Meta = {
  title: 'Feedback/Toast',
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Toast notifications provide brief, temporary messages about app processes. They appear at the bottom of the screen and automatically dismiss after a few seconds. Use toasts for success confirmations, informational updates, warnings, or error messages that don't require immediate user action. Built on top of Sonner library with custom styling.`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj;

/**
 * ### Basic Variants
 *
 * Core toast notification types.
 *
 * Default informational toast.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Notification', {
            description: 'This is a default toast notification.',
          })
        }
      >
        Show Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Basic toast notification for general information. Click the button to see the toast appear.',
      },
    },
  },
};

/**
 * Success toast for positive confirmations.
 */
export const Success: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast.success('Changes Saved', {
            description: 'Your settings have been updated successfully.',
          })
        }
      >
        Show Success Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success toast with green checkmark icon for successful operations.',
      },
    },
  },
};

/**
 * Error toast for failures and critical issues.
 */
export const Error: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        variant="destructive"
        onClick={() =>
          toast.error('Error', {
            description: 'Something went wrong. Please try again.',
          })
        }
      >
        Show Error Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error toast with error icon for failed operations or critical issues.',
      },
    },
  },
};

/**
 * Warning toast for cautionary messages.
 */
export const Warning: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast.warning('Warning', {
            description: 'This action cannot be undone. Please proceed with caution.',
          })
        }
      >
        Show Warning Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Warning toast with triangle icon for cautionary messages.',
      },
    },
  },
};

/**
 * Info toast for informational messages.
 */
export const Info: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        variant="outline"
        onClick={() =>
          toast.info('Information', {
            description: 'New features are now available in the beta section.',
          })
        }
      >
        Show Info Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Info toast with information icon for helpful tips and updates.',
      },
    },
  },
};

/**
 * Loading toast for ongoing processes.
 */
export const Loading: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast.loading('Processing...', {
            description: 'Please wait while we process your request.',
          })
        }
      >
        Show Loading Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Loading toast with animated spinner for ongoing operations. Use toast.dismiss() to remove when complete.',
      },
    },
  },
};

/**
 * ### With Actions
 *
 * Toasts with action buttons for user interaction.
 *
 * Toast with action button.
 */
export const WithAction: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Evaluation Completed', {
            description: 'Customer Support Bot - Production Test',
            action: {
              label: 'View Results',
              onClick: () => console.log('View results clicked'),
            },
          })
        }
      >
        Show Toast with Action
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with an action button allowing users to take immediate action on the notification.',
      },
    },
  },
};

/**
 * Toast with cancel button.
 */
export const WithCancel: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('File Upload Started', {
            description: 'Uploading document.pdf...',
            action: {
              label: 'View',
              onClick: () => console.log('View clicked'),
            },
            cancel: {
              label: 'Cancel',
              onClick: () => console.log('Upload cancelled'),
            },
          })
        }
      >
        Show Toast with Cancel
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with both action and cancel buttons for operations that can be cancelled.',
      },
    },
  },
};

/**
 * ### Duration Control
 *
 * Control how long toasts remain visible.
 *
 * Short duration toast (2 seconds).
 */
export const ShortDuration: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Quick Message', {
            description: 'This disappears in 2 seconds.',
            duration: 2000,
          })
        }
      >
        Show Short Toast (2s)
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast that auto-dismisses after 2 seconds. Useful for quick confirmations.',
      },
    },
  },
};

/**
 * Long duration toast (10 seconds).
 */
export const LongDuration: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Important Update', {
            description: 'This stays visible for 10 seconds to ensure you see it.',
            duration: 10000,
          })
        }
      >
        Show Long Toast (10s)
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with extended 10-second duration for important messages that need attention.',
      },
    },
  },
};

/**
 * Persistent toast (no auto-dismiss).
 */
export const Persistent: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Action Required', {
            description: 'This toast stays until you close it manually.',
            duration: Infinity,
            closeButton: true,
          })
        }
      >
        Show Persistent Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Persistent toast that remains visible until manually dismissed. Use for critical actions requiring user acknowledgment.',
      },
    },
  },
};

/**
 * ### Advanced Features
 *
 * Advanced toast configurations and patterns.
 *
 * Toast without description.
 */
export const TitleOnly: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button onClick={() => toast.success('File Uploaded')}>
        Show Title Only
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Compact toast showing only the title for brief confirmations.',
      },
    },
  },
};

/**
 * Promise toast for async operations.
 */
export const Promise: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() => {
          const promise = new Promise((resolve) =>
            setTimeout(resolve, 3000)
          );

          toast.promise(promise, {
            loading: 'Saving changes...',
            success: 'Changes saved successfully!',
            error: 'Failed to save changes.',
          });
        }}
      >
        Show Promise Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast that automatically updates based on promise state. Shows loading, then success or error based on the result.',
      },
    },
  },
};

/**
 * ### Examples
 *
 * Real-world usage patterns.
 *
 * Form submission success.
 */
export const FormSubmission: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast.success('Form Submitted', {
            description: 'Your application has been submitted successfully.',
            action: {
              label: 'View Status',
              onClick: () => console.log('View status'),
            },
            closeButton: true,
          })
        }
      >
        Submit Form
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Success toast for form submission with action to view status.',
      },
    },
  },
};

/**
 * File upload progress.
 */
export const FileUpload: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() => {
          const id = toast.loading('Uploading file...', {
            description: 'document.pdf (0%)',
          });

          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 20;
            if (progress <= 100) {
              toast.loading('Uploading file...', {
                id,
                description: `document.pdf (${progress}%)`,
              });
            }
            if (progress >= 100) {
              clearInterval(interval);
              setTimeout(() => {
                toast.success('Upload Complete', {
                  id,
                  description: 'document.pdf has been uploaded.',
                });
              }, 500);
            }
          }, 500);
        }}
      >
        Upload File
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Simulated file upload with progress updates. The same toast is updated throughout the process.',
      },
    },
  },
};

/**
 * Network error with retry.
 */
export const NetworkError: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        variant="destructive"
        onClick={() =>
          toast.error('Connection Failed', {
            description: 'Unable to connect to the server.',
            action: {
              label: 'Retry',
              onClick: () => {
                toast.loading('Retrying...');
                setTimeout(() => {
                  toast.success('Connected');
                }, 2000);
              },
            },
            duration: 10000,
          })
        }
      >
        Simulate Network Error
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Error toast with retry action for network failures.',
      },
    },
  },
};

/**
 * Multiple toasts demonstration.
 */
export const MultipleToasts: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <div className="flex gap-2">
        <Button
          onClick={() => {
            toast.success('Task 1 Complete');
            setTimeout(() => toast.success('Task 2 Complete'), 500);
            setTimeout(() => toast.success('Task 3 Complete'), 1000);
          }}
        >
          Show Multiple Toasts
        </Button>
      </div>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple toasts can be stacked and displayed simultaneously.',
      },
    },
  },
};

/**
 * Custom styled toast.
 */
export const CustomStyled: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <Button
        onClick={() =>
          toast('Custom Toast', {
            description: 'This toast has custom styling.',
            classNames: {
              toast: 'border-2 border-gray-900 bg-gray-900',
              title: 'text-gray-0 font-medium',
              description: 'text-gray-300',
            },
          })
        }
      >
        Show Custom Toast
      </Button>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Toast with custom styling using classNames prop. Useful for branded or special notifications.',
      },
    },
  },
};

/**
 * All toast types comparison.
 */
export const AllTypes: Story = {
  tags: ['!dev'],
  render: () => (
    <ToastDemo>
      <div className="flex flex-col gap-2">
        <Button onClick={() => toast('Default Toast', { description: 'General information' })}>
          Default
        </Button>
        <Button onClick={() => toast.success('Success Toast', { description: 'Operation completed' })}>
          Success
        </Button>
        <Button onClick={() => toast.info('Info Toast', { description: 'Helpful information' })}>
          Info
        </Button>
        <Button onClick={() => toast.warning('Warning Toast', { description: 'Proceed with caution' })}>
          Warning
        </Button>
        <Button onClick={() => toast.error('Error Toast', { description: 'Something went wrong' })}>
          Error
        </Button>
        <Button onClick={() => toast.loading('Loading Toast', { description: 'Processing...' })}>
          Loading
        </Button>
      </div>
    </ToastDemo>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Showcase all toast types side by side for easy comparison.',
      },
    },
  },
};
