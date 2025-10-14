/**
 * Centralized Markdown Typography Styles
 *
 * This configuration defines consistent styling for all Markdown elements
 * using the project's design system (Tailwind classes with gray, red, green, amber colors).
 *
 * Typography follows the project's font weight scale and Inter Variable font.
 */

export const markdownStyles = {
  // Headings - Title case, using custom font weights
  h1: 'text-2xl font-650 leading-8 text-gray-900 mb-4 mt-6 first:mt-0',
  h2: 'text-xl font-550 leading-7 text-gray-900 mb-3 mt-5 first:mt-0',
  h3: 'text-lg font-550 leading-6 text-gray-900 mb-2 mt-4 first:mt-0',
  h4: 'text-base font-550 leading-5 text-gray-900 mb-2 mt-3 first:mt-0',
  h5: 'text-sm font-550 leading-4 text-gray-900 mb-2 mt-3 first:mt-0',
  h6: 'text-xs font-550 leading-4 text-gray-700 mb-2 mt-3 first:mt-0',

  // Paragraphs
  p: 'text-sm font-425 leading-relaxed text-gray-900 mb-4 last:mb-0',

  // Lists - proper bullet points and numbering
  ul: 'list-disc pl-6 mb-4 space-y-2 text-gray-900',
  ol: 'list-decimal pl-6 mb-4 space-y-2 text-gray-900',
  li: 'text-sm font-425 leading-relaxed text-gray-900 pl-1',

  // Inline formatting
  strong: 'font-550 text-gray-900',
  em: 'italic text-gray-900',
  code: 'bg-gray-100 text-gray-900 px-1.5 py-0.5 rounded text-xs font-450 border border-gray-200',

  // Code blocks
  pre: 'bg-gray-100 border border-gray-200 rounded-lg p-4 mb-4 overflow-x-auto',

  // Links
  a: 'text-gray-900 underline hover:text-gray-700 font-450',

  // Blockquotes
  blockquote: 'border-l-4 border-gray-300 pl-4 py-2 mb-4 text-gray-700 italic bg-gray-50',

  // Horizontal rule
  hr: 'border-t border-gray-200 my-6',

  // Tables
  table: 'w-full border-collapse mb-4 text-sm',
  thead: 'bg-gray-100 border-b-2 border-gray-200',
  tbody: '',
  tr: 'border-b border-gray-200',
  th: 'px-4 py-2 text-left font-550 text-gray-900',
  td: 'px-4 py-2 text-gray-900 font-425',

  // Images
  img: 'max-w-full h-auto rounded-lg mb-4',

  // Nested list spacing
  'ul ul': 'mt-2 mb-0',
  'ol ol': 'mt-2 mb-0',
  'ul ol': 'mt-2 mb-0',
  'ol ul': 'mt-2 mb-0',
} as const

/**
 * Returns the className for a given Markdown element
 */
export function getMarkdownElementStyle(element: keyof typeof markdownStyles): string {
  return markdownStyles[element] || ''
}
