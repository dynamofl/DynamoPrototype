import React, { useState, useEffect, useRef, type KeyboardEvent } from 'react'
import { Textarea } from './textarea'
import { Switch } from './switch'
import { Button } from './button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface CellConfig {
  type: 'freeText' | 'dropdown' | 'button' | 'switch'
  width?: string
  height?: string
  overlayHeight?: string
  overlayWidth?: string
  placeholder?: string
  options?: Array<{ value: string; label: string }>
}

interface EditableCellProps {
  value: any
  config: CellConfig
  onValueChange: (value: any) => void
  onKeyDown?: (e: KeyboardEvent) => void
  autoFocus?: boolean
  cellRef?: (element: HTMLElement | null) => void
  disabled?: boolean
  // For single-cell editing constraint
  isEditing: boolean
  onStartEditing: () => void
  onStopEditing: () => void
  // For button type
  onButtonClick?: () => void
  buttonIcon?: React.ReactNode
  buttonVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  // For switch type
  switchLabel?: string
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  config,
  onValueChange,
  onKeyDown,
  autoFocus = false,
  cellRef,
  disabled = false,
  isEditing,
  onStartEditing,
  onStopEditing,
  onButtonClick,
  buttonIcon,
  buttonVariant = 'ghost',
  switchLabel
}) => {
  const [localValue, setLocalValue] = useState(value)
  const [overlayHeight, setOverlayHeight] = useState(parseInt(config.overlayHeight || '40'))
  const [overlayPosition, setOverlayPosition] = useState({ top: 0, left: 0 })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const maxHeight = 160

  // Update local value when prop value changes
  useEffect(() => {
    setLocalValue(value)
    // Calculate initial height based on content for text types
    if ((config.type === 'freeText') && value) {
      const lines = String(value).split('\n').length
      const calculatedHeight = Math.max(parseInt(config.overlayHeight || '40'), Math.min(lines * 20 + 20, maxHeight))
      setOverlayHeight(calculatedHeight)
    }
  }, [value, config.overlayHeight])

  const handleFocus = () => {
    if (!disabled) {
      // Calculate overlay position relative to viewport for freeText cells
      if (config.type === 'freeText' && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        // Add scroll offset to account for page scroll
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft
        
        setOverlayPosition({
          top: rect.top + scrollTop,
          left: rect.left + scrollLeft
        })
      }
      onStartEditing()
    }
  }

  const handleBlur = () => {
    if (config.type === 'freeText') {
      onStopEditing()
      onValueChange(localValue)
    } else {
      // For non-freeText cells, just stop editing
      onStopEditing()
    }
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const newValue = e.target.value
    setLocalValue(newValue)
    
    if (config.type === 'freeText') {
      // Calculate new height based on content
      const lineHeight = 20
      const lines = newValue.split('\n').length
      const newHeight = Math.max(parseInt(config.overlayHeight || '40'), Math.min(lines * lineHeight + 20, maxHeight))
      setOverlayHeight(newHeight)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement | HTMLInputElement | HTMLDivElement>) => {
    if (onKeyDown) {
      onKeyDown(e)
    }
    
    // Handle Tab navigation
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault()
      handleBlur()
      // Trigger callback to move to next cell
      onKeyDown?.(e)
    }
  }

  // Auto focus when editing starts
  useEffect(() => {
    if (isEditing && config.type === 'freeText') {
      // Small delay to ensure the overlay is rendered
      const timer = setTimeout(() => {
        textareaRef.current?.focus()
        // Select all text for easy replacement
        textareaRef.current?.select()
      }, 10)
      
      return () => clearTimeout(timer)
    }
  }, [isEditing, config.type])

  // Set ref for external access
  useEffect(() => {
    if (cellRef) {
      if (config.type === 'freeText' && textareaRef.current) {
        cellRef(textareaRef.current)
      }
    }
  }, [cellRef, config.type])

  const renderCellContent = () => {
    switch (config.type) {
      case 'freeText':
        return (
          <div 
            ref={containerRef}
            className="relative" 
            style={{ height: config.height, width: config.width, overflow: 'visible' }}
          >
            {/* Fixed width cell content - always visible */}
            <div 
              className="grid-cell w-full h-full text-sm cursor-pointer rounded flex items-start"
              onClick={handleFocus}
              style={{ 
                height: config.height, 
                width: config.width,
                lineHeight: 'normal',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: '8px'
              }}
            >
              {localValue ? (
                <div className="w-full overflow-hidden">
                  <div className="whitespace-pre-line line-clamp-1 text-ellipsis overflow-hidden">
                    {localValue}
                  </div>
                </div>
              ) : (
                <span className="text-gray-400 italic" style={{ lineHeight: 'normal' }}>
                  {config.placeholder}
                </span>
              )}
            </div>
            
            {/* Overlay textarea - appears on top when editing */}
            {isEditing && (
              <div 
                className="cell-overlay"
                style={{ 
                  height: `${overlayHeight}px`,
                  width: config.overlayWidth,
                  minHeight: config.overlayHeight,
                  maxHeight: `${maxHeight}px`,
                  position: 'fixed',
                  top: `${overlayPosition.top}px`,
                  left: `${overlayPosition.left}px`,
                  zIndex: 999999
                }}
                onMouseEnter={(e) => e.stopPropagation()}
                onMouseLeave={(e) => e.stopPropagation()}
                onMouseMove={(e) => e.stopPropagation()}
                onMouseOver={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <Textarea
                  ref={textareaRef}
                  placeholder={config.placeholder}
                  value={localValue || ''}
                  onChange={handleTextChange}
                  onBlur={handleBlur}
                  onKeyDown={handleKeyDown}
                  onFocus={(e) => e.target.select()}
                  onMouseEnter={(e) => e.stopPropagation()}
                  onMouseLeave={(e) => e.stopPropagation()}
                  onMouseMove={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full resize-none text-sm border-0 focus:ring-0 focus:outline-none p-2 whitespace-pre-wrap"
                  style={{ 
                    minHeight: config.overlayHeight,
                    height: `${overlayHeight - 16}px`
                  }}
                />
              </div>
            )}
          </div>
        )

      case 'switch':
        return (
          <div 
            className="grid-cell flex items-center justify-center cursor-pointer"
            style={{ height: config.height, width: config.width }}
            onClick={handleFocus}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <div className="flex items-center space-x-2">
              <Switch
                checked={localValue}
                onCheckedChange={(checked) => {
                  setLocalValue(checked)
                  onValueChange(checked)
                }}
                disabled={disabled}
              />
              {switchLabel && (
                <span className="text-xs text-muted-foreground">
                  {switchLabel}
                </span>
              )}
            </div>
          </div>
        )

      case 'button':
        return (
          <div 
            className="grid-cell flex items-center justify-center cursor-pointer"
            style={{ height: config.height, width: config.width }}
            onClick={handleFocus}
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            <Button
              type="button"
              variant={buttonVariant}
              size="sm"
              onClick={(e) => {
                e.stopPropagation() // Prevent triggering the cell's onClick
                onButtonClick?.()
              }}
              className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              disabled={disabled}
            >
              {buttonIcon}
            </Button>
          </div>
        )

      case 'dropdown':
        return (
          <div 
            className="grid-cell flex items-center justify-center p-2"
            style={{ height: config.height, width: config.width }}
          >
            <Select value={localValue} onValueChange={(val) => {
              setLocalValue(val)
              onValueChange(val)
            }}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={config.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {config.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )

      default:
        return null
    }
  }

  return renderCellContent()
}

export default EditableCell