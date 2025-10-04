import type { Meta, StoryObj } from '@storybook/react';
import { Progress } from '../../components/ui/progress';

const meta: Meta<typeof Progress> = {
  title: 'UI/Progress',
  component: Progress,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 33,
  },
};

export const Empty: Story = {
  args: {
    value: 0,
  },
};

export const Half: Story = {
  args: {
    value: 50,
  },
};

export const AlmostComplete: Story = {
  args: {
    value: 90,
  },
};

export const Complete: Story = {
  args: {
    value: 100,
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2 w-80">
      <div className="flex justify-between text-[0.8125rem] ">
        <span>Progress</span>
        <span>33%</span>
      </div>
      <Progress value={33} />
    </div>
  ),
};

export const LoadingExample: Story = {
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Uploading files...</span>
          <span>45%</span>
        </div>
        <Progress value={45} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Processing data...</span>
          <span>78%</span>
        </div>
        <Progress value={78} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Finalizing...</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const DifferentValues: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Starting</span>
          <span>0%</span>
        </div>
        <Progress value={0} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>In Progress</span>
          <span>25%</span>
        </div>
        <Progress value={25} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Halfway</span>
          <span>50%</span>
        </div>
        <Progress value={50} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Almost Done</span>
          <span>75%</span>
        </div>
        <Progress value={75} />
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-[0.8125rem] ">
          <span>Complete</span>
          <span>100%</span>
        </div>
        <Progress value={100} />
      </div>
    </div>
  ),
};

export const TaskProgress: Story = {
  render: () => (
    <div className="space-y-4 w-96">
      <h3 className="text-lg font-medium">Project Progress</h3>
      
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem] ">
            <span>Design Phase</span>
            <span>100%</span>
          </div>
          <Progress value={100} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem] ">
            <span>Development</span>
            <span>65%</span>
          </div>
          <Progress value={65} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem] ">
            <span>Testing</span>
            <span>30%</span>
          </div>
          <Progress value={30} />
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between text-[0.8125rem] ">
            <span>Deployment</span>
            <span>0%</span>
          </div>
          <Progress value={0} />
        </div>
      </div>
    </div>
  ),
};
