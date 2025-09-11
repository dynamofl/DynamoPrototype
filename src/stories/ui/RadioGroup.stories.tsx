import type { Meta, StoryObj } from '@storybook/react';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';

const meta: Meta<typeof RadioGroup> = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  parameters: {
    layout: 'centered',
  },
  // Direct story without docs
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option1">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="option1" />
        <label htmlFor="option1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="option2" />
        <label htmlFor="option2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 2
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="option3" />
        <label htmlFor="option3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const WithDescriptions: Story = {
  render: () => (
    <RadioGroup defaultValue="comfortable" className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="default" id="r1" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Default
          </label>
          <p className="text-xs text-muted-foreground">
            The default option for most users.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="comfortable" id="r2" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Comfortable
          </label>
          <p className="text-xs text-muted-foreground">
            More spacing for a comfortable reading experience.
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="compact" id="r3" />
        <div className="grid gap-1.5 leading-none">
          <label htmlFor="r3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Compact
          </label>
          <p className="text-xs text-muted-foreground">
            Less spacing for a more compact layout.
          </p>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option1" className="space-y-3">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option1" id="d1" />
        <label htmlFor="d1" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 1
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option2" id="d2" disabled />
        <label htmlFor="d2" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 2 (disabled)
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option3" id="d3" />
        <label htmlFor="d3" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          Option 3
        </label>
      </div>
    </RadioGroup>
  ),
};

export const PaymentMethod: Story = {
  render: () => (
    <RadioGroup defaultValue="card" className="space-y-4">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="card" id="card" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">💳</span>
          </div>
          <div>
            <label htmlFor="card" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Credit Card
            </label>
            <p className="text-xs text-muted-foreground">Pay with your credit card</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="paypal" id="paypal" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-yellow-500 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          <div>
            <label htmlFor="paypal" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              PayPal
            </label>
            <p className="text-xs text-muted-foreground">Pay with your PayPal account</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="apple" id="apple" />
        <div className="flex items-center space-x-2">
          <div className="w-8 h-5 bg-black rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">🍎</span>
          </div>
          <div>
            <label htmlFor="apple" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Apple Pay
            </label>
            <p className="text-xs text-muted-foreground">Pay with Apple Pay</p>
          </div>
        </div>
      </div>
    </RadioGroup>
  ),
};

export const SettingsExample: Story = {
  render: () => (
    <div className="space-y-6 w-80">
      <div>
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <RadioGroup defaultValue="system" className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="light" id="light" />
            <label htmlFor="light" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Light
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dark" id="dark" />
            <label htmlFor="dark" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Dark
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="system" id="system" />
            <label htmlFor="system" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              System
            </label>
          </div>
        </RadioGroup>
      </div>
      
      <div>
        <h3 className="text-lg font-medium mb-4">Language</h3>
        <RadioGroup defaultValue="en" className="space-y-3">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="en" id="en" />
            <label htmlFor="en" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              English
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="es" id="es" />
            <label htmlFor="es" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Español
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="fr" id="fr" />
            <label htmlFor="fr" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Français
            </label>
          </div>
        </RadioGroup>
      </div>
    </div>
  ),
};
