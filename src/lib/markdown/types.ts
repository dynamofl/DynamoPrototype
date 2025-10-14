/**
 * Type definitions for Markdown rendering
 */

/**
 * Props for the MarkdownRenderer component
 */
export interface MarkdownRendererProps {
  /**
   * The markdown content to render
   */
  content: string

  /**
   * Optional additional CSS classes to apply to the container
   */
  className?: string

  /**
   * Optional custom component overrides
   * Allows customizing how specific markdown elements are rendered
   */
  components?: Record<string, React.ComponentType<any>>
}

/**
 * Configuration for markdown element styles
 */
export type MarkdownStyleConfig = Record<string, string>
