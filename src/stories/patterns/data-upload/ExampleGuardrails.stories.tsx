import type { Meta, StoryObj } from '@storybook/react';
import { ExampleGuardrails } from '@/components/patterns/ui-patterns/example-guardrails';

const meta: Meta<typeof ExampleGuardrails> = {
  title: 'Patterns/Data Upload/Example Guardrails',
  component: ExampleGuardrails,
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
