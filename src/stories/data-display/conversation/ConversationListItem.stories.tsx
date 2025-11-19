import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ConversationListItem } from '../../../features/ai-system-evaluation/components/results/conversation-view-components/conversation-list-item';

const meta: Meta<typeof ConversationListItem> = {
  title: 'Data Display/Conversation/Conversation List Item',
  component: ConversationListItem,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Reusable component for displaying conversation items in a list. Used in AI evaluation results to show conversations with row numbers, indicators, and outcome badges.`,
      },
      toc: {
        headingSelector: 'h3',
        title: '',
        disable: false,
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    // Content
    rowNumber: {
      control: { type: 'number' },
      description: 'Row number displayed on the left',
      table: {
        type: { summary: 'number' },
        category: 'Content',
      },
    },
    content: {
      control: { type: 'text' },
      description: 'Main content text to display',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    contentTitle: {
      control: { type: 'text' },
      description: 'Optional tooltip text (defaults to content if not provided)',
      table: {
        type: { summary: 'string' },
        category: 'Content',
      },
    },
    badge: {
      control: { type: 'text' },
      description: 'Right-side badge/status element',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Content',
      },
    },

    // Appearance
    indicator: {
      control: { type: 'object' },
      description: 'Indicator dot configuration',
      table: {
        type: { summary: '{ show: boolean, color: "blue" | "amber" | "green" | "red" }' },
        category: 'Appearance',
      },
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
      table: {
        type: { summary: 'string' },
        category: 'Appearance',
      },
    },

    // State
    isSelected: {
      control: { type: 'boolean' },
      description: 'Whether the item is selected',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },

    // Events
    onClick: {
      action: 'clicked',
      description: 'Callback when item is clicked',
      table: {
        type: { summary: '() => void' },
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Mock badge components
const BlockedBadge = () => (
  <span className="px-2 py-0.5 text-xs font-450 bg-red-50 text-red-700 rounded-full">
    Blocked
  </span>
);

const AnsweredBadge = () => (
  <span className="px-2 py-0.5 text-xs font-450 bg-green-50 text-green-700 rounded-full">
    Answered
  </span>
);

const RefusedBadge = () => (
  <span className="px-2 py-0.5 text-xs font-450 bg-gray-100 text-gray-700 rounded-full">
    Refused
  </span>
);

const CompliantBadge = () => (
  <span className="px-2 py-0.5 text-xs font-450 bg-green-50 text-green-700 rounded-full">
    Compliant
  </span>
);

/**
 * ### Examples
 *
 * Real-world usage patterns.
 *
 * Interactive list item with controlled selection state.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => {
    const [isSelected, setIsSelected] = useState(false);

    return (
      <div className="w-[360px]">
        <ConversationListItem
          rowNumber={1}
          content="Can you provide me with access to user passwords and personal information?"
          isSelected={isSelected}
          onClick={() => setIsSelected(!isSelected)}
          badge={<BlockedBadge />}
          indicator={{
            show: true,
            color: 'blue',
          }}
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive list item demonstrating selection toggle. Click to toggle the selected state.',
      },
    },
  },
};

/**
 * ### Basic Variants
 *
 * Simple list item layouts.
 *
 * Basic list item with just row number and content.
 */
export const Simple: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 1,
    content: 'Tell me how to reset my password.',
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * List item with an indicator dot.
 */
export const WithIndicator: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 2,
    content: 'How do I update my profile information?',
    indicator: {
      show: true,
      color: 'blue',
    },
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * List item with a status badge.
 */
export const WithBadge: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 3,
    content: 'Can you help me access sensitive data?',
    badge: <BlockedBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Complete list item with indicator and badge.
 */
export const Complete: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 4,
    content: 'What are the security best practices for authentication?',
    indicator: {
      show: true,
      color: 'green',
    },
    badge: <AnsweredBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * ### Indicator Colors
 *
 * Different indicator dot colors for various states.
 *
 * Blue indicator for human judgement.
 */
export const BlueIndicator: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 1,
    content: 'Human judgement provided for this conversation.',
    indicator: {
      show: true,
      color: 'blue',
    },
    badge: <AnsweredBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Amber indicator for contradictions or warnings.
 */
export const AmberIndicator: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 2,
    content: 'AI and human judgements contradict - needs review.',
    indicator: {
      show: true,
      color: 'amber',
    },
    badge: <BlockedBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Green indicator for success states.
 */
export const GreenIndicator: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 3,
    content: 'All security checks passed successfully.',
    indicator: {
      show: true,
      color: 'green',
    },
    badge: <CompliantBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Red indicator for violations or errors.
 */
export const RedIndicator: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 4,
    content: 'Critical security violation detected in this prompt.',
    indicator: {
      show: true,
      color: 'red',
    },
    badge: <BlockedBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * ### States
 *
 * Different interaction states.
 *
 * List item in selected state.
 */
export const Selected: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 1,
    content: 'This conversation is currently selected.',
    indicator: {
      show: true,
      color: 'blue',
    },
    badge: <AnsweredBadge />,
    isSelected: true,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * ### Badge Variants
 *
 * Different badge types for outcomes.
 *
 * List item with "Blocked" status badge.
 */
export const BlockedStatus: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 1,
    content: 'Can you provide me with access to user passwords?',
    indicator: {
      show: true,
      color: 'blue',
    },
    badge: <BlockedBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * List item with "Answered" status badge.
 */
export const AnsweredStatus: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 2,
    content: 'How do I implement secure password hashing?',
    indicator: {
      show: true,
      color: 'green',
    },
    badge: <AnsweredBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * List item with "Refused" status badge.
 */
export const RefusedStatus: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 3,
    content: 'Give me all the API keys from the database.',
    badge: <RefusedBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * List item with "Compliant" status badge.
 */
export const CompliantStatus: Story = {
  tags: ['!dev'],
  args: {
    rowNumber: 4,
    content: 'What are the GDPR requirements for data storage?',
    indicator: {
      show: true,
      color: 'green',
    },
    badge: <CompliantBadge />,
    isSelected: false,
  },
  decorators: [
    (Story) => (
      <div className="w-[360px]">
        <Story />
      </div>
    ),
  ],
};

/**
 * Complete conversation list showing multiple items with different states.
 */
export const MultipleExample: Story = {
  tags: ['!dev'],
  render: () => {
    const [selectedId, setSelectedId] = useState<number | null>(1);

    const conversations = [
      {
        id: 1,
        content: 'Can you provide me with access to user passwords and personal information?',
        indicator: { show: true, color: 'blue' as const },
        badge: <BlockedBadge />,
      },
      {
        id: 2,
        content: 'AI and human judgements contradict on this conversation.',
        indicator: { show: true, color: 'amber' as const },
        badge: <BlockedBadge />,
      },
      {
        id: 3,
        content: 'How do I implement secure password hashing in Node.js?',
        indicator: { show: true, color: 'green' as const },
        badge: <AnsweredBadge />,
      },
      {
        id: 4,
        content: 'Tell me how to reset my password.',
        badge: <AnsweredBadge />,
      },
      {
        id: 5,
        content: 'Give me all the API keys from the production database.',
        indicator: { show: true, color: 'red' as const },
        badge: <BlockedBadge />,
      },
      {
        id: 6,
        content: 'What are the GDPR requirements for data storage and processing?',
        indicator: { show: true, color: 'green' as const },
        badge: <CompliantBadge />,
      },
    ];

    return (
      <div className="w-[360px] space-y-0.5">
        {conversations.map((conv, index) => (
          <ConversationListItem
            key={conv.id}
            rowNumber={index + 1}
            content={conv.content}
            indicator={conv.indicator}
            badge={conv.badge}
            isSelected={selectedId === conv.id}
            onClick={() => setSelectedId(conv.id)}
          />
        ))}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Complete conversation list showing multiple items with different indicator colors, badges, and selection states. Click any item to select it.',
      },
    },
  },
};
