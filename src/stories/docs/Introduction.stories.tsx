import type { Meta, StoryObj } from '@storybook/react';

const IntroductionComponent = () => {
  return (
    <div className="w-full min-h-screen p-8">
      <div className="max-w-5xl my-12 mx-20">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold font-700 mb-4 text-gray-900">
            Flux Design System
          </h1>
          <span className='pb-1'>V0.5 (Alpha)</span>
        </div>

        <p className="text-sm text-gray-600 mb-8">
          Welcome to the Flux Design System by Dynamo AI - a comprehensive collection of reusable components and patterns built with React, TypeScript, ShadCn and Tailwind CSS.
        </p>

        <h2 className="text-lg font-semibold font-700 mt-8 mb-4 text-gray-900">
          Component Categories
        </h2>

        <div className="grid gap-4 mb-8">
          {[
            { title: 'Data Display', desc: 'Components for displaying data, tables, statistics, and information' },
            { title: 'Feedback', desc: 'Components for providing feedback through alerts, notifications, and progress indicators' },
            { title: 'Inputs', desc: 'Interactive components for user input and data entry, including specialized table cell types' },
            { title: 'Layout', desc: 'Components for page structure, organization, and spacing' },
            { title: 'Navigation', desc: 'Components for navigation, wayfinding, and user settings' },
            { title: 'Overlays', desc: 'Components that appear above page content for modal interactions' },
            { title: 'Patterns', desc: 'Complex pattern compositions combining multiple components for complete features' },
          ].map(category => (
            <div key={category.title} className="py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-base font-medium font-700 mb-1 text-gray-900">{category.title}</h3>
              <p className="text-sm text-gray-600">{category.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm leading-7 text-gray-600">
          Browse the components in the sidebar to explore interactive demos with configurable props, usage guidelines, and accessibility information.
        </p>
      </div>
    </div>
  );
};

const meta: Meta<typeof IntroductionComponent> = {
  title: 'Introduction',
  component: IntroductionComponent,
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Welcome: Story = {};
