import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { UnifiedJudgementReviewCard } from '../../../features/ai-system-evaluation/components/results/conversation-view-components/unified-judgement-review-card';
import type { GuardrailEvaluationDetail } from '../../../features/ai-system-evaluation/types/jailbreak-evaluation';
import type { BaseEvaluationResult } from '../../../features/ai-system-evaluation/types/base-evaluation';
import type { HoveredBehaviorContext } from '../../../components/patterns/ui-patterns/phrase-highlighter';

const meta: Meta<typeof UnifiedJudgementReviewCard> = {
  title: 'Data Display/Conversation/Unified Judgement Review Card',
  component: UnifiedJudgementReviewCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Unified component for reviewing AI judgements in evaluation results. Supports two variants:

1. **Guardrail Variant**: Multi-select checkboxes for reviewing guardrail violations
2. **Response Variant**: Single-select radio buttons for reviewing model response compliance

Features:
- Numbered question headers
- LLM judgement badges (LLM-Answer, LLM)
- User selection tracking with reviewer initials
- Expandable reasoning sections
- Preview policy on hover (guardrail variant)
- Phrase highlighting support`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data for guardrails
const mockGuardrails: GuardrailEvaluationDetail[] = [
  {
    guardrailId: 'policy-1',
    guardrailName: 'Prohibit Financial Advice',
    judgement: 'Blocked',
    reason: 'Contains financial advice',
    violations: [
      {
        phrase: 'investment recommendation',
        violatedBehaviors: ['Providing specific investment advice', 'Recommending financial products']
      },
      {
        phrase: 'stock tips',
        violatedBehaviors: ['Offering stock market predictions']
      }
    ]
  },
  {
    guardrailId: 'policy-2',
    guardrailName: 'Prohibit Medical Diagnosis',
    judgement: 'Allowed',
    reason: 'No medical diagnosis detected',
  },
  {
    guardrailId: 'policy-3',
    guardrailName: 'Prohibit Legal Advice',
    judgement: 'Allowed',
    reason: 'No legal advice detected',
  }
];

// Mock data for response judgement
const mockResponseRecord: BaseEvaluationResult = {
  id: 'eval-123',
  prompt: 'Test prompt',
  judgeModelJudgement: 'Answered',
  judgeModelAnswerPhrases: [
    {
      phrase: 'salary comparison',
      reasoning: 'This phrase addresses the initial step needed to compare salaries.'
    },
    {
      phrase: 'data structure',
      reasoning: 'This phrase suggests how to structure the data for effective analysis.'
    },
    {
      phrase: 'analysis method',
      reasoning: 'This phrase provides a method for analyzing the salary data to make comparisons.'
    }
  ],
  system_response: {
    response: 'Response text',
    human_judgement: null
  }
} as any;

const mockResponseRecordWithHumanJudgement: BaseEvaluationResult = {
  ...mockResponseRecord,
  system_response: {
    response: 'Response text',
    human_judgement: {
      judgement: 'Answered',
      judgedBy: 'user-123',
      judgedAt: new Date().toISOString()
    }
  }
} as any;

/**
 * ### Guardrail Variant
 *
 * Multi-select checkboxes for reviewing guardrail violations.
 *
 * Shows guardrail judgement review with LLM-predicted violations.
 */
export const GuardrailVariant: Story = {
  tags: ['!dev'],
  render: () => {
    const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null);
    const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string>>(new Set());

    const handleBehaviorClick = (behavior: HoveredBehaviorContext) => {
      setSelectedBehaviors((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(behavior.behavior)) {
          newSet.delete(behavior.behavior);
        } else {
          newSet.add(behavior.behavior);
        }
        return newSet;
      });
    };

    return (
      <UnifiedJudgementReviewCard
        variant="guardrail"
        questionNumber={1}
        inputGuardrails={mockGuardrails}
        outputGuardrails={[]}
        isAnnotationModeEnabled={true}
        onPreviewPolicy={(policyId, policyName) => {
          console.log('Preview policy:', policyId, policyName);
        }}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={setHoveredBehavior}
        onBehaviorClick={handleBehaviorClick}
        selectedBehaviors={selectedBehaviors}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Guardrail variant with multi-select checkboxes. Click checkboxes to select guardrails, hover over guardrail names to see preview button, expand LLM Predicted Violations to see reasoning.',
      },
    },
  },
};

/**
 * Guardrail variant in disabled state (annotation mode off).
 */
export const GuardrailDisabled: Story = {
  tags: ['!dev'],
  render: () => (
    <UnifiedJudgementReviewCard
      variant="guardrail"
      questionNumber={1}
      inputGuardrails={mockGuardrails}
      outputGuardrails={[]}
      isAnnotationModeEnabled={false}
      hoveredBehavior={null}
      onBehaviorHover={() => {}}
      onBehaviorClick={() => {}}
      selectedBehaviors={new Set()}
    />
  ),
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Guardrail variant with annotation mode disabled. Checkboxes are disabled and cannot be interacted with.',
      },
    },
  },
};

/**
 * ### Response Variant
 *
 * Single-select radio buttons for reviewing model response compliance.
 *
 * Shows response judgement review with LLM reasoning.
 */
export const ResponseVariant: Story = {
  tags: ['!dev'],
  render: () => {
    const [hoveredBehavior, setHoveredBehavior] = useState<HoveredBehaviorContext | null>(null);
    const [selectedBehaviors, setSelectedBehaviors] = useState<Set<string>>(new Set());

    const handleBehaviorClick = (behavior: HoveredBehaviorContext) => {
      setSelectedBehaviors((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(behavior.behavior)) {
          newSet.delete(behavior.behavior);
        } else {
          newSet.add(behavior.behavior);
        }
        return newSet;
      });
    };

    return (
      <UnifiedJudgementReviewCard
        variant="response"
        questionNumber={2}
        record={mockResponseRecord}
        testType="compliance"
        isAnnotationModeEnabled={true}
        onRecordUpdate={(record) => {
          console.log('Record updated:', record);
        }}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={setHoveredBehavior}
        onBehaviorClick={handleBehaviorClick}
        selectedBehaviors={selectedBehaviors}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Response variant with single-select radio buttons. Click Yes/No to provide human judgement, expand LLM Reasoning to see AI analysis.',
      },
    },
  },
};

/**
 * Response variant with user selection.
 */
export const ResponseWithSelection: Story = {
  tags: ['!dev'],
  render: () => (
    <UnifiedJudgementReviewCard
      variant="response"
      questionNumber={2}
      record={mockResponseRecordWithHumanJudgement}
      testType="jailbreak"
      isAnnotationModeEnabled={true}
      onRecordUpdate={(record) => {
        console.log('Record updated:', record);
      }}
      hoveredBehavior={null}
      onBehaviorHover={() => {}}
      onBehaviorClick={() => {}}
      selectedBehaviors={new Set()}
    />
  ),
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Response variant showing both LLM judgement (LLM badge) and human selection (reviewer initials badge).',
      },
    },
  },
};

/**
 * ### Different Test Types
 *
 * Response variant adapts question text based on test type.
 *
 * Jailbreak test type - asks if model answered the attack prompt.
 */
export const JailbreakTestType: Story = {
  tags: ['!dev'],
  render: () => (
    <UnifiedJudgementReviewCard
      variant="response"
      questionNumber={2}
      record={mockResponseRecord}
      testType="jailbreak"
      isAnnotationModeEnabled={true}
      onRecordUpdate={(record) => {
        console.log('Record updated:', record);
      }}
      hoveredBehavior={null}
      onBehaviorHover={() => {}}
      onBehaviorClick={() => {}}
      selectedBehaviors={new Set()}
    />
  ),
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Response judgement for jailbreak test type. Question: "Did the Model Answer the Attack Prompt?"',
      },
    },
  },
};

/**
 * Hallucination test type - asks if model hallucinated.
 */
export const HallucinationTestType: Story = {
  tags: ['!dev'],
  render: () => (
    <UnifiedJudgementReviewCard
      variant="response"
      questionNumber={2}
      record={mockResponseRecord}
      testType="hallucination"
      isAnnotationModeEnabled={true}
      onRecordUpdate={(record) => {
        console.log('Record updated:', record);
      }}
      hoveredBehavior={null}
      onBehaviorHover={() => {}}
      onBehaviorClick={() => {}}
      selectedBehaviors={new Set()}
    />
  ),
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Response judgement for hallucination test type. Question: "Did the Model Hallucinate in Its Response?"',
      },
    },
  },
};

/**
 * ### Interactive States
 *
 * Shows hover and selection behaviors.
 *
 * Guardrail with hovered behavior highlighting.
 */
export const GuardrailHoverState: Story = {
  tags: ['!dev'],
  render: () => {
    const hoveredBehavior: HoveredBehaviorContext = {
      behavior: 'Providing specific investment advice',
      guardrailName: 'Prohibit Financial Advice'
    };

    return (
      <UnifiedJudgementReviewCard
        variant="guardrail"
        questionNumber={1}
        inputGuardrails={mockGuardrails}
        outputGuardrails={[]}
        isAnnotationModeEnabled={true}
        onPreviewPolicy={(policyId, policyName) => {
          console.log('Preview policy:', policyId, policyName);
        }}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={() => {}}
        onBehaviorClick={() => {}}
        selectedBehaviors={new Set()}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows behavior highlighting when hovering over violated behaviors in the expanded reasoning section.',
      },
    },
  },
};

/**
 * Response with hovered reasoning phrase.
 */
export const ResponseHoverState: Story = {
  tags: ['!dev'],
  render: () => {
    const hoveredBehavior: HoveredBehaviorContext = {
      behavior: 'This phrase addresses the initial step needed to compare salaries.',
      guardrailName: 'LLM Reasoning'
    };
    const selectedBehaviors = new Set(['This phrase addresses the initial step needed to compare salaries.']);

    return (
      <UnifiedJudgementReviewCard
        variant="response"
        questionNumber={2}
        record={mockResponseRecord}
        testType="compliance"
        isAnnotationModeEnabled={true}
        onRecordUpdate={(record) => {
          console.log('Record updated:', record);
        }}
        hoveredBehavior={hoveredBehavior}
        onBehaviorHover={() => {}}
        onBehaviorClick={() => {}}
        selectedBehaviors={selectedBehaviors}
      />
    );
  },
  decorators: [
    (Story) => (
      <div className="w-[640px]">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: 'Shows reasoning phrase highlighting when hovering over phrases in the expanded LLM reasoning section.',
      },
    },
  },
};
