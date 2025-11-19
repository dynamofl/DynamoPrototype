# Component Story Template

This document provides a template and guidelines for creating component stories following the Dynamo Design System patterns, based on the Button component implementation.

## Overview

Our Storybook follows a docs-only pattern where:
- Only the component name appears in the sidebar (not individual stories)
- All variants are displayed on a single comprehensive Docs page
- Stories are organized into logical sections with H3 headings
- Table of Contents shows section headings for easy navigation

## File Structure Template

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { YourComponent } from '@/components/path/to/component';
import { Icon1, Icon2 } from 'lucide-react'; // If needed

const meta: Meta<typeof YourComponent> = {
  title: 'Category/Component Name',
  component: YourComponent,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
    docs: {
      description: {
        component: `Brief description of the component and its purpose.`,
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
    // Define argTypes here (see ArgTypes section below)
  },
  args: {
    // Default args that apply to all stories
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Stories go here (see Stories section below)
```

## Meta Configuration

### Title
Use a clear hierarchical path:
- `Inputs/Button`
- `Patterns/Data Upload/CSV Upload`
- `Feedback/Alert`

### Parameters

#### Layout Options
- `centered` - Component centered in viewport (default for most components)
- `fullscreen` - Full viewport (for page-level components)
- `padded` - Adds padding around component

#### Docs Configuration
```typescript
docs: {
  description: {
    component: `1-2 sentence description of what the component does and when to use it.`,
  },
  toc: {
    headingSelector: 'h3',     // Shows section headings in TOC
    title: '',                  // Empty to hide "Table of Contents" title
    disable: false,             // Enable TOC
  },
}
```

### Tags
Always include `['autodocs']` in meta to generate the Docs page.

## ArgTypes Configuration

Organize argTypes by category in this order:

1. **Content** - Main content props (children, label, etc.)
2. **Appearance** - Visual variants (variant, size, color, etc.)
3. **State** - Component states (disabled, loading, error, etc.)
4. **Events** - Callbacks and handlers (onClick, onChange, etc.)

### ArgTypes Template

```typescript
argTypes: {
  // CONTENT
  children: {
    control: { type: 'text' },
    description: 'The content to display',
    table: {
      type: { summary: 'ReactNode' },
      category: 'Content',
    },
  },

  // APPEARANCE
  variant: {
    control: { type: 'select' },
    options: ['default', 'primary', 'secondary'],
    description: 'The visual style variant',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'default' },
      category: 'Appearance',
    },
  },

  size: {
    control: { type: 'select' },
    options: ['sm', 'md', 'lg'],
    description: 'The size of the component',
    table: {
      type: { summary: 'string' },
      defaultValue: { summary: 'md' },
      category: 'Appearance',
    },
  },

  // STATE
  disabled: {
    control: { type: 'boolean' },
    description: 'Whether the component is disabled',
    table: {
      type: { summary: 'boolean' },
      defaultValue: { summary: 'false' },
      category: 'State',
    },
  },

  // Hide unwanted props
  asChild: {
    table: {
      disable: true,
    },
  },

  // EVENTS (always last)
  onClick: {
    action: 'clicked',
    description: 'Callback fired when clicked',
    table: {
      category: 'Events',
    },
  },
},
```

### Control Types Reference
- `text` - Text input
- `boolean` - Checkbox toggle
- `select` - Dropdown selection
- `radio` - Radio button group
- `number` - Number input
- `range` - Slider
- `color` - Color picker
- `date` - Date picker
- `object` - JSON object editor
- `array` - Array editor

## Story Organization

### Section Structure

Organize stories into 2-4 logical sections using H3 headings:

**Common Section Names:**
- **Variants** - Different visual styles
- **Sizes** - Size variations
- **States** - Different states (disabled, loading, error, etc.)
- **Examples** - Common patterns and use cases

### Story Template

#### Basic Story (Args-based)
```typescript
/**
 * ### Section Name (only in first story of section)
 *
 * Brief description of the section.
 *
 * Description of this specific story variant.
 */
export const StoryName: Story = {
  tags: ['!dev'],
  args: {
    variant: 'primary',
    children: 'Story Content',
  },
};
```

#### Story with Custom Render
```typescript
/**
 * Description of this story.
 */
export const ComplexExample: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="flex gap-2">
      <YourComponent variant="primary">Primary</YourComponent>
      <YourComponent variant="secondary">Secondary</YourComponent>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Optional additional context for this specific story.',
      },
    },
  },
};
```

### Story Naming Conventions

Use **PascalCase** for story export names:
- `Default` - The default/primary variant
- `Secondary`, `Destructive`, `Outline` - Variant names
- `Small`, `Large` - Size variations
- `Disabled`, `Loading` - State variations
- `WithIcon`, `WithIconBefore` - Pattern variations
- `AllVariants`, `AllSizes` - Comparison examples

### Tags Usage

**Required tag for all stories:**
- `tags: ['!dev']` - Hides story from sidebar but shows in Docs page

**DO NOT use:**
- `!autodocs` - Only use on meta, not individual stories

## Complete Example: Alert Component

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { Alert } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const meta: Meta<typeof Alert> = {
  title: 'Feedback/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `Alerts display brief messages about app processes in a banner.`,
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
    children: {
      control: { type: 'text' },
      description: 'The alert message content',
      table: {
        type: { summary: 'ReactNode' },
        category: 'Content',
      },
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'info', 'success', 'warning', 'error'],
      description: 'The visual style variant',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'default' },
        category: 'Appearance',
      },
    },
    onClose: {
      action: 'closed',
      description: 'Callback fired when alert is dismissed',
      table: {
        category: 'Events',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * ### Variants
 *
 * Different visual styles to convey the severity or type of message.
 *
 * The default alert for general information.
 */
export const Default: Story = {
  tags: ['!dev'],
  args: {
    children: 'This is a default alert message.',
  },
};

/**
 * Info alerts for informational messages.
 */
export const Info: Story = {
  tags: ['!dev'],
  args: {
    variant: 'info',
    children: 'This is an informational message.',
  },
};

/**
 * Success alerts for positive confirmations.
 */
export const Success: Story = {
  tags: ['!dev'],
  args: {
    variant: 'success',
    children: 'Operation completed successfully!',
  },
};

/**
 * Warning alerts to draw attention to important information.
 */
export const Warning: Story = {
  tags: ['!dev'],
  args: {
    variant: 'warning',
    children: 'Please review before proceeding.',
  },
};

/**
 * Error alerts for error messages and failures.
 */
export const Error: Story = {
  tags: ['!dev'],
  args: {
    variant: 'error',
    children: 'An error occurred. Please try again.',
  },
};

/**
 * ### Examples
 *
 * Common alert patterns and use cases.
 *
 * Alerts can include icons for better visual clarity.
 */
export const WithIcon: Story = {
  tags: ['!dev'],
  render: () => (
    <div className="space-y-4">
      <Alert variant="info">
        <Info className="h-4 w-4" />
        <span>Info with icon</span>
      </Alert>
      <Alert variant="success">
        <CheckCircle className="h-4 w-4" />
        <span>Success with icon</span>
      </Alert>
    </div>
  ),
};
```

## Migration Checklist

When converting an existing component story to this pattern:

- [ ] **Meta Configuration**
  - [ ] Add proper `title` with category hierarchy
  - [ ] Set appropriate `layout` parameter
  - [ ] Add component description
  - [ ] Configure TOC with `headingSelector: 'h3'`
  - [ ] Add `tags: ['autodocs']`

- [ ] **ArgTypes**
  - [ ] Organize by category (Content → Appearance → State → Events)
  - [ ] Add descriptions for all props
  - [ ] Set appropriate control types
  - [ ] Hide internal/advanced props with `table: { disable: true }`
  - [ ] Ensure Events category is last

- [ ] **Stories**
  - [ ] Add `tags: ['!dev']` to all stories
  - [ ] Organize into 2-4 logical sections
  - [ ] Add H3 section heading in first story of each section
  - [ ] Use descriptive JSDoc comments
  - [ ] Follow PascalCase naming convention
  - [ ] Include comparison stories (AllVariants, AllSizes, etc.)

- [ ] **Documentation**
  - [ ] Write clear, concise story descriptions
  - [ ] Include usage guidelines where helpful
  - [ ] Add `parameters.docs.description.story` for complex examples

## Best Practices

### ✅ Do
- Keep story descriptions concise (1-2 sentences)
- Group related variants together
- Show realistic use cases in examples
- Include edge cases (disabled, loading, error states)
- Use semantic story names that describe what they show
- Add comparison stories that show all variants side-by-side

### ❌ Don't
- Don't create separate documentation stories with empty renders
- Don't add manual H4 headings (Storybook auto-generates them)
- Don't include implementation details in descriptions
- Don't create stories for every possible prop combination
- Don't use `tags: ['!autodocs']` on individual stories
- Don't mix different patterns - stay consistent

## Additional Resources

- **Button Component**: See `src/stories/inputs/Button.stories.tsx` for a complete reference implementation
- **Storybook Docs**: https://storybook.js.org/docs/react/writing-docs/autodocs
- **Canvas Kit**: https://workday.github.io/canvas-kit (design inspiration)

---

*Last updated: 2025-01-18*
