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
    <nav className="max-w-[200px] space-y-2">
      {visibleSections.map((section) => (
        <button
          key={section.key}
          onClick={() => onSectionClick(section.key)}
          className={cn(
            "w-full text-left px-5 py-0.5 text-sm transition-all duration-200 relative rounded-lg",
            "hover:bg-gray-50",
            activeSection === section.key
              ? "text-gray-900 font-500 bg-gray-50 before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-[100%] before:w-0.5 before:bg-gray-900 before:rounded-full"
              : "text-gray-600 font-400"
          )}
        >
          {section.label}
        </button>
      ))}
    </nav>
  )
}
