import type { Meta, StoryObj } from '@storybook/react';
import { ProgressCheckpointsSection } from '@/features/ai-system-evaluation/components/results/summary/progress-checkpoints-section';
import type { CheckpointState } from '@/lib/supabase/evaluation-service';

const meta = {
  title: 'Feedback/Progress Checkpoints',
  component: ProgressCheckpointsSection,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProgressCheckpointsSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// Helper to create checkpoint state
const createCheckpointState = (
  currentCheckpoint: 'topics' | 'prompts' | 'evaluation' | 'summary' | null,
  completedPrompts: number = 0,
  totalPrompts: number = 100
): CheckpointState => ({
  current_checkpoint: currentCheckpoint,
  checkpoints: {
    topics: {
      status: currentCheckpoint === 'topics' ? 'in_progress' :
              (currentCheckpoint === 'prompts' || currentCheckpoint === 'evaluation' || currentCheckpoint === 'summary') ? 'completed' :
              'pending',
      ...(currentCheckpoint !== 'topics' && currentCheckpoint !== null ? {
        completed_at: new Date().toISOString(),
        data: { topic_count: 5 }
      } : currentCheckpoint === 'topics' ? {
        started_at: new Date().toISOString()
      } : {})
    },
    prompts: {
      status: currentCheckpoint === 'prompts' ? 'in_progress' :
              (currentCheckpoint === 'evaluation' || currentCheckpoint === 'summary') ? 'completed' :
              'pending',
      ...(currentCheckpoint === 'evaluation' || currentCheckpoint === 'summary' ? {
        completed_at: new Date().toISOString(),
        data: { prompt_count: totalPrompts }
      } : currentCheckpoint === 'prompts' ? {
        started_at: new Date().toISOString()
      } : {})
    },
    evaluation: {
      status: currentCheckpoint === 'evaluation' ? 'in_progress' :
              currentCheckpoint === 'summary' ? 'completed' :
              'pending',
      ...(currentCheckpoint === 'evaluation' || currentCheckpoint === 'summary' ? {
        data: {
          completed_prompts: completedPrompts,
          total_prompts: totalPrompts
        }
      } : {}),
      ...(currentCheckpoint === 'summary' ? { completed_at: new Date().toISOString() } :
          currentCheckpoint === 'evaluation' ? { started_at: new Date().toISOString() } : {})
    },
    summary: {
      status: currentCheckpoint === 'summary' ? 'in_progress' : 'pending',
      ...(currentCheckpoint === 'summary' ? { started_at: new Date().toISOString() } : {})
    }
  },
  policies: [
    {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: completedPrompts,
      total: totalPrompts,
      status: completedPrompts === 0 ? 'pending' : completedPrompts === totalPrompts ? 'completed' : 'in_progress'
    }
  ]
});

// 1. Just Started - All Pending
export const JustStarted: Story = {
  args: {
    current: 0,
    total: 100,
    stage: 'Setting up test environment',
    startedAt: new Date().toISOString(),
    policies: [],
    checkpointState: createCheckpointState(null, 0, 100)
  },
};

// 2. Generating Topics
export const GeneratingTopics: Story = {
  args: {
    current: 0,
    total: 100,
    stage: 'Generating Topics',
    startedAt: new Date(Date.now() - 10000).toISOString(),
    policies: [],
    checkpointState: createCheckpointState('topics', 0, 100)
  },
};

// 3. Topics Generated - Generating Prompts
export const GeneratingPrompts: Story = {
  args: {
    current: 0,
    total: 100,
    stage: 'Generating Prompts',
    startedAt: new Date(Date.now() - 30000).toISOString(),
    policies: [],
    checkpointState: createCheckpointState('prompts', 0, 100)
  },
};

// 4. Running Evaluation - 10% Complete
export const Evaluation10Percent: Story = {
  args: {
    current: 10,
    total: 100,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 60000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 10,
        total: 100,
        status: 'in_progress' as const
      }
    ],
    checkpointState: createCheckpointState('evaluation', 10, 100)
  },
};

// 5. Running Evaluation - 50% Complete
export const Evaluation50Percent: Story = {
  args: {
    current: 50,
    total: 100,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 120000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 50,
        total: 100,
        status: 'in_progress' as const
      }
    ],
    checkpointState: createCheckpointState('evaluation', 50, 100)
  },
};

// 6. Running Evaluation - 90% Complete
export const Evaluation90Percent: Story = {
  args: {
    current: 90,
    total: 100,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 180000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 90,
        total: 100,
        status: 'in_progress' as const
      }
    ],
    checkpointState: createCheckpointState('evaluation', 90, 100)
  },
};

// 7. Structuring Summary
export const StructuringSummary: Story = {
  args: {
    current: 100,
    total: 100,
    stage: 'Structuring Summary',
    startedAt: new Date(Date.now() - 240000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 100,
        total: 100,
        status: 'completed' as const
      }
    ],
    checkpointState: createCheckpointState('summary', 100, 100)
  },
};

// 8. Multi-Policy Evaluation - In Progress
export const MultiPolicyEvaluation: Story = {
  args: {
    current: 75,
    total: 150,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 180000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 50,
        total: 50,
        status: 'completed' as const
      },
      {
        id: 'policy-2',
        name: 'Prohibit Legal Advice',
        current: 25,
        total: 50,
        status: 'in_progress' as const
      },
      {
        id: 'policy-3',
        name: 'Prohibit Medical Diagnoses',
        current: 0,
        total: 50,
        status: 'pending' as const
      }
    ],
    checkpointState: {
      current_checkpoint: 'evaluation',
      checkpoints: {
        topics: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { topic_count: 15 }
        },
        prompts: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { prompt_count: 150 }
        },
        evaluation: {
          status: 'in_progress',
          started_at: new Date(Date.now() - 120000).toISOString(),
          data: {
            completed_prompts: 75,
            total_prompts: 150
          }
        },
        summary: {
          status: 'pending'
        }
      },
      policies: [
        {
          id: 'policy-1',
          name: 'Prohibit Compensation Data',
          current: 50,
          total: 50,
          status: 'completed' as const
        },
        {
          id: 'policy-2',
          name: 'Prohibit Legal Advice',
          current: 25,
          total: 50,
          status: 'in_progress' as const
        },
        {
          id: 'policy-3',
          name: 'Prohibit Medical Diagnoses',
          current: 0,
          total: 50,
          status: 'pending' as const
        }
      ]
    }
  },
};

// 9. Edge Case - No Policies (Fallback to Checkpoints)
export const NoPoliciesFallback: Story = {
  args: {
    current: 35,
    total: 100,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 90000).toISOString(),
    policies: [],
    checkpointState: createCheckpointState('evaluation', 35, 100)
  },
};

// 10. Large Numbers
export const LargeDataset: Story = {
  args: {
    current: 2456,
    total: 5000,
    stage: 'Running Evaluation',
    startedAt: new Date(Date.now() - 300000).toISOString(),
    policies: [
      {
        id: 'policy-1',
        name: 'Prohibit Compensation Data',
        current: 2456,
        total: 5000,
        status: 'in_progress' as const
      }
    ],
    checkpointState: {
      current_checkpoint: 'evaluation',
      checkpoints: {
        topics: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { topic_count: 50 }
        },
        prompts: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { prompt_count: 5000 }
        },
        evaluation: {
          status: 'in_progress',
          started_at: new Date(Date.now() - 240000).toISOString(),
          data: {
            completed_prompts: 2456,
            total_prompts: 5000
          }
        },
        summary: {
          status: 'pending'
        }
      },
      policies: [
        {
          id: 'policy-1',
          name: 'Prohibit Compensation Data',
          current: 2456,
          total: 5000,
          status: 'in_progress' as const
        }
      ]
    }
  },
};
