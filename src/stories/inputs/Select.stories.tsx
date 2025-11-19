import type { Meta, StoryObj } from '@storybook/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from '../../components/ui/select';

const meta: Meta<typeof Select> = {
  title: 'Inputs/Select',
  component: Select,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Select dropdowns allow users to choose one option from a list. They're used in forms and filters where users need to pick from predefined options.`,
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
    // STATE
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the select is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
        category: 'State',
      },
    },
    defaultValue: {
      control: { type: 'text' },
      description: 'The default selected value (uncontrolled)',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },
    value: {
      control: { type: 'text' },
      description: 'The controlled value of the select',
      table: {
        type: { summary: 'string' },
        category: 'State',
      },
    },

    // EVENTS
    onValueChange: {
      action: 'value changed',
      description: 'Callback fired when the selected value changes',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Basic
 *
 * Basic select dropdown examples.
 *
 * The default select with a placeholder and options.
 */
export const Default: Story = {
  tags: ['!dev'],
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * Select with a default value pre-selected.
 */
export const WithDefaultValue: Story = {
  tags: ['!dev'],
  render: () => (
    <Select defaultValue="banana">
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ### Groups
 *
 * Organize options into logical groups with labels.
 *
 * Select with grouped options and separators for better organization.
 */
export const WithGroups: Story = {
  tags: ['!dev'],
  render: () => (
    <Select>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select a Framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Frontend</SelectLabel>
          <SelectItem value="react">React</SelectItem>
          <SelectItem value="vue">Vue</SelectItem>
          <SelectItem value="angular">Angular</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Backend</SelectLabel>
          <SelectItem value="node">Node.js</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="java">Java</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};

/**
 * ### States
 *
 * Different states a select can be in.
 *
 * Disabled select that cannot be interacted with.
 */
export const Disabled: Story = {
  tags: ['!dev'],
  render: () => (
    <Select disabled>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * Select with some individual items disabled.
 */
export const WithDisabledItems: Story = {
  tags: ['!dev'],
  render: () => (
    <Select>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select a Fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana" disabled>Banana (Disabled)</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes" disabled>Grapes (Disabled)</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectContent>
    </Select>
  ),
};

/**
 * ### Examples
 *
 * Common select patterns and use cases.
 *
 * Select fields used in a form with labels.
 */
export const FormExample: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Country</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Your Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="de">Germany</SelectItem>
            <SelectItem value="fr">France</SelectItem>
            <SelectItem value="jp">Japan</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Language</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Your Language" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Popular</SelectLabel>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Others</SelectLabel>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="it">Italian</SelectItem>
              <SelectItem value="pt">Portuguese</SelectItem>
              <SelectItem value="ru">Russian</SelectItem>
              <SelectItem value="zh">Chinese</SelectItem>
              <SelectItem value="ja">Japanese</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Select fields with grouped options in a form layout.',
      },
    },
  },
};

/**
 * Multiple select fields for product configuration.
 */
export const MultipleSelects: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4 w-80">
      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Size</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xs">Extra Small</SelectItem>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
            <SelectItem value="xl">Extra Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Color</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Color" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="red">Red</SelectItem>
            <SelectItem value="blue">Blue</SelectItem>
            <SelectItem value="green">Green</SelectItem>
            <SelectItem value="yellow">Yellow</SelectItem>
            <SelectItem value="purple">Purple</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-[0.8125rem] font-medium">Material</label>
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select Material" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cotton">Cotton</SelectItem>
            <SelectItem value="polyester">Polyester</SelectItem>
            <SelectItem value="wool">Wool</SelectItem>
            <SelectItem value="silk">Silk</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple related select fields for product customization.',
      },
    },
  },
};
