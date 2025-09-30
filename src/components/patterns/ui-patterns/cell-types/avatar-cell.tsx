/**
 * Avatar cell component for displaying user avatars and initials
 */

import React from 'react'
import { cn } from '@/lib/utils'
import type { CellProps } from '@/types/table'

interface AvatarCellProps extends CellProps {
  showInitials?: boolean
  showAvatar?: boolean
  avatarSize?: 'sm' | 'md' | 'lg'
  fallbackIcon?: React.ReactNode
  getInitials?: (value: any, row: any) => string
  getAvatarSrc?: (value: any, row: any) => string
  getDisplayName?: (value: any, row: any) => string
}

export function AvatarCell({
  value,
  row,
  column,
  mode: _mode,
  onChange: _onChange,
  disabled: _disabled = false,
  className = '',
  showInitials = true,
  showAvatar = true,
  avatarSize = 'md',
  fallbackIcon,
  getInitials,
  getAvatarSrc,
  getDisplayName
}: AvatarCellProps) {
  // Get avatar size classes
  const getAvatarSizeClass = () => {
    switch (avatarSize) {
      case 'sm': return 'h-6 w-6 text-xs'
      case 'lg': return 'h-10 w-10 text-[13px]'
      default: return 'h-7 w-7 text-xs'
    }
  }

  // Get display name
  const displayName = getDisplayName ? getDisplayName(value, row) : (value || '')
  
  // Get initials
  const getInitialsFromName = (name: string): string => {
    if (!name) return ''
    
    const words = name.trim().split(/\s+/)
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase()
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase()
  }

  const initials = getInitials ? getInitials(value, row) : getInitialsFromName(displayName)
  
  // Get avatar source
  const avatarSrc = getAvatarSrc ? getAvatarSrc(value, row) : null

  // Check if this is a pending member (no name, just email or placeholder)
  const isPendingMember = !displayName || displayName.toLowerCase().includes('pending')

  return (
    <div className={cn('min-h-[32px] flex items-center gap-2', className)}>
      {/* Avatar */}
      <div className={cn(
        'bg-white border border-gray-200 rounded-lg flex items-center justify-center shrink-0',
        getAvatarSizeClass()
      )}>
        {showAvatar && avatarSrc ? (
          <img
            src={avatarSrc}
            alt={displayName}
            className="w-full h-full rounded-lg object-cover"
          />
        ) : showInitials && initials ? (
          <span className="font-450 text-gray-900">
            {initials}
          </span>
        ) : fallbackIcon ? (
          fallbackIcon
        ) : (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        )}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        {isPendingMember ? (
          <span className="text-[13px] font-450 italic text-gray-500">
            Pending Member
          </span>
        ) : (
          <span className="text-[13px] font-450 text-gray-900 truncate">
            {displayName}
          </span>
        )}
      </div>
    </div>
  )
}
