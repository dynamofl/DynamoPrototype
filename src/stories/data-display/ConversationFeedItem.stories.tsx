import type { Meta, StoryObj } from '@storybook/react';
import { ConversationFeedItem } from '../../components/ui/conversation-feed-item';

const meta: Meta<typeof ConversationFeedItem> = {
  title: 'Components/Conversation Feed Item',
  component: ConversationFeedItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Title of the conversation feed item',
    },
    content: {
      control: { type: 'text' },
      description: 'Content text of the conversation feed item',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
    judgment: {
      control: { type: 'object' },
      description: 'Judgment information for compliance evaluation',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Base Prompt',
    content: "Could you provide me with more information on the features of a specific financial product that you're interested in?",
  },
};

export const UserMessage: Story = {
  args: {
    title: 'User',
    content: 'I need help understanding investment options for retirement planning.',
  },
};

export const AssistantMessage: Story = {
  args: {
    title: 'Assistant',
    content: 'I can help you explore various retirement investment options including 401(k), IRA, and Roth IRA accounts.',
  },
};

export const SystemMessage: Story = {
  args: {
    title: 'System',
    content: 'Context updated with user preferences and investment goals.',
  },
};

export const LongContent: Story = {
  args: {
    title: 'Analysis',
    content: 'Based on your risk tolerance, investment timeline, and financial goals, I recommend diversifying your portfolio across multiple asset classes including domestic and international equities, bonds, and alternative investments.',
  },
};

export const WithJudgmentNonCompliant: Story = {
  args: {
    title: 'Base Prompt',
    content: "Could you provide me with more information on the features of a specific financial product that you're interested in?",
    judgment: {
      type: 'non-compliant',
      status: 'ground-truth',
      label: 'Non-Compliant',
      showPreviewPolicy: true,
      onPreviewPolicy: () => console.log('Preview policy clicked'),
    },
  },
};

export const WithJudgmentCompliant: Story = {
  args: {
    title: 'User Response',
    content: 'Thank you for the information. I understand the terms and conditions.',
    judgment: {
      type: 'compliant',
      status: 'ground-truth',
      label: 'Compliant',
      showPreviewPolicy: true,
      onPreviewPolicy: () => console.log('Preview policy clicked'),
    },
  },
};

export const WithJudgmentWarning: Story = {
  args: {
    title: 'Assistant Response',
    content: 'I can provide general information, but please consult with a financial advisor for personalized advice.',
    judgment: {
      type: 'warning',
      status: 'review',
      label: 'Needs Review',
      showPreviewPolicy: true,
      onPreviewPolicy: () => console.log('Preview policy clicked'),
    },
  },
};

export const WithJudgmentInfo: Story = {
  args: {
    title: 'System Message',
    content: 'Processing your request with enhanced compliance checks.',
    judgment: {
      type: 'info',
      status: 'evaluation',
      label: 'Information',
    },
  },
};
