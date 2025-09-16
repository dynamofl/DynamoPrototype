#!/usr/bin/env node

/**
 * Automatic Storybook Story Generator for UI Patterns
 * 
 * This script automatically generates Storybook stories for new UI pattern components
 * added to the src/components/patterns/ui-patterns/ folder.
 * 
 * Usage:
 *   node scripts/generate-story.js <component-name>
 *   node scripts/generate-story.js --all
 *   node scripts/generate-story.js --watch
 */

import fs from 'fs';
import path from 'path';
import { getStoryTemplate } from './story-templates.js';

const UI_PATTERNS_DIR = 'src/components/patterns/ui-patterns';
const STORIES_DIR = 'src/stories/patterns';

function toPascalCase(str) {
  return str.replace(/(^|-)([a-z])/g, (match, p1, p2) => p2.toUpperCase());
}

function toKebabCase(str) {
  return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

function generateStory(componentName) {
  const fileName = toKebabCase(componentName);
  const filePath = path.join(UI_PATTERNS_DIR, `${fileName}.tsx`);
  const storyPath = path.join(STORIES_DIR, `${componentName}.stories.tsx`);
  
  // Check if component file exists
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Component file not found: ${filePath}`);
    return false;
  }
  
  // Check if story already exists
  if (fs.existsSync(storyPath)) {
    console.log(`⚠️  Story already exists: ${storyPath}`);
    return false;
  }
  
  // Ensure stories directory exists
  if (!fs.existsSync(STORIES_DIR)) {
    fs.mkdirSync(STORIES_DIR, { recursive: true });
  }
  
  // Generate story content using appropriate template
  const storyTemplate = getStoryTemplate(componentName, fileName);
  const storyContent = storyTemplate
    .replace(/{COMPONENT_NAME}/g, componentName)
    .replace(/{FILE_NAME}/g, fileName);
  
  // Write story file
  fs.writeFileSync(storyPath, storyContent);
  console.log(`✅ Generated story: ${storyPath}`);
  return true;
}

function getAllUIComponents() {
  const files = fs.readdirSync(UI_PATTERNS_DIR);
  return files
    .filter(file => file.endsWith('.tsx') && !file.startsWith('index'))
    .map(file => {
      const fileName = file.replace('.tsx', '');
      return toPascalCase(fileName);
    });
}

function generateAllStories() {
  const components = getAllUIComponents();
  console.log(`📦 Found ${components.length} UI components`);
  
  let generated = 0;
  components.forEach(component => {
    if (generateStory(component)) {
      generated++;
    }
  });
  
  console.log(`🎉 Generated ${generated} new stories`);
}

function watchForChanges() {
  console.log('👀 Watching for new UI pattern components...');
  
  fs.watch(UI_PATTERNS_DIR, (eventType, filename) => {
    if (eventType === 'rename' && filename && filename.endsWith('.tsx') && !filename.startsWith('index')) {
      const componentName = toPascalCase(filename.replace('.tsx', ''));
      console.log(`🆕 New component detected: ${componentName}`);
      generateStory(componentName);
    }
  });
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
📚 Storybook Story Generator for UI Patterns

Usage:
  node scripts/generate-story.js <component-name>  Generate story for specific component
  node scripts/generate-story.js --all             Generate stories for all components
  node scripts/generate-story.js --watch           Watch for new components

Examples:
  node scripts/generate-story.js FileItem
  node scripts/generate-story.js --all
  node scripts/generate-story.js --watch
`);
  process.exit(1);
}

const command = args[0];

if (command === '--all') {
  generateAllStories();
} else if (command === '--watch') {
  watchForChanges();
} else {
  const componentName = toPascalCase(command);
  generateStory(componentName);
}
