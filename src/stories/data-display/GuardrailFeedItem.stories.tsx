import type { Meta, StoryObj } from '@storybook/react';
import { GuardrailFeedItem } from '../../components/ui/guardrail-feed-item';

const meta: Meta<typeof GuardrailFeedItem> = {
  title: 'Components/Guardrail Feed Item',
  component: GuardrailFeedItem,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    title: {
      control: { type: 'text' },
      description: 'Title of the guardrail feed item',
    },
    guardrailJudgments: {
      control: { type: 'object' },
      description: 'Array of guardrail judgments for compliance evaluation',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    guardrailJudgments: [
      {
        name: 'Prohibit Compensation Data',
        type: 'blocked',
        label: 'Blocked',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Compensation Data policy clicked'),
      },
      {
        name: 'Prohibit Financial Advice',
        type: 'blocked',
        label: 'Blocked',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Financial Advice policy clicked'),
      },
    ],
  },
};

export const CompliantGuardrails: Story = {
  args: {
    guardrailJudgments: [
      {
        name: 'Content Safety Filter',
        type: 'compliant',
        label: 'Compliant',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Content Safety policy clicked'),
      },
      {
        name: 'Privacy Protection',
        type: 'compliant',
        label: 'Compliant',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Privacy policy clicked'),
      },
    ],
  },
};

export const MixedGuardrails: Story = {
  args: {
    guardrailJudgments: [
      {
        name: 'Prohibit Financial Advice',
        type: 'blocked',
        label: 'Blocked',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Financial Advice policy clicked'),
      },
      {
        name: 'Content Safety Filter',
        type: 'compliant',
        label: 'Compliant',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Content Safety policy clicked'),
      },
      {
        name: 'Require Disclaimers',
        type: 'warning',
        label: 'Warning',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Disclaimers policy clicked'),
      },
    ],
  },
};

export const WithoutPreviewPolicy: Story = {
  args: {
    guardrailJudgments: [
      {
        name: 'Basic Content Filter',
        type: 'compliant',
        label: 'Compliant',
      },
      {
        name: 'Spam Detection',
        type: 'blocked',
        label: 'Blocked',
      },
    ],
  },
};

export const CustomTitle: Story = {
  args: {
    title: 'Output Guardrails',
    guardrailJudgments: [
      {
        name: 'Content Moderation',
        type: 'compliant',
        label: 'Compliant',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Content Moderation policy clicked'),
      },
      {
        name: 'Tone Guidelines',
        type: 'warning',
        label: 'Warning',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Tone Guidelines policy clicked'),
      },
    ],
  },
};

export const SingleGuardrail: Story = {
  args: {
    guardrailJudgments: [
      {
        name: 'Prohibit Compensation Data',
        type: 'blocked',
        label: 'Blocked',
        showPreviewPolicy: true,
        onPreviewPolicy: () => console.log('Preview Compensation Data policy clicked'),
      },
    ],
  },
};