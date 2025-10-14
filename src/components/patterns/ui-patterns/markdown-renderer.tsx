import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { markdownStyles } from '@/lib/markdown/markdown-styles'
import type { MarkdownRendererProps } from '@/lib/markdown/types'

/**
 * MarkdownRenderer Component
 *
 * A reusable component for rendering Markdown content with consistent typography
 * throughout the application. Uses the project's design system and Tailwind classes.
 *
 * Features:
 * - Proper heading hierarchy (h1-h6)
 * - Formatted lists (ul, ol) with proper bullets and numbering
 * - Inline formatting (bold, italic, code)
 * - Code blocks with syntax highlighting
 * - Tables, blockquotes, and horizontal rules
 * - GitHub Flavored Markdown support (strikethrough, tables, task lists)
 *
 * @example
 * ```tsx
 * <MarkdownRenderer content={aiSystemResponse} />
 * ```
 *
 * @example With custom className
 * ```tsx
 * <MarkdownRenderer
 *   content={someMarkdown}
 *   className="max-w-3xl mx-auto"
 * />
 * ```
 */
export function MarkdownRenderer({
  content,
  className = '',
  components: customComponents = {}
}: MarkdownRendererProps) {
  // Define component mappings for markdown elements
  const components = {
    // Headings
    h1: ({ children, ...props }: any) => (
      <h1 className={markdownStyles.h1} {...props}>{children}</h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className={markdownStyles.h2} {...props}>{children}</h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className={markdownStyles.h3} {...props}>{children}</h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className={markdownStyles.h4} {...props}>{children}</h4>
    ),
    h5: ({ children, ...props }: any) => (
      <h5 className={markdownStyles.h5} {...props}>{children}</h5>
    ),
    h6: ({ children, ...props }: any) => (
      <h6 className={markdownStyles.h6} {...props}>{children}</h6>
    ),

    // Paragraphs
    p: ({ children, ...props }: any) => (
      <p className={markdownStyles.p} {...props}>{children}</p>
    ),

    // Lists
    ul: ({ children, ...props }: any) => (
      <ul className={markdownStyles.ul} {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className={markdownStyles.ol} {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className={markdownStyles.li} {...props}>{children}</li>
    ),

    // Inline formatting
    strong: ({ children, ...props }: any) => (
      <strong className={markdownStyles.strong} {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className={markdownStyles.em} {...props}>{children}</em>
    ),
    code: ({ inline, children, ...props }: any) => {
      if (inline) {
        return <code className={markdownStyles.code} {...props}>{children}</code>
      }
      return (
        <code className="block text-xs font-450 text-gray-900" {...props}>
          {children}
        </code>
      )
    },

    // Code blocks
    pre: ({ children, ...props }: any) => (
      <pre className={markdownStyles.pre} {...props}>{children}</pre>
    ),

    // Links
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        className={markdownStyles.a}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),

    // Blockquotes
    blockquote: ({ children, ...props }: any) => (
      <blockquote className={markdownStyles.blockquote} {...props}>
        {children}
      </blockquote>
    ),

    // Horizontal rule
    hr: ({ ...props }: any) => <hr className={markdownStyles.hr} {...props} />,

    // Tables
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className={markdownStyles.table} {...props}>{children}</table>
      </div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className={markdownStyles.thead} {...props}>{children}</thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className={markdownStyles.tbody} {...props}>{children}</tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className={markdownStyles.tr} {...props}>{children}</tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className={markdownStyles.th} {...props}>{children}</th>
    ),
    td: ({ children, ...props }: any) => (
      <td className={markdownStyles.td} {...props}>{children}</td>
    ),

    // Images
    img: ({ src, alt, ...props }: any) => (
      <img src={src} alt={alt} className={markdownStyles.img} {...props} />
    ),

    // Merge with custom components (allows overriding)
    ...customComponents,
  }

  return (
    <div className={`markdown-content ${className}`.trim()}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
