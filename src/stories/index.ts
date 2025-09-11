// Storybook Stories Index
// Main entry point for all component stories

export { UI_STORIES } from './ui';
export { PATTERN_STORIES } from './patterns';

// Story Categories
export const STORY_CATEGORIES = {
  ui: 'UI',
  patterns: 'Patterns',
  features: 'Features',
  docs: 'Documentation'
} as const;

export type StoryCategory = keyof typeof STORY_CATEGORIES;
