import type { Meta, StoryObj } from '@storybook/react';
import { AISystemIcon } from '../../components/patterns/ui-patterns/ai-system-icon';

const meta: Meta<typeof AISystemIcon> = {
  title: 'Patterns/AISystemIcon',
  component: AISystemIcon,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['OpenAI', 'Azure', 'Mistral', 'Databricks', 'HuggingFace', 'Anthropic', 'Remote', 'Local', 'AWS', 'DynamoAI'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAI: Story = {
  args: {
    type: 'OpenAI',
  },
};

export const Azure: Story = {
  args: {
    type: 'Azure',
  },
};

export const Mistral: Story = {
  args: {
    type: 'Mistral',
  },
};

export const Databricks: Story = {
  args: {
    type: 'Databricks',
  },
};

export const HuggingFace: Story = {
  args: {
    type: 'HuggingFace',
  },
};

export const Anthropic: Story = {
  args: {
    type: 'Anthropic',
  },
};

export const Remote: Story = {
  args: {
    type: 'Remote',
  },
};

export const Local: Story = {
  args: {
    type: 'Local',
  },
};

export const AWS: Story = {
  args: {
    type: 'AWS',
  },
};

export const DynamoAI: Story = {
  args: {
    type: 'DynamoAI',
  },
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="OpenAI" />
        <span className="text-sm">OpenAI</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Azure" />
        <span className="text-sm">Azure</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Mistral" />
        <span className="text-sm">Mistral</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Databricks" />
        <span className="text-sm">Databricks</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="HuggingFace" />
        <span className="text-sm">HuggingFace</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Anthropic" />
        <span className="text-sm">Anthropic</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Remote" />
        <span className="text-sm">Remote</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="Local" />
        <span className="text-sm">Local</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="AWS" />
        <span className="text-sm">AWS</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <AISystemIcon type="DynamoAI" />
        <span className="text-sm">DynamoAI</span>
      </div>
    </div>
  ),
};
