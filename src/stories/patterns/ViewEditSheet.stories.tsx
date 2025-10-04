import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ViewEditSheet } from '../../components/patterns/ui-patterns/view-edit-sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data
const mockItem = {
  id: '1',
  name: 'GPT-4 System',
  description: 'Advanced AI model for complex tasks',
  status: 'active',
  createdAt: '2024-01-15',
  provider: 'OpenAI'
};

// Wrapper component to manage state
const ViewEditSheetWrapper = ({
  mode = 'view',
  title,
  children
}: {
  mode?: 'view' | 'edit';
  title: string;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  const [currentMode, setCurrentMode] = React.useState<'view' | 'edit'>(mode);

  return (
    <ViewEditSheet
      trigger={<Button>Open {title}</Button>}
      title={title}
      open={open}
      onOpenChange={setOpen}
      mode={currentMode}
      onModeChange={setCurrentMode}
    >
      {children}
    </ViewEditSheet>
  );
};

const meta: Meta<typeof ViewEditSheet> = {
  title: 'Patterns/ViewEditSheet',
  component: ViewEditSheet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A sheet component that can switch between view and edit modes for displaying and editing item details.',
      },
    },
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ViewMode: Story = {
  render: () => (
    <ViewEditSheetWrapper mode="view" title="System Details">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[0.8125rem]  font-medium">Name</Label>
            <p className="text-[0.8125rem]  text-muted-foreground mt-1">{mockItem.name}</p>
          </div>
          <div>
            <Label className="text-[0.8125rem]  font-medium">Status</Label>
            <p className="text-[0.8125rem]  text-muted-foreground mt-1 capitalize">{mockItem.status}</p>
          </div>
        </div>
        <div>
          <Label className="text-[0.8125rem]  font-medium">Description</Label>
          <p className="text-[0.8125rem]  text-muted-foreground mt-1">{mockItem.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-[0.8125rem]  font-medium">Provider</Label>
            <p className="text-[0.8125rem]  text-muted-foreground mt-1">{mockItem.provider}</p>
          </div>
          <div>
            <Label className="text-[0.8125rem]  font-medium">Created</Label>
            <p className="text-[0.8125rem]  text-muted-foreground mt-1">{mockItem.createdAt}</p>
          </div>
        </div>
      </div>
    </ViewEditSheetWrapper>
  ),
};

export const EditMode: Story = {
  render: () => (
    <ViewEditSheetWrapper mode="edit" title="Edit System">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" defaultValue={mockItem.name} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" defaultValue={mockItem.description} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Input id="provider" defaultValue={mockItem.provider} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Input id="status" defaultValue={mockItem.status} />
          </div>
        </div>
      </div>
    </ViewEditSheetWrapper>
  ),
};

export const ComplexForm: Story = {
  render: () => (
    <ViewEditSheetWrapper mode="edit" title="Advanced Configuration">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="system-name">System Name</Label>
              <Input id="system-name" defaultValue="Advanced AI System" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Version</Label>
              <Input id="version" defaultValue="2.1.0" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              defaultValue="This is an advanced AI system with multiple capabilities and features."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="max-tokens">Max Tokens</Label>
              <Input id="max-tokens" type="number" defaultValue="4096" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input id="temperature" type="number" step="0.1" defaultValue="0.7" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Security Settings</h3>
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input id="api-key" type="password" defaultValue="sk-..." />
          </div>
        </div>
      </div>
    </ViewEditSheetWrapper>
  ),
};
