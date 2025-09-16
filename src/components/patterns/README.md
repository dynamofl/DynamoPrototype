# Pattern Components Classification

This document classifies all pattern components into UI-specific and non-UI categories to help with automatic Storybook integration.

## UI-Specific Patterns (Suitable for Storybook)

These components render visual elements and can be demonstrated in Storybook:

### Core UI Components
- **`file-item.tsx`** - File display component with different states (in-progress, invalid, validated)
- **`create-dialog.tsx`** - Modal dialog for creating items with customizable size and actions
- **`view-edit-sheet.tsx`** - Side sheet for viewing/editing content with header, content, and footer slots
- **`example-guardrails.tsx`** - Guardrails display component with examples and configurations
- **`table-pattern.tsx`** - Complex table component with sorting, filtering, and pagination
- **`table-actions.tsx`** - Table action buttons component
- **`row-edit-dialog.tsx`** - Row editing dialog for inline table editing
- **`stat-card-section.tsx`** - Grid layout component for displaying stat cards
- **`sidebar-pattern.tsx`** - Reusable sidebar component with variants

### Navigation & Layout Components
- **`ai-system-icon.tsx`** - Visual icon component for different AI system providers
- **`ai-systems-table.tsx`** - AI systems specific table component
- **`app-bar.tsx`** - Navigation header with logo, nav links, experiments toggle, and user menu
- **`breadcrumb.tsx`** - Navigation breadcrumb component with automatic path generation

### Data & File Components
- **`csv-preview.tsx`** - CSV data preview component with table display
- **`csv-upload.tsx`** - File upload component with drag-and-drop functionality
- **`upload-sheet.tsx`** - Upload interface component with file management

### Display Components
- **`header-stats.tsx`** - Statistics cards display component with tooltips
- **`theme-toggle.tsx`** - Theme switcher button component with dropdown

### Icon Components
- **`inline-ai-icons.tsx`** - Inline SVG icons for AI systems with theme adaptation

### Cell Types (UI Components)
- **`cell-types/`** - Various table cell components (avatar, badge, button, date, dropdown, etc.)

## Non-UI Patterns (Not suitable for Storybook)

These components handle logic, provide context, or perform routing without rendering visual elements:

### Logic & Navigation Components
- **`smart-redirect.tsx`** - Navigation redirect logic component (returns `<Navigate>`)
- **`experiments-guard.tsx`** - Route guard logic component (returns `null`)

### Context Providers
- **`theme-provider.tsx`** - Context provider for theme management with localStorage persistence

### Layout Utilities
- **`slot.tsx`** - Layout slot component for structural organization

## Usage for Storybook Integration

### Import UI Patterns Only
```typescript
// Import all UI patterns for Storybook
import * as UIPatterns from '@/components/patterns/ui-patterns'

// Or import specific UI patterns
import { FileItem, CreateDialog, TablePattern } from '@/components/patterns/ui-patterns'
```

### Import All Patterns (Including Non-UI)
```typescript
// Import all patterns (UI + Non-UI)
import * as AllPatterns from '@/components/patterns'

// Or import specific patterns
import { ThemeProvider, SmartRedirect } from '@/components/patterns'
```

## Classification Criteria

### UI-Specific (Storybook Suitable)
- ✅ Renders visual elements (JSX with UI components)
- ✅ Has interactive props and state
- ✅ Can be demonstrated with different variants/states
- ✅ Has visual styling and layout
- ✅ Can be isolated and tested independently

### Non-UI (Not Storybook Suitable)
- ❌ Returns `null` or navigation components
- ❌ Provides context without visual rendering
- ❌ Handles side effects or routing logic
- ❌ Acts as a utility or service component
- ❌ Cannot be meaningfully demonstrated in isolation

## File Organization

- **`ui-patterns.ts`** - Exports only UI components for Storybook
- **`index.ts`** - Exports all patterns with clear categorization
- **`README.md`** - This documentation file
