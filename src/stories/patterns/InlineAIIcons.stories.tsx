import type { Meta, StoryObj } from '@storybook/react';
import { 
  OpenAIInlineIcon, 
  RemoteInlineIcon, 
  LocalInlineIcon, 
  AnthropicInlineIcon 
} from '../../components/patterns/ui-patterns/inline-ai-icons';

const meta: Meta<typeof OpenAIInlineIcon> = {
  title: 'Patterns/InlineAIIcons',
  component: OpenAIInlineIcon,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const OpenAI: Story = {
  render: () => <OpenAIInlineIcon />,
};

export const Remote: Story = {
  render: () => <RemoteInlineIcon />,
};

export const Local: Story = {
  render: () => <LocalInlineIcon />,
};

export const Anthropic: Story = {
  render: () => <AnthropicInlineIcon />,
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col items-center space-y-2">
        <OpenAIInlineIcon />
        <span className="text-xs text-muted-foreground">OpenAI</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <RemoteInlineIcon />
        <span className="text-xs text-muted-foreground">Remote</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LocalInlineIcon />
        <span className="text-xs text-muted-foreground">Local</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <AnthropicInlineIcon />
        <span className="text-xs text-muted-foreground">Anthropic</span>
      </div>
    </div>
  ),
};

export const WithColors: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <div className="flex flex-col items-center space-y-2">
        <OpenAIInlineIcon className="text-green-600" />
        <span className="text-xs text-muted-foreground">OpenAI</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <RemoteInlineIcon className="text-blue-600" />
        <span className="text-xs text-muted-foreground">Remote</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <LocalInlineIcon className="text-purple-600" />
        <span className="text-xs text-muted-foreground">Local</span>
      </div>
      <div className="flex flex-col items-center space-y-2">
        <AnthropicInlineIcon className="text-orange-600" />
        <span className="text-xs text-muted-foreground">Anthropic</span>
      </div>
    </div>
  ),
};

export const DifferentSizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <span className="text-sm w-16">Small:</span>
        <OpenAIInlineIcon className="w-4 h-4" />
        <RemoteInlineIcon className="w-4 h-4" />
        <LocalInlineIcon className="w-4 h-4" />
        <AnthropicInlineIcon className="w-4 h-4" />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm w-16">Default:</span>
        <OpenAIInlineIcon />
        <RemoteInlineIcon />
        <LocalInlineIcon />
        <AnthropicInlineIcon />
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-sm w-16">Large:</span>
        <OpenAIInlineIcon className="w-8 h-8" />
        <RemoteInlineIcon className="w-8 h-8" />
        <LocalInlineIcon className="w-8 h-8" />
        <AnthropicInlineIcon className="w-8 h-8" />
      </div>
    </div>
  ),
};

export const InButtons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
        <OpenAIInlineIcon />
        <span className="text-sm">OpenAI</span>
      </button>
      
      <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
        <RemoteInlineIcon />
        <span className="text-sm">Remote</span>
      </button>
      
      <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
        <LocalInlineIcon />
        <span className="text-sm">Local</span>
      </button>
      
      <button className="flex items-center space-x-2 px-3 py-2 border rounded-md hover:bg-gray-50">
        <AnthropicInlineIcon />
        <span className="text-sm">Anthropic</span>
      </button>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="space-y-2 w-64">
      <div className="flex items-center space-x-3 p-2 border rounded-md">
        <OpenAIInlineIcon className="text-green-600" />
        <div>
          <p className="text-sm font-medium">GPT-4 System</p>
          <p className="text-xs text-muted-foreground">OpenAI Provider</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-2 border rounded-md">
        <RemoteInlineIcon className="text-blue-600" />
        <div>
          <p className="text-sm font-medium">Remote API</p>
          <p className="text-xs text-muted-foreground">External Service</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-2 border rounded-md">
        <LocalInlineIcon className="text-purple-600" />
        <div>
          <p className="text-sm font-medium">Local Model</p>
          <p className="text-xs text-muted-foreground">On-premise</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3 p-2 border rounded-md">
        <AnthropicInlineIcon className="text-orange-600" />
        <div>
          <p className="text-sm font-medium">Claude System</p>
          <p className="text-xs text-muted-foreground">Anthropic Provider</p>
        </div>
      </div>
    </div>
  ),
};
