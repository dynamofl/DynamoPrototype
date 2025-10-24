/**
 * SummaryNavigation - Left sidebar navigation for summary sections
 */

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export interface NavigationSection {
  key: string
  label: string
  visible: boolean
}

interface SummaryNavigationProps {
  sections: NavigationSection[]
  activeSection?: string
  onSectionClick: (sectionKey: string) => void
}

export function SummaryNavigation({
  sections,
  activeSection,
  onSectionClick
}: SummaryNavigationProps) {
  // Filter to only show visible sections
  const visibleSections = sections.filter(s => s.visible)

  if (visibleSections.length === 0) return null

  return (
    <nav className="min-w-[200px] space-y-1">
      {visibleSections.map((section) => (
        <button
          key={section.key}
          onClick={() => onSectionClick(section.key)}
          className={cn(
            "w-full text-left py-1 text-sm transition-all duration-300 relative flex items-center gap-3",
            "hover:text-gray-900",
            activeSection === section.key
              ? "text-gray-900 font-500"
              : "text-gray-400 font-400"
          )}
        >
          {/* Dash indicator */}
          <div className={cn(
            "h-0.5  transition-all duration-200 rounded-full flex-shrink-0",
            activeSection === section.key ? "w-5 bg-gray-900" : "w-3 bg-gray-300"
          )} />
          <span>{section.label}</span>
        </button>
      ))}
    </nav>
  )
}
