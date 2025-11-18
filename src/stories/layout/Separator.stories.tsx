import type { Meta, StoryObj } from '@storybook/react';
import { Separator } from '../../components/ui/separator';

const meta: Meta<typeof Separator> = {
  title: 'Layout/Separator',
  component: Separator,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
  argTypes: {
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
    },
    decorative: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => (
    <div className="flex h-5 items-center space-x-4">
      <div>Left</div>
      <Separator {...args} />
      <div>Right</div>
    </div>
  ),
};

export const InList: Story = {
  render: () => (
    <div className="w-80">
      <div className="space-y-1">
        <div className="text-[0.8125rem]  font-medium">Account</div>
        <div className="text-[0.8125rem]  text-muted-foreground">Manage your account settings</div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <div className="text-[0.8125rem]  font-medium">Privacy</div>
        <div className="text-[0.8125rem]  text-muted-foreground">Manage your privacy settings</div>
      </div>
      <Separator className="my-4" />
      <div className="space-y-1">
        <div className="text-[0.8125rem]  font-medium">Notifications</div>
        <div className="text-[0.8125rem]  text-muted-foreground">Manage your notification preferences</div>
      </div>
    </div>
  ),
};

export const InNavigation: Story = {
  render: () => (
    <div className="flex h-5 items-center space-x-4 w-80">
      <div className="text-[0.8125rem]  font-medium">Home</div>
      <Separator orientation="vertical" />
      <div className="text-[0.8125rem]  font-medium">Products</div>
      <Separator orientation="vertical" />
      <div className="text-[0.8125rem]  font-medium">About</div>
      <Separator orientation="vertical" />
      <div className="text-[0.8125rem]  font-medium">Contact</div>
    </div>
  ),
};

export const InCard: Story = {
  render: () => (
    <div className="w-80 rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-6">
        <h3 className="text-2xl font-450 leading-none tracking-tight">Card Title</h3>
        <p className="text-[0.8125rem]  text-muted-foreground mt-2">Card description goes here.</p>
      </div>
      <Separator />
      <div className="p-6">
        <p className="text-[0.8125rem] ">Card content goes here.</p>
      </div>
      <Separator />
      <div className="flex items-center p-6">
        <button className="text-[0.8125rem]  font-medium">Action</button>
      </div>
    </div>
  ),
};

export const InForm: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="space-y-2">
        <label className="text-[0.8125rem]  font-medium">Personal Information</label>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="First name"
            className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="text"
            placeholder="Last name"
            className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
      
      <Separator />
      
      <div className="space-y-2">
        <label className="text-[0.8125rem]  font-medium">Contact Information</label>
        <div className="space-y-2">
          <input
            type="email"
            placeholder="Email"
            className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <input
            type="tel"
            placeholder="Phone"
            className="flex h-10 w-full rounded-md border border-input bg-gray-0 px-3 py-2 text-[0.8125rem]  ring-offset-background file:border-0 file:bg-transparent file:text-[0.8125rem]  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <div className="w-80 space-y-4">
      <div className="text-[0.8125rem] ">Default separator</div>
      <Separator />
      
      <div className="text-[0.8125rem] ">Thick separator</div>
      <Separator className="h-2" />
      
      <div className="text-[0.8125rem] ">Colored separator</div>
      <Separator className="bg-blue-500" />
      
      <div className="text-[0.8125rem] ">Dashed separator</div>
      <Separator className="border-dashed" />
    </div>
  ),
};
