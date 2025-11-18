import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { AISystemsTable } from '../../components/patterns/ui-patterns/ai-systems-table';
import type { AISystem } from '../../components/patterns/ui-patterns/ai-systems-table';

// Mock data for the AI systems table
const mockAISystems: AISystem[] = [
  {
    id: '1',
    name: 'GPT-4 Production',
    project: 'Web Chat',
    owner: 'John Doe',
    createdAt: '2024-01-15',
    status: 'active',
    icon: 'OpenAI',
    hasGuardrails: true,
    isEvaluated: true,
  },
  {
    id: '2',
    name: 'Claude 2.1',
    project: 'Content Generation',
    owner: 'Jane Smith',
    createdAt: '2024-01-20',
    status: 'active',
    icon: 'Anthropic',
    hasGuardrails: true,
    isEvaluated: true,
  },
  {
    id: '3',
    name: 'Azure OpenAI GPT-3.5',
    project: 'API Services',
    owner: 'Bob Johnson',
    createdAt: '2024-01-25',
    status: 'inactive',
    icon: 'Azure',
    hasGuardrails: false,
    isEvaluated: false,
  },
  {
    id: '4',
    name: 'Mistral 7B',
    project: 'Research',
    owner: 'Alice Wilson',
    createdAt: '2024-01-30',
    status: 'active',
    icon: 'Mistral',
    hasGuardrails: true,
    isEvaluated: true,
  },
  {
    id: '5',
    name: 'Databricks Dolly',
    project: 'Data Analysis',
    owner: 'Charlie Brown',
    createdAt: '2024-02-01',
    status: 'active',
    icon: 'Databricks',
    hasGuardrails: false,
    isEvaluated: true,
  },
];

const meta: Meta<typeof AISystemsTable> = {
  title: 'Data Display/AI Systems Table',
  component: AISystemsTable,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Table component specifically designed for displaying and managing AI systems with their properties, status, and actions.',
      },
    },
  },
  // Direct story without docs
  argTypes: {
    loading: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    data: mockAISystems,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    data: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    data: [],
    loading: false,
  },
};

export const SingleItem: Story = {
  args: {
    data: [mockAISystems[0]],
    loading: false,
  },
};

export const ManyItems: Story = {
  args: {
    data: Array.from({ length: 50 }, (_, i) => ({
      ...mockAISystems[i % mockAISystems.length],
      id: `item-${i + 1}`,
      name: `${mockAISystems[i % mockAISystems.length].name} ${i + 1}`,
    })),
    loading: false,
  },
};

export const AllActive: Story = {
  args: {
    data: mockAISystems.map(system => ({
      ...system,
      status: 'active' as const,
    })),
    loading: false,
  },
};

export const AllInactive: Story = {
  args: {
    data: mockAISystems.map(system => ({
      ...system,
      status: 'inactive' as const,
    })),
    loading: false,
  },
};

export const WithGuardrails: Story = {
  args: {
    data: mockAISystems.map(system => ({
      ...system,
      hasGuardrails: true,
      isEvaluated: true,
    })),
    loading: false,
  },
};

export const WithoutGuardrails: Story = {
  args: {
    data: mockAISystems.map(system => ({
      ...system,
      hasGuardrails: false,
      isEvaluated: false,
    })),
    loading: false,
  },
};
