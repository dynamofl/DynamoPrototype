# Automatic Story Generation Scripts

This directory contains scripts for automatically generating Storybook stories for UI pattern components.

## Scripts

### `generate-story.js`
Main script for generating Storybook stories for UI pattern components.

**Usage:**
```bash
# Generate story for specific component
node scripts/generate-story.js FileItem

# Generate stories for all UI components
node scripts/generate-story.js --all

# Watch for new components and auto-generate stories
node scripts/generate-story.js --watch
```

**NPM Scripts:**
```bash
npm run generate-story <component-name>
npm run generate-all-stories
npm run watch-stories
```

### `story-templates.js`
Contains story templates for different types of components:

- **default** - Basic component template
- **icon** - Icon component template with size variants
- **dialog** - Dialog/Sheet component template with wrapper
- **table** - Table component template with sample data
- **navigation** - Navigation component template with fullscreen layout

The script automatically detects component type based on filename and applies the appropriate template.

## How It Works

1. **Component Detection**: Scans `src/components/patterns/ui-patterns/` for `.tsx` files
2. **Type Detection**: Analyzes filename to determine component type (icon, dialog, table, etc.)
3. **Template Selection**: Chooses appropriate story template based on component type
4. **Story Generation**: Creates story file in `src/stories/patterns/` with proper imports and structure
5. **Conflict Prevention**: Skips generation if story already exists

## File Structure

```
scripts/
├── generate-story.js      # Main generation script
├── story-templates.js     # Story templates for different component types
└── README.md             # This documentation

src/
├── components/patterns/
│   └── ui-patterns/      # UI components (auto-story generation)
└── stories/patterns/     # Generated story files
```

## Adding New UI Components

1. **Add Component**: Create new `.tsx` file in `src/components/patterns/ui-patterns/`
2. **Auto-Generate Story**: Run `npm run generate-story <ComponentName>`
3. **Customize Story**: Edit the generated story file to add specific props and variants

## Component Type Detection

The script automatically detects component types based on filename patterns:

- `*icon*` → Icon template
- `*dialog*` or `*sheet*` → Dialog template  
- `*table*` → Table template
- `*bar*`, `*breadcrumb*`, `*nav*` → Navigation template
- Everything else → Default template

## Generated Story Features

- ✅ Proper TypeScript types
- ✅ Auto-docs integration
- ✅ Appropriate layout settings
- ✅ Component-specific argTypes
- ✅ Multiple story variants
- ✅ Sample data for complex components
- ✅ Interactive controls where applicable

