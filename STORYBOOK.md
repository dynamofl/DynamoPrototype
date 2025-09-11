# Storybook Integration Guide

## Overview

Storybook has been successfully integrated into your DynamoPrototype project. It provides a powerful workshop environment for building, testing, and documenting UI components in isolation.

## Getting Started

### Running Storybook

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006`

### Building Storybook

```bash
npm run build-storybook
```

This creates a static build of Storybook that can be deployed.

## Current Stories

### UI Components

1. **Button** (`src/components/ui/Button.stories.tsx`)
   - All button variants: default, secondary, destructive, outline, ghost, link, subtle, new
   - All sizes: default, sm, lg, icon
   - Disabled state
   - With icon example

2. **Card** (`src/components/ui/Card.stories.tsx`)
   - Default card with header, content, and footer
   - Simple card with just title and content
   - Card with description
   - Card with action buttons
   - Content-only card

### Pattern Components

1. **AISystemIcon** (`src/components/patterns/AISystemIcon.stories.tsx`)
   - All AI system icons: OpenAI, Azure, Mistral, Databricks, HuggingFace, Anthropic, Remote, Local, AWS, DynamoAI
   - All icons showcase

## Configuration

### Direct Stories Setup

This Storybook is configured for **direct stories** without auto-generated documentation pages. Each component story focuses on the component itself with interactive controls.

### Main Configuration (`.storybook/main.ts`)

- **Framework**: React with Vite
- **Stories**: Organized in `src/stories/` with subfolders:
  - `src/stories/ui/` - UI component stories
  - `src/stories/patterns/` - Pattern component stories
  - `src/stories/features/` - Feature-specific component stories
  - `src/stories/docs/` - Documentation stories
- **Addons**:
  - `@chromatic-com/storybook` - Visual testing
  - `@storybook/addon-onboarding` - Getting started guide
  - `@storybook/addon-a11y` - Accessibility testing
  - `@storybook/addon-themes` - Official theme switcher
- **Built-in Panels** (Storybook 9):
  - **Controls** - Interactive property controls (built-in)
  - **Actions** - Event logging and tracking (built-in)
  - **Viewport** - Responsive testing (built-in)
  - **Backgrounds** - Theme testing (built-in)
  - **Themes** - Official theme switcher (addon)
- **Path Aliases**: Configured to support `@/` imports

### Preview Configuration (`.storybook/preview.ts`)

- **Layout**: Centered layout for focused component viewing
- **Styling**: Consistent background and container styling for all stories
- **Controls**: Compact layout with collapsible sections:
  - **Collapsed by Default**: Controls panel starts collapsed for cleaner view
  - **Tooltip Descriptions**: Hover over control names to see descriptions
  - **Sorted by Priority**: Required controls shown first
- **Actions**: Configured to track all event handlers (`onClick`, `onChange`, etc.)
- **Global Theme Switcher**: Three theme options in the toolbar:
  - **Light**: Force light theme
  - **Dark**: Force dark theme
  - **System**: Follows system preference (default)
- **Theme Integration**: Uses the same ThemeProvider as the actual application

## Creating New Stories

### Basic Story Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { YourComponent } from './your-component';

const meta: Meta<typeof YourComponent> = {
  title: 'Category/ComponentName',
  component: YourComponent,
  parameters: {
    layout: 'centered', // Focused view for individual components
  },
  args: {
    onClick: fn(), // Track actions in the Actions panel
  },
  // Direct story without docs
  argTypes: {
    // Define controls for props with descriptions
    variant: {
      control: { type: 'select' },
      options: ['option1', 'option2'],
      description: 'Choose the component variant', // Shows as tooltip
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Default props
  },
};

export const CustomVariant: Story = {
  args: {
    variant: 'custom',
    // Other props
  },
};
```

### Story Categories & Organization

Stories are now organized in dedicated folders under `src/stories/`:

**📁 Folder Structure:**
```
src/stories/
├── ui/           # Basic UI components (Button, Card, Input, etc.)
├── patterns/     # Complex pattern components (AppBar, Table, etc.)
├── features/     # Feature-specific components
├── docs/         # Documentation stories
└── assets/       # Shared story assets
```

**📋 Story Categories:**
- `UI/ComponentName` - Basic UI components in `stories/ui/`
- `Patterns/ComponentName` - Complex pattern components in `stories/patterns/`
- `Features/ComponentName` - Feature-specific components in `stories/features/`
- `Docs/DocumentName` - Documentation stories in `stories/docs/`

### Advanced Story Examples

#### Interactive Stories
```typescript
export const Interactive: Story = {
  args: {
    onClick: action('clicked'),
  },
};
```

#### Custom Render Functions
```typescript
export const CustomRender: Story = {
  render: (args) => (
    <div className="custom-wrapper">
      <YourComponent {...args} />
    </div>
  ),
};
```

#### Multiple Variants
```typescript
export const AllVariants: Story = {
  render: () => (
    <div className="flex gap-4">
      <YourComponent variant="primary" />
      <YourComponent variant="secondary" />
      <YourComponent variant="tertiary" />
    </div>
  ),
};
```

## Best Practices

### 1. Story Naming
- Use descriptive names: `Default`, `WithIcon`, `Disabled`, `Loading`
- Avoid generic names like `Test` or `Example`

### 2. Direct Stories Focus
- Stories are designed for direct interaction and testing
- Use the Controls panel to modify component properties in real-time
- Use the Actions panel to see event callbacks
- Focus on component behavior rather than documentation

### 3. Controls
- Define `argTypes` for interactive controls with descriptions
- Use appropriate control types: `select`, `boolean`, `text`, `number`, `color`
- Add `description` property for tooltip help text
- Controls panel starts collapsed for cleaner interface

### 4. Layout
- Use `layout: 'centered'` for small components
- Use `layout: 'padded'` for larger components
- Use `layout: 'fullscreen'` for full-page components

### 5. Accessibility
- The `@storybook/addon-a11y` addon is included for accessibility testing
- Test your components with different accessibility tools

## Sidebar Panels (Direct Stories Layout)

1. **Stories** - Navigate between different component variations and states
2. **Controls** - Interactive controls for component props (real-time editing)
3. **Actions** - Log and track user interactions and event callbacks
4. **Accessibility** - A11y testing and compliance checking
5. **Viewport** - Test components at different screen sizes
6. **Backgrounds** - Test with different background themes

### Panel Usage

- **Stories Panel**: Switch between component variants (Default, Hover, Loading, etc.)
- **Controls Panel**: Compact controls with tooltip descriptions:
  - **Collapsed by Default**: Click to expand and see all controls
  - **Tooltip Help**: Hover over control names for descriptions
  - **Real-time Editing**: Modify props instantly to see changes
  - **Input Fields**: Use text inputs for column properties instead of JSON
  - **Table Customization**: Dynamic column titles, widths, and placeholders
- **Actions Panel**: See logged events when interacting with components
- **Viewport Panel**: Test responsive behavior across device sizes
- **Theme Switcher**: Global theme toggle in the toolbar (Light/Dark/System)

## Advanced Features

### Table Pattern Customization

The Table Pattern story now includes **input fields** for column properties instead of JSON:

- **Column Titles**: Text inputs to change column headers
- **Column Widths**: Text inputs for width values (e.g., "200px")
- **Placeholders**: Customize input placeholder text
- **Data Length**: Number control for row count
- **Real-time Updates**: Changes apply instantly to the table

**Try it**: Go to `Patterns/TablePattern/ColumnCustomization` and use the Controls panel to modify column properties in real-time!

## Next Steps

1. **Add More Stories**: Create stories for your existing components
2. **Visual Testing**: Set up Chromatic for visual regression testing
3. **Interaction Testing**: Add interaction tests for complex components
4. **Documentation**: Enhance component documentation with MDX files
5. **Design Tokens**: Integrate design tokens for consistent theming

## Troubleshooting

### Common Issues

1. **Import Errors**: Ensure path aliases are configured correctly
2. **Styling Issues**: Make sure CSS is imported in preview.ts
3. **Type Errors**: Use proper TypeScript types for stories

### Getting Help

- [Storybook Documentation](https://storybook.js.org/docs)
- [Storybook Discord](https://discord.gg/storybook)
- [Storybook GitHub](https://github.com/storybookjs/storybook)

## Example: Adding a New Component Story

To add a story for a new component:

1. Create `ComponentName.stories.tsx` in the same directory as your component
2. Follow the basic structure above
3. Add appropriate controls and variants
4. Test in Storybook
5. Add to this documentation

Happy storytelling! 🎨
