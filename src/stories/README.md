# Storybook Stories Organization

This directory contains all Storybook stories organized following a hierarchical design system pattern inspired by Canvas Kit, providing clear information architecture and scalability.

## 📁 Folder Structure

```
src/stories/
├── category/                    # Brand identity components
├── data-display/               # Tables, cards, badges, statistics
│   ├── Table.stories.tsx
│   ├── Badge.stories.tsx
│   ├── AI Systems Table.stories.tsx
│   └── ... (13 total components)
├── feedback/                   # Alerts, banners, progress indicators
│   ├── Alert.stories.tsx
│   ├── Banner.stories.tsx
│   └── Progress.stories.tsx
├── inputs/                     # Form controls, buttons, text inputs
│   ├── Button.stories.tsx
│   ├── Input.stories.tsx
│   └── cell-types/            # Table cell input types
│       ├── Free Text Cell.stories.tsx
│       ├── Dropdown Cell.stories.tsx
│       └── ... (7 total cell types)
├── layout/                     # Containers, separators, tabs
│   ├── Separator.stories.tsx
│   ├── Tabs.stories.tsx
│   └── Sidebar Pattern.stories.tsx
├── navigation/                 # Menus, breadcrumbs, navigation bars
│   ├── App Bar.stories.tsx
│   ├── Breadcrumb.stories.tsx
│   └── Theme Toggle.stories.tsx
├── overlays/                   # Dialogs, sheets, popovers
│   ├── Dialog.stories.tsx
│   ├── Create Dialog.stories.tsx
│   ├── Upload Sheet.stories.tsx
│   └── ... (5 total components)
├── patterns/                   # Complex pattern compositions
│   ├── table-patterns/        # Table-related patterns
│   │   ├── Table Pattern.stories.tsx
│   │   └── Table Actions.stories.tsx
│   └── data-upload/           # Data upload patterns
│       ├── CSV Upload.stories.tsx
│       ├── CSV Preview.stories.tsx
│       └── Example Guardrails.stories.tsx
├── docs/                       # Documentation stories
│   └── Configure.mdx
└── assets/                     # Shared story assets
```

## 🎯 Categories

### Category
Brand identity and core visual elements.
- **Count**: 0 (available for branding components)

### Data Display (`stories/data-display/`)
Components for displaying data, tables, statistics, and information.
- **Count**: 13 components
- **Examples**: Table, Badge, Card, AI Systems Table, Skeleton, Tooltip
- **Use Cases**: Showing structured data, statistics, and visual information

### Feedback (`stories/feedback/`)
Components for providing feedback to users.
- **Count**: 3 components
- **Examples**: Alert, Banner, Progress
- **Use Cases**: Error messages, success notifications, loading states

### Inputs (`stories/inputs/`)
Interactive components for user input and data entry.
- **Count**: 15 components (8 form controls + 7 cell types)
- **Examples**: Button, Input, Checkbox, Select, Switch
- **Use Cases**: Forms, user interactions, data entry
- **Cell Types**: Specialized input components for table cells

### Layout (`stories/layout/`)
Components for page structure and organization.
- **Count**: 3 components
- **Examples**: Separator, Tabs, Sidebar Pattern
- **Use Cases**: Page structure, content organization, spacing

### Navigation (`stories/navigation/`)
Components for navigation and wayfinding.
- **Count**: 3 components
- **Examples**: App Bar, Breadcrumb, Theme Toggle
- **Use Cases**: Site navigation, page hierarchy, user settings

### Overlays (`stories/overlays/`)
Components that appear above page content.
- **Count**: 5 components
- **Examples**: Dialog, Create Dialog, Upload Sheet, View Edit Sheet
- **Use Cases**: Modal interactions, side panels, temporary content

### Patterns (`stories/patterns/`)
Complex pattern compositions combining multiple components.
- **Table Patterns**: Complete table implementations with actions
- **Data Upload**: File upload and CSV handling patterns
- **Use Cases**: Feature-complete implementations, complex workflows

## 🚀 Getting Started

1. **Add New Story**: Place in appropriate category folder
2. **Import Components**: Use relative paths from stories folder
3. **Story Titles**: Use category prefix (Data Display/, Inputs/, etc.)
4. **Test Stories**: Run `npm run storybook`

## 📝 Story Structure

Each story file follows this pattern:
```typescript
import { Component } from '../../components/ui/component';

const meta: Meta<typeof Component> = {
  title: 'Data Display/Component Name', // Category/ComponentName
  component: Component,
  parameters: {
    layout: 'centered', // or 'fullscreen', 'padded'
  },
};
```

### Title Naming Convention
- Use Title Case for all parts: "Data Display/Component Name"
- Separate words in category names: "Data Display" not "DataDisplay"
- Separate words in component names: "AI System Icon" not "AISystemIcon"
- Use forward slashes for hierarchy: "Patterns/Table Patterns/Table Actions"

## 🔧 Maintenance

- Keep stories organized by category
- Use consistent naming conventions (Title Case)
- Import components using proper relative paths
- Update this README when adding new categories
- Follow the hierarchical structure for sub-categories

## 📚 Design System Philosophy

This organization follows industry-standard design system patterns:
- **Atomic Design Principles**: From basic components to complex patterns
- **Clear Information Architecture**: Easy to navigate and discover
- **Scalability**: Room to grow with your design system
- **Developer Experience**: Intuitive categorization matching mental models

Inspired by [Canvas Kit](https://workday.github.io/canvas-kit/?path=/docs/welcome--docs) and other leading design systems.

## 📖 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
- [Canvas Kit Design System](https://workday.github.io/canvas-kit/)
