import { cn } from '@/lib/utils'
import type { PolicyTemplate } from './types'

interface PolicyListViewProps {
  templates: PolicyTemplate[]
  selectedIds: Set<string>
  hoveredTemplateId: string | null
  onToggle: (templateId: string) => void
  onHover: (template: PolicyTemplate | null) => void
}

export function PolicyListView({
  templates,
  selectedIds,
  hoveredTemplateId,
  onToggle,
  onHover,
}: PolicyListViewProps) {
  if (templates.length === 0) {
    return (
      <p className="py-6 text-center text-[0.8125rem] text-gray-400">No matching templates</p>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {templates.map(template => {
        const selected = selectedIds.has(template.id)
        const isHovered = hoveredTemplateId === template.id
        return (
          <div
            key={template.id}
            onMouseEnter={() => onHover(template)}
            className={cn(
              'flex  gap-2.5 mx-3 px-3 py-2.5 rounded-lg transition-colors cursor-default border-none',
              isHovered ? 'bg-gray-50' : ''
            )}
          >
            {/* Checkbox */}
            <div className='py-1'>
            <button
              onClick={() => onToggle(template.id)}
              className={cn(
                'h-4 w-4 rounded border-[1.5px] shrink-0 flex items-center justify-center transition-colors',
                selected
                  ? 'bg-gray-900 border-gray-900 dark:bg-gray-200 dark:border-gray-200'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              {selected && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
            </div>

            {/* Name + category + description */}
            <button
              onClick={() => onToggle(template.id)}
              className="flex-1 text-left min-w-0"
            >
              <div className="flex items-center gap-1">
                <span className={cn(
                  'text-[0.8125rem] font-[450] truncate',
                  selected ? 'text-gray-900' : 'text-gray-700'
                )}>
                  {template.name}
                </span>
                
                <span className="py-0.5 rounded-full text-[0.75rem] text-gray-500 shrink-0">
                   / {template.category}
                </span>
              </div>
              <p className="text-[0.75rem] text-gray-500 line-clamp-1 mt-0.5">
                {template.description}
              </p>
            </button>
          </div>
        )
      })}
    </div>
  )
}
