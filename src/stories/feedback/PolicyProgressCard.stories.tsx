import type { Meta, StoryObj } from '@storybook/react';
import { PolicyProgressCard } from '../../features/ai-system-evaluation/components/results/summary/policy-progress-card';
import type { CheckpointState, PolicyProgress } from '@/lib/supabase/evaluation-service';

// Wrapper component for Storybook display
function PolicyProgressCardWrapper(props: React.ComponentProps<typeof PolicyProgressCard>) {
  return (
    <div className="p-4 max-w-md">
      <PolicyProgressCard {...props} />
    </div>
  );
}

const meta = {
  title: 'Feedback/Policy Progress Card',
  component: PolicyProgressCardWrapper,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PolicyProgressCardWrapper>;

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
  policies: []
});

// 1. Pending State - Not Started
export const Pending: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 0,
      total: 100,
      status: 'pending'
    },
    index: 0,
    checkpointState: createCheckpointState(null, 0, 100),
    isSinglePolicy: true
  },
};

// 2. Starting - 5% (Topics Generated)
export const Starting: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 0,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('prompts', 0, 100),
    isSinglePolicy: true
  },
};

// 3. In Progress - 25%
export const InProgress25: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 20,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('evaluation', 20, 100),
    isSinglePolicy: true
  },
};

// 4. In Progress - 50%
export const InProgress50: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 50,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('evaluation', 50, 100),
    isSinglePolicy: true
  },
};

// 5. In Progress - 75%
export const InProgress75: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 75,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('evaluation', 75, 100),
    isSinglePolicy: true
  },
};

// 6. Almost Complete - 95%
export const AlmostComplete: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 100,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('summary', 100, 100),
    isSinglePolicy: true
  },
};

// 7. Completed - 100%
export const Completed: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 100,
      total: 100,
      status: 'completed'
    },
    index: 0,
    checkpointState: {
      current_checkpoint: null,
      checkpoints: {
        topics: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { topic_count: 5 }
        },
        prompts: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: { prompt_count: 100 }
        },
        evaluation: {
          status: 'completed',
          completed_at: new Date().toISOString(),
          data: {
            completed_prompts: 100,
            total_prompts: 100
          }
        },
        summary: {
          status: 'completed',
          completed_at: new Date().toISOString()
        }
      },
      policies: []
    },
    isSinglePolicy: true
  },
};

// 8. Multi-Policy Card (Policy 1 of 3) - Completed
export const MultiPolicyCompleted: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 50,
      total: 50,
      status: 'completed'
    },
    index: 0,
    isSinglePolicy: false
  },
};

// 9. Multi-Policy Card (Policy 2 of 3) - In Progress
export const MultiPolicyInProgress: Story = {
  args: {
    policy: {
      id: 'policy-2',
      name: 'Prohibit Legal Advice',
      current: 25,
      total: 50,
      status: 'in_progress'
    },
    index: 1,
    isSinglePolicy: false
  },
};

// 10. Multi-Policy Card (Policy 3 of 3) - Pending
export const MultiPolicyPending: Story = {
  args: {
    policy: {
      id: 'policy-3',
      name: 'Prohibit Medical Diagnoses',
      current: 0,
      total: 50,
      status: 'pending'
    },
    index: 2,
    isSinglePolicy: false
  },
};

// 11. Long Policy Name
export const LongPolicyName: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Sharing Personally Identifiable Information (PII) and Protected Health Information (PHI)',
      current: 45,
      total: 100,
      status: 'in_progress'
    },
    index: 0,
    checkpointState: createCheckpointState('evaluation', 45, 100),
    isSinglePolicy: true
  },
};

// 12. Large Dataset
export const LargeDataset: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Prohibit Compensation Data',
      current: 2456,
      total: 5000,
      status: 'in_progress'
    },
    index: 0,
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
          started_at: new Date().toISOString(),
          data: {
            completed_prompts: 2456,
            total_prompts: 5000
          }
        },
        summary: {
          status: 'pending'
        }
      },
      policies: []
    },
    isSinglePolicy: true
  },
};

// 13. All States Comparison
export const AllStatesComparison: Story = {
  args: {
    policy: {
      id: 'policy-1',
      name: 'Example Policy',
      current: 0,
      total: 100,
      status: 'pending'
    },
    index: 0,
    isSinglePolicy: true
  },
  render: () => (
    <div className="space-y-4 max-w-md p-4">
      <h3 className="text-sm font-medium text-gray-900">Policy Progress States</h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-600 mb-2">Pending (0%)</p>
          <PolicyProgressCard
            policy={{
              id: 'policy-1',
              name: 'Prohibit Compensation Data',
              current: 0,
              total: 100,
              status: 'pending'
            }}
            index={0}
            checkpointState={createCheckpointState(null, 0, 100)}
            isSinglePolicy={true}
          />
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">In Progress (31%)</p>
          <PolicyProgressCard
            policy={{
              id: 'policy-1',
              name: 'Prohibit Compensation Data',
              current: 25,
              total: 100,
              status: 'in_progress'
            }}
            index={0}
            checkpointState={createCheckpointState('evaluation', 25, 100)}
            isSinglePolicy={true}
          />
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-2">Completed (100%)</p>
          <PolicyProgressCard
            policy={{
              id: 'policy-1',
              name: 'Prohibit Compensation Data',
              current: 100,
              total: 100,
              status: 'completed'
            }}
            index={0}
            checkpointState={{
              current_checkpoint: null,
              checkpoints: {
                topics: { status: 'completed', completed_at: new Date().toISOString(), data: { topic_count: 5 } },
                prompts: { status: 'completed', completed_at: new Date().toISOString(), data: { prompt_count: 100 } },
                evaluation: { status: 'completed', completed_at: new Date().toISOString(), data: { completed_prompts: 100, total_prompts: 100 } },
                summary: { status: 'completed', completed_at: new Date().toISOString() }
              },
              policies: []
            }}
            isSinglePolicy={true}
          />
        </div>
      </div>
    </div>
  ),
};
