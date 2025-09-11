# Storybook Stories Organization

This directory contains all Storybook stories organized by category for better maintainability and navigation.

## 📁 Folder Structure

```
src/stories/
├── ui/           # Basic UI component stories
│   ├── Alert.stories.tsx
│   ├── Button.stories.tsx
│   ├── Card.stories.tsx
│   └── ... (18 total UI components)
├── patterns/     # Complex pattern component stories
│   ├── AppBar.stories.tsx
│   ├── TablePattern.stories.tsx
│   ├── ThemeToggle.stories.tsx
│   └── ... (21 total pattern components)
├── features/     # Feature-specific component stories
├── docs/         # Documentation stories
│   └── Configure.mdx
├── assets/       # Shared story assets (images, icons)
└── index.ts      # Main stories index
```

## 🎯 Categories

### UI Components (`stories/ui/`)
Basic, reusable UI components like buttons, inputs, cards, etc.
- **Count**: 18 components
- **Examples**: Button, Card, Input, Dialog, Table, etc.

### Pattern Components (`stories/patterns/`)
Complex, composite components that implement specific patterns or layouts.
- **Count**: 21 components
- **Examples**: AppBar, TablePattern, CreateDialog, FileItem, etc.

### Feature Components (`stories/features/`)
Components specific to particular features or pages.
- **Count**: 0 (available for future use)

### Documentation (`stories/docs/`)
Documentation stories and guides.
- **Examples**: Setup guides, component usage docs

## 🚀 Getting Started

1. **Add New Story**: Place in appropriate category folder
2. **Import Components**: Use relative paths from stories folder
3. **Story Titles**: Use category prefix (UI/, Patterns/, etc.)
4. **Test Stories**: Run `npm run storybook`

## 📝 Story Structure

Each story file follows this pattern:
```typescript
import { Component } from '../../components/ui/component';

const meta: Meta<typeof Component> = {
  title: 'UI/ComponentName', // Category/ComponentName
  component: Component,
  // ... story configuration
};
```

## 🔧 Maintenance

- Keep component folders clean (stories moved here)
- Update index files when adding new stories
- Use consistent naming conventions
- Import components using proper relative paths

## 📚 Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Component Story Format](https://storybook.js.org/docs/api/csf)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)
