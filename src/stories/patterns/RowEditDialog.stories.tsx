import type { Meta, StoryObj } from '@storybook/react';
import { RowEditDialog } from '@/components/patterns/ui-patterns/row-edit-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const meta: Meta<typeof RowEditDialog> = {
  title: 'Patterns/RowEditDialog',
  component: RowEditDialog,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the dialog is open',
    },
    onOpenChange: {
      action: 'onOpenChange',
      description: 'Callback when open state changes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

const DialogWrapper = (args) => {
  const [open, setOpen] = useState(false);
  
  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Dialog</Button>
      <RowEditDialog 
        {...args} 
        open={open} 
        onOpenChange={setOpen}
      />
    </div>
  );
};

export const Default: Story = {
  render: DialogWrapper,
  args: {
    title: 'Example Dialog',
    description: 'This is an example dialog component',
  },
};
