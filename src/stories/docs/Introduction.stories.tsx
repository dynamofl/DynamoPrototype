import type { Meta, StoryObj } from '@storybook/react';

const IntroductionComponent = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '1rem', color: '#1F2937' }}>
        Dynamo Design System
      </h1>

      <p style={{ fontSize: '1.125rem', color: '#6B7280', marginBottom: '2rem' }}>
        Welcome to the Dynamo Design System - a comprehensive collection of reusable components and patterns built with React, TypeScript, and Tailwind CSS.
      </p>

      <h2 style={{ fontSize: '1.875rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#1F2937' }}>
        Design Philosophy
      </h2>

      <p style={{ fontSize: '1rem', lineHeight: '1.75', color: '#4B5563', marginBottom: '1rem' }}>
        Our design system follows industry-standard patterns inspired by leading design systems like{' '}
        <a href="https://workday.github.io/canvas-kit/" target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'underline' }}>
          Canvas Kit
        </a>, emphasizing:
      </p>

      <ul style={{ listStyle: 'disc', paddingLeft: '2rem', marginBottom: '2rem', color: '#4B5563' }}>
        <li style={{ marginBottom: '0.5rem' }}><strong>Clarity:</strong> Clean, professional light theme with excellent contrast and readability</li>
        <li style={{ marginBottom: '0.5rem' }}><strong>Consistency:</strong> Unified visual language across all components</li>
        <li style={{ marginBottom: '0.5rem' }}><strong>Accessibility:</strong> WCAG 2.1 AA compliant components with keyboard navigation</li>
        <li style={{ marginBottom: '0.5rem' }}><strong>Scalability:</strong> Hierarchical organization that grows with your needs</li>
      </ul>

      <h2 style={{ fontSize: '1.875rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#1F2937' }}>
        Component Categories
      </h2>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { title: 'Data Display', desc: 'Components for displaying data, tables, statistics, and information' },
          { title: 'Feedback', desc: 'Components for providing feedback through alerts, notifications, and progress indicators' },
          { title: 'Inputs', desc: 'Interactive components for user input and data entry, including specialized table cell types' },
          { title: 'Layout', desc: 'Components for page structure, organization, and spacing' },
          { title: 'Navigation', desc: 'Components for navigation, wayfinding, and user settings' },
          { title: 'Overlays', desc: 'Components that appear above page content for modal interactions' },
          { title: 'Patterns', desc: 'Complex pattern compositions combining multiple components for complete features' },
        ].map(category => (
          <div key={category.title} style={{ padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem', color: '#1F2937' }}>{category.title}</h3>
            <p style={{ fontSize: '0.875rem', color: '#6B7280', margin: 0 }}>{category.desc}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1.875rem', fontWeight: '600', marginTop: '2rem', marginBottom: '1rem', color: '#1F2937' }}>
        Getting Started
      </h2>

      <p style={{ fontSize: '1rem', lineHeight: '1.75', color: '#4B5563' }}>
        Browse the components in the sidebar to explore interactive demos with configurable props, usage guidelines, and accessibility information.
      </p>
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
