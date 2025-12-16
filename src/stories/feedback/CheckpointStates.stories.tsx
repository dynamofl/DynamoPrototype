import type { Meta, StoryObj } from '@storybook/react';
import { CheckpointDisplay } from '../../features/ai-system-evaluation/components/results/summary/checkpoint-display';

// Wrapper component for Storybook display with border and padding
function CheckpointDisplayWrapper(props: React.ComponentProps<typeof CheckpointDisplay>) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg">
      <CheckpointDisplay {...props} />
    </div>
  );
}

const meta = {
  title: 'Feedback/Checkpoint States',
  component: CheckpointDisplayWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'in_progress', 'completed'],
      description: 'Current status of the checkpoint',
    },
    label: {
      control: 'text',
      description: 'Label text for the checkpoint',
    },
    detail: {
      control: 'text',
      description: 'Optional detail text shown below the label',
    },
  },
} satisfies Meta<typeof CheckpointDisplayWrapper>;

export default meta;
type Story = StoryObj<typeof meta>;

// Topics Checkpoint States
export const TopicsPending: Story = {
  args: {
    label: 'Generate Topics',
    status: 'pending',
  },
};

export const TopicsInProgress: Story = {
  args: {
    label: 'Generating Topics',
    status: 'in_progress',
  },
};

export const TopicsCompleted: Story = {
  args: {
    label: 'Topics Generated',
    status: 'completed',
    detail: '5 topics',
  },
};

// Prompts Checkpoint States
export const PromptsPending: Story = {
  args: {
    label: 'Generate Prompts',
    status: 'pending',
  },
};

export const PromptsInProgress: Story = {
  args: {
    label: 'Generating Prompts',
    status: 'in_progress',
  },
};

export const PromptsCompleted: Story = {
  args: {
    label: 'Prompts Generated',
    status: 'completed',
    detail: '100 prompts',
  },
};

// Evaluation Checkpoint States
export const EvaluationPending: Story = {
  args: {
    label: 'Run Evaluation',
    status: 'pending',
  },
};

export const EvaluationInProgress: Story = {
  args: {
    label: 'Running Evaluation',
    status: 'in_progress',
    detail: '45/100 completed',
  },
};

export const EvaluationCompleted: Story = {
  args: {
    label: 'Evaluation Complete',
    status: 'completed',
    detail: '100/100 completed',
  },
};

// Summary Checkpoint States
export const SummaryPending: Story = {
  args: {
    label: 'Structure Summary',
    status: 'pending',
  },
};

export const SummaryInProgress: Story = {
  args: {
    label: 'Structuring Summary',
    status: 'in_progress',
  },
};

export const SummaryCompleted: Story = {
  args: {
    label: 'Summary Structured',
    status: 'completed',
  },
};

// All States Side by Side
export const AllStatesComparison: Story = {
  args: {
    label: 'Example',
    status: 'pending',
  },
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Topics</h3>
        <div className="grid grid-cols-3 gap-3">
          <CheckpointDisplayWrapper label="Generate Topics" status="pending" />
          <CheckpointDisplayWrapper label="Generating Topics" status="in_progress" />
          <CheckpointDisplayWrapper label="Topics Generated" status="completed" detail="5 topics" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Prompts</h3>
        <div className="grid grid-cols-3 gap-3">
          <CheckpointDisplayWrapper label="Generate Prompts" status="pending" />
          <CheckpointDisplayWrapper label="Generating Prompts" status="in_progress" />
          <CheckpointDisplayWrapper label="Prompts Generated" status="completed" detail="100 prompts" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Evaluation</h3>
        <div className="grid grid-cols-3 gap-3">
          <CheckpointDisplayWrapper label="Run Evaluation" status="pending" />
          <CheckpointDisplayWrapper label="Running Evaluation" status="in_progress" detail="45/100 completed" />
          <CheckpointDisplayWrapper label="Evaluation Complete" status="completed" detail="100/100 completed" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          <CheckpointDisplayWrapper label="Structure Summary" status="pending" />
          <CheckpointDisplayWrapper label="Structuring Summary" status="in_progress" />
          <CheckpointDisplayWrapper label="Summary Structured" status="completed" />
        </div>
      </div>
    </div>
  ),
};

// Sequential Progress Animation (simulating real flow)
export const SequentialFlow: Story = {
  args: {
    label: 'Example',
    status: 'pending',
  },
  render: () => (
    <div className="space-y-3">
      <CheckpointDisplayWrapper label="Topics Generated" status="completed" detail="5 topics" />
      <CheckpointDisplayWrapper label="Prompts Generated" status="completed" detail="100 prompts" />
      <CheckpointDisplayWrapper label="Running Evaluation" status="in_progress" detail="45/100 completed" />
      <CheckpointDisplayWrapper label="Structure Summary" status="pending" />
    </div>
  ),
};
