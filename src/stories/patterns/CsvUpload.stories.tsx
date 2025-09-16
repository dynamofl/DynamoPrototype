import type { Meta, StoryObj } from '@storybook/react';
import { CsvUpload } from '@/components/patterns/ui-patterns/csv-upload';

const meta: Meta<typeof CsvUpload> = {
  title: 'Patterns/CsvUpload',
  component: CsvUpload,
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
