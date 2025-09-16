import type { Meta, StoryObj } from '@storybook/react';
import { CSVPreview } from '@/components/patterns/ui-patterns/csv-preview';

const meta: Meta<typeof CSVPreview> = {
  title: 'Patterns/CSVPreview',
  component: CSVPreview,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    // Add your component's props here
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Add default props here
  },
};
