import type { Meta, StoryObj } from '@storybook/react';
import { CSVUpload } from '@/components/patterns/ui-patterns/csv-upload';

const meta: Meta<typeof CSVUpload> = {
  title: 'Patterns/Data Upload/CSV Upload',
  component: CSVUpload,
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
