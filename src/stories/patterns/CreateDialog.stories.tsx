import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateDialog } from '../../components/patterns/ui-patterns/create-dialog';

// Wrapper component to manage dialog state
const CreateDialogWrapper = ({
  children,
  title,
  description,
  maxWidth,
  showBackButton,
  actionFooter
}: {
  children: React.ReactNode;
  title: string;
  description?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  showBackButton?: boolean;
  actionFooter?: React.ReactNode;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <CreateDialog
      trigger={<Button>Open Dialog</Button>}
      title={title}
      description={description}
      open={open}
      onOpenChange={setOpen}
      maxWidth={maxWidth}
      showBackButton={showBackButton}
      onBack={() => console.log('Back clicked')}
      actionFooter={actionFooter}
    >
      {children}
    </CreateDialog>
  );
};

const meta: Meta<typeof CreateDialog> = {
  title: 'Patterns/CreateDialog',
  component: CreateDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A reusable dialog component for creation forms with customizable size, back button, and action footer.',
      },
    },
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Create New Item"
      description="Fill in the details below to create a new item."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="Enter name..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Enter description..." />
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};

export const WithSelect: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Create AI System"
      description="Configure your new AI system settings."
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">System Name</Label>
          <Input id="name" placeholder="Enter system name..." />
        </div>

        <div className="space-y-2">
          <Label htmlFor="provider">AI Provider</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">OpenAI</SelectItem>
              <SelectItem value="anthropic">Anthropic</SelectItem>
              <SelectItem value="azure">Azure</SelectItem>
              <SelectItem value="google">Google</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">Model</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4">GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-2">Claude 2</SelectItem>
              <SelectItem value="claude-instant">Claude Instant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the purpose and use case for this AI system..."
          />
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};

export const WithBackButton: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Step 2: Configuration"
      description="Configure your settings in this step."
      showBackButton={true}
    >
      <div className="space-y-4">
        <p>This is step 2 of a multi-step process.</p>
        <div className="space-y-2">
          <Label htmlFor="config">Configuration</Label>
          <Input id="config" placeholder="Enter configuration..." />
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};

export const WithActionFooter: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Create Project"
      description="Create a new project with the following details."
      actionFooter={
        <div className="flex justify-between w-full">
          <Button variant="outline">Cancel</Button>
          <div className="flex space-x-2">
            <Button variant="outline">Save Draft</Button>
            <Button>Create Project</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="project-name">Project Name</Label>
          <Input id="project-name" placeholder="Enter project name..." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="project-desc">Description</Label>
          <Textarea
            id="project-desc"
            placeholder="Describe your project..."
          />
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};

export const LargeDialog: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Create Complex Configuration"
      description="This dialog can handle complex forms with multiple sections."
      maxWidth="2xl"
    >
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">First Name</Label>
              <Input id="first-name" placeholder="Enter first name..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Last Name</Label>
              <Input id="last-name" placeholder="Enter last name..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email..." />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Advanced Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="settings">Settings</Label>
            <Textarea
              id="settings"
              placeholder="Enter advanced settings..."
              rows={4}
            />
          </div>
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};

export const SmallDialog: Story = {
  render: () => (
    <CreateDialogWrapper
      title="Quick Add"
      description="Add a simple item quickly."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="item-name">Item Name</Label>
          <Input id="item-name" placeholder="Enter item name..." />
        </div>
      </div>
    </CreateDialogWrapper>
  ),
};
