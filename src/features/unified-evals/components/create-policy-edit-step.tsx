import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useAutoGrowTextarea(value: string) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return ref
}

export interface BehaviorItem {
  id: string
  text: string
}

const CHAR_DELAY = 0.005
const CHAR_FADE_DURATION = 0.3
const REVEAL_DURATION = 0.3
const SECTION_GAP = 0.18
const ITEM_STAGGER = 0.07
const LABEL_GAP = 0.1
const TITLE_DESC_GAP = 0.15
const INITIAL_OFFSET = 0.05

interface TypewriterTextProps {
  text: string
  startDelay?: number
  className?: string
}

function TypewriterText({
  text,
  startDelay = 0,
  className,
}: TypewriterTextProps) {
  const chars = useMemo(() => Array.from(text), [text])
  return (
    <span
      className={cn('whitespace-pre-wrap break-words', className)}
      style={{ wordBreak: 'break-word' }}
    >
      {chars.map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: startDelay + i * CHAR_DELAY,
            duration: CHAR_FADE_DURATION,
            ease: 'easeOut',
          }}
        >
          {ch}
        </motion.span>
      ))}
    </span>
  )
}

function Reveal({
  delay,
  children,
  className,
  animateOnMount = true,
}: {
  delay: number
  children: React.ReactNode
  className?: string
  animateOnMount?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={animateOnMount ? { opacity: 0, y: 10 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={
        animateOnMount
          ? { delay, duration: REVEAL_DURATION, ease: 'easeOut' }
          : { duration: 0 }
      }
    >
      {children}
    </motion.div>
  )
}

function createBehaviorId() {
  return `b-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function behaviorsFromStrings(items: string[]): BehaviorItem[] {
  return items.map((text) => ({ id: createBehaviorId(), text }))
}

interface CreatePolicyEditStepProps {
  name: string
  description: string
  allowed: BehaviorItem[]
  disallowed: BehaviorItem[]
  onNameChange: (next: string) => void
  onDescriptionChange: (next: string) => void
  onAllowedChange: (next: BehaviorItem[]) => void
  onDisallowedChange: (next: BehaviorItem[]) => void
  animateOnMount?: boolean
}

export function CreatePolicyEditStep({
  name,
  description,
  allowed,
  disallowed,
  onNameChange,
  onDescriptionChange,
  onAllowedChange,
  onDisallowedChange,
}: CreatePolicyEditStepProps) {
  const initialRef = useRef({ name, description, allowed, disallowed })
  const initial = initialRef.current

  const offsets = useMemo(() => {
    const typingTime = (text: string) =>
      Math.max(text.length, 1) * CHAR_DELAY + CHAR_FADE_DURATION

    let cursor = INITIAL_OFFSET

    const titleStart = cursor
    cursor += Math.max(typingTime(initial.name), REVEAL_DURATION) + TITLE_DESC_GAP

    const descStart = cursor
    cursor += Math.max(typingTime(initial.description), REVEAL_DURATION) + SECTION_GAP

    const allowedLabelStart = cursor
    cursor += LABEL_GAP

    const allowedItemStarts: number[] = []
    initial.allowed.forEach(() => {
      allowedItemStarts.push(cursor)
      cursor += ITEM_STAGGER
    })
    cursor += SECTION_GAP

    const disallowedLabelStart = cursor
    cursor += LABEL_GAP

    const disallowedItemStarts: number[] = []
    initial.disallowed.forEach(() => {
      disallowedItemStarts.push(cursor)
      cursor += ITEM_STAGGER
    })
    cursor += REVEAL_DURATION + 0.1

    return {
      titleStart,
      descStart,
      allowedLabelStart,
      allowedItemStarts,
      disallowedLabelStart,
      disallowedItemStarts,
      totalMs: cursor * 1000,
    }
  }, [initial])

  const [isTyping, setIsTyping] = useState(true)
  const [descFocusKey, setDescFocusKey] = useState(0)
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set())
  const [dragRect, setDragRect] = useState<{
    startX: number
    startY: number
    currentX: number
    currentY: number
  } | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const dragRef = useRef<{
    startY: number
    initialSelected: Set<string>
  } | null>(null)
  const selectedIdsRef = useRef(selectedRowIds)
  useEffect(() => {
    selectedIdsRef.current = selectedRowIds
  }, [selectedRowIds])

  useEffect(() => {
    const timer = window.setTimeout(
      () => setIsTyping(false),
      offsets.totalMs,
    )
    return () => window.clearTimeout(timer)
  }, [offsets.totalMs])

  const handleTitleEnter = () => setDescFocusKey((k) => k + 1)

  const registerRow = useMemo(
    () => (id: string, el: HTMLDivElement | null) => {
      if (el) rowRefs.current.set(id, el)
      else rowRefs.current.delete(id)
    },
    [],
  )

  const computeSelectedFromDrag = (
    startY: number,
    currentY: number,
    base: Set<string>,
  ) => {
    const minY = Math.min(startY, currentY)
    const maxY = Math.max(startY, currentY)
    const next = new Set(base)
    rowRefs.current.forEach((el, id) => {
      const rect = el.getBoundingClientRect()
      if (rect.top < maxY && rect.bottom > minY) {
        next.add(id)
      }
    })
    return next
  }

  // Drag-select with intent detection on the whole edit step.
  useEffect(() => {
    const el = containerRef.current
    if (!el || isTyping) return

    const handleDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      const target = e.target as HTMLElement
      if (target.closest('button')) return

      const startX = e.clientX
      const startY = e.clientY
      const additive = e.shiftKey || e.metaKey || e.ctrlKey
      const initialSelected = additive
        ? new Set(selectedIdsRef.current)
        : new Set<string>()
      let dragStarted = false

      const handleMove = (me: MouseEvent) => {
        if (!dragStarted) {
          if (Math.hypot(me.clientX - startX, me.clientY - startY) > 5) {
            dragStarted = true
            window.getSelection()?.removeAllRanges()
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur()
            }
            dragRef.current = { startY, initialSelected }
            setDragRect({
              startX,
              startY,
              currentX: me.clientX,
              currentY: me.clientY,
            })
            setSelectedRowIds(
              computeSelectedFromDrag(startY, me.clientY, initialSelected),
            )
          }
        } else {
          const drag = dragRef.current
          if (!drag) return
          setSelectedRowIds(
            computeSelectedFromDrag(
              drag.startY,
              me.clientY,
              drag.initialSelected,
            ),
          )
          setDragRect((prev) =>
            prev
              ? { ...prev, currentX: me.clientX, currentY: me.clientY }
              : null,
          )
          window.getSelection()?.removeAllRanges()
        }
      }

      const handleUp = () => {
        window.removeEventListener('mousemove', handleMove)
        window.removeEventListener('mouseup', handleUp)
        if (dragStarted) {
          dragRef.current = null
          setDragRect(null)
        } else if (selectedIdsRef.current.size > 0 && !additive) {
          setSelectedRowIds(new Set())
        }
      }

      window.addEventListener('mousemove', handleMove)
      window.addEventListener('mouseup', handleUp)
    }

    el.addEventListener('mousedown', handleDown)
    return () => {
      el.removeEventListener('mousedown', handleDown)
    }
  }, [isTyping])

  // Delete / Escape when there's a row selection (and not editing a textarea).
  useEffect(() => {
    if (selectedRowIds.size === 0) return

    const handleKey = (e: KeyboardEvent) => {
      const active = document.activeElement
      if (
        active instanceof HTMLElement &&
        (active.tagName === 'TEXTAREA' || active.tagName === 'INPUT')
      ) {
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        const newAllowed = allowed.filter((it) => !selectedRowIds.has(it.id))
        const newDisallowed = disallowed.filter(
          (it) => !selectedRowIds.has(it.id),
        )
        if (newAllowed.length !== allowed.length) onAllowedChange(newAllowed)
        if (newDisallowed.length !== disallowed.length) {
          onDisallowedChange(newDisallowed)
        }
        setSelectedRowIds(new Set())
      } else if (e.key === 'Escape') {
        e.preventDefault()
        setSelectedRowIds(new Set())
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [
    selectedRowIds,
    allowed,
    disallowed,
    onAllowedChange,
    onDisallowedChange,
  ])

  // Click outside the edit step container clears selection.
  useEffect(() => {
    if (selectedRowIds.size === 0) return

    const handleDown = (e: MouseEvent) => {
      const el = containerRef.current
      if (!el) return
      if (!el.contains(e.target as Node)) {
        setSelectedRowIds(new Set())
      }
    }

    window.addEventListener('mousedown', handleDown)
    return () => window.removeEventListener('mousedown', handleDown)
  }, [selectedRowIds.size])

  return (
    <div
      ref={containerRef}
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-3 py-12"
    >
      <div className="flex flex-col gap-3">
        <Reveal delay={offsets.titleStart}>
          <NameField
            value={name}
            onChange={onNameChange}
            readOnly={isTyping}
            onEnter={handleTitleEnter}
            typewriter={
              isTyping
                ? { text: initial.name, startDelay: offsets.titleStart }
                : undefined
            }
          />
        </Reveal>
        <Reveal delay={offsets.descStart}>
          <DescriptionField
            value={description}
            onChange={onDescriptionChange}
            readOnly={isTyping}
            focusKey={descFocusKey}
            typewriter={
              isTyping
                ? { text: initial.description, startDelay: offsets.descStart }
                : undefined
            }
          />
        </Reveal>
      </div>

      <BehaviorsSection
        label="Allowed Behaviors"
        items={allowed}
        onChange={onAllowedChange}
        readOnly={isTyping}
        animateOnMount={isTyping}
        labelDelay={offsets.allowedLabelStart}
        itemDelays={offsets.allowedItemStarts}
        selectedIds={selectedRowIds}
        registerRow={registerRow}
      />

      <BehaviorsSection
        label="Disallowed Behaviors"
        items={disallowed}
        onChange={onDisallowedChange}
        readOnly={isTyping}
        animateOnMount={isTyping}
        labelDelay={offsets.disallowedLabelStart}
        itemDelays={offsets.disallowedItemStarts}
        selectedIds={selectedRowIds}
        registerRow={registerRow}
      />

      {dragRect && (
        <div
          className="pointer-events-none fixed z-50 rounded-sm border border-gray-400 bg-gray-300/20"
          style={{
            left: Math.min(dragRect.startX, dragRect.currentX),
            top: Math.min(dragRect.startY, dragRect.currentY),
            width: Math.abs(dragRect.currentX - dragRect.startX),
            height: Math.abs(dragRect.currentY - dragRect.startY),
          }}
        />
      )}
    </div>
  )
}

interface TypewriterOverlayConfig {
  text: string
  startDelay: number
}

interface NameFieldProps {
  value: string
  onChange: (next: string) => void
  readOnly: boolean
  onEnter?: () => void
  typewriter?: TypewriterOverlayConfig
}

function NameField({
  value,
  onChange,
  readOnly,
  onEnter,
  typewriter,
}: NameFieldProps) {
  const ref = useAutoGrowTextarea(value)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.metaKey &&
      !e.ctrlKey &&
      !e.altKey
    ) {
      e.preventDefault()
      onEnter?.()
    }
  }
  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        readOnly={readOnly}
        placeholder="Policy Name"
        rows={1}
        style={{
          wordBreak: 'break-word',
          color: typewriter ? 'transparent' : undefined,
          caretColor: typewriter ? 'transparent' : undefined,
        }}
        className="w-full resize-none overflow-hidden rounded-lg bg-transparent px-4 py-1 text-2xl font-[450] tracking-tight text-gray-900 placeholder:text-gray-400  focus:outline-none"
      />
      {typewriter && (
        <div
          className="pointer-events-none absolute inset-0 px-4 py-1 text-2xl font-[450] tracking-tight text-gray-900"
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          <TypewriterText
            text={typewriter.text}
            startDelay={typewriter.startDelay}
          />
        </div>
      )}
    </div>
  )
}

interface DescriptionFieldProps {
  value: string
  onChange: (next: string) => void
  readOnly: boolean
  focusKey?: number
  typewriter?: TypewriterOverlayConfig
}

function DescriptionField({
  value,
  onChange,
  readOnly,
  focusKey = 0,
  typewriter,
}: DescriptionFieldProps) {
  const ref = useAutoGrowTextarea(value)

  useEffect(() => {
    if (focusKey <= 0 || readOnly) return
    const el = ref.current
    if (!el) return
    el.focus()
    const len = el.value.length
    el.setSelectionRange(len, len)
  }, [focusKey, readOnly, ref])

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Describe the policy scope and key terms…"
        rows={1}
        style={{
          wordBreak: 'break-word',
          color: typewriter ? 'transparent' : undefined,
          caretColor: typewriter ? 'transparent' : undefined,
        }}
        className="w-full resize-none overflow-hidden rounded-lg bg-transparent px-4 py-3 text-sm leading-6 text-gray-900 placeholder:text-gray-400 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
      />
      {typewriter && (
        <div
          className="pointer-events-none absolute inset-0 px-4 py-3 text-sm leading-6 text-gray-900"
          style={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}
        >
          <TypewriterText
            text={typewriter.text}
            startDelay={typewriter.startDelay}
          />
        </div>
      )}
    </div>
  )
}

interface BehaviorsSectionProps {
  label: string
  items: BehaviorItem[]
  onChange: (next: BehaviorItem[]) => void
  readOnly: boolean
  animateOnMount: boolean
  labelDelay: number
  itemDelays: number[]
  selectedIds: Set<string>
  registerRow: (id: string, el: HTMLDivElement | null) => void
}

type FocusCursor = 'start' | 'end' | number

interface FocusRequest {
  id: string
  cursor: FocusCursor
}

function BehaviorsSection({
  label,
  items,
  onChange,
  readOnly,
  animateOnMount,
  labelDelay,
  itemDelays,
  selectedIds,
  registerRow,
}: BehaviorsSectionProps) {
  const [focusRequest, setFocusRequest] = useState<FocusRequest | null>(null)
  const [shakeMap, setShakeMap] = useState<Record<string, number>>({})
  const [focusedRowId, setFocusedRowId] = useState<string | null>(null)

  const findEmpty = () => items.find((it) => it.text.trim().length === 0)

  const focusedRow =
    focusedRowId !== null
      ? items.find((it) => it.id === focusedRowId)
      : undefined
  const isEditingFilled =
    focusedRow !== undefined && focusedRow.text.trim().length > 0

  useEffect(() => {
    if (readOnly) return
    if (findEmpty()) return
    onChange([...items, { id: createBehaviorId(), text: '' }])
  }, [items, readOnly, onChange])

  const triggerShake = (id: string) => {
    setShakeMap((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }))
  }

  const handleUpdate = (id: string, text: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, text } : item)))
  }

  const handleRemove = (id: string) => {
    onChange(items.filter((item) => item.id !== id))
  }

  const handleAddAfter = (afterId: string) => {
    const idx = items.findIndex((it) => it.id === afterId)
    if (idx < 0) return

    // Pressing Enter on an empty behavior → shake it, don't add.
    if (items[idx].text.trim().length === 0) {
      triggerShake(afterId)
      return
    }

    // If an empty behavior already exists elsewhere, remove it and create the
    // new one at the cursor position. Otherwise just insert after the current.
    const empty = findEmpty()
    let workingItems = items
    let cursorIdx = idx
    if (empty) {
      const emptyIdx = items.findIndex((it) => it.id === empty.id)
      workingItems = items.filter((it) => it.id !== empty.id)
      if (emptyIdx < idx) cursorIdx = idx - 1
    }

    const next: BehaviorItem = { id: createBehaviorId(), text: '' }
    onChange([
      ...workingItems.slice(0, cursorIdx + 1),
      next,
      ...workingItems.slice(cursorIdx + 1),
    ])
    setFocusRequest({ id: next.id, cursor: 'start' })
  }

  const handlePrev = (currentId: string): boolean => {
    const idx = items.findIndex((it) => it.id === currentId)
    if (idx <= 0) return false
    setFocusRequest({ id: items[idx - 1].id, cursor: 'end' })
    return true
  }

  const handleNext = (currentId: string): boolean => {
    const idx = items.findIndex((it) => it.id === currentId)
    if (idx < 0 || idx >= items.length - 1) return false
    setFocusRequest({ id: items[idx + 1].id, cursor: 'start' })
    return true
  }

  const handleMergeBackspace = (
    currentId: string,
    currentText: string,
  ): boolean => {
    const idx = items.findIndex((it) => it.id === currentId)
    if (idx <= 0) return false
    const prev = items[idx - 1]
    const cursorPos = prev.text.length
    const mergedText = prev.text + currentText
    onChange([
      ...items.slice(0, idx - 1),
      { ...prev, text: mergedText },
      ...items.slice(idx + 1),
    ])
    setFocusRequest({ id: prev.id, cursor: cursorPos })
    return true
  }

  return (
    <div className="group/section flex flex-col gap-3">
      <Reveal delay={labelDelay} animateOnMount={animateOnMount}>
        <p className="px-4 text-[0.8125rem] font-medium text-gray-900">
          {label}
        </p>
      </Reveal>

      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => {
          const isEmpty = item.text.trim().length === 0
          const isFocusTarget = focusRequest?.id === item.id
          if (isEditingFilled && isEmpty && !isFocusTarget) return null
          return (
            <Reveal
              key={item.id}
              delay={itemDelays[i] ?? 0}
              animateOnMount={animateOnMount}
            >
              <BehaviorRow
                item={item}
                autoFocus={focusRequest?.id === item.id}
                focusCursor={
                  focusRequest?.id === item.id ? focusRequest.cursor : undefined
                }
                readOnly={readOnly}
                shakeKey={shakeMap[item.id] ?? 0}
                isSelected={selectedIds.has(item.id)}
                rowRef={(el) => registerRow(item.id, el)}
                onChange={(text) => handleUpdate(item.id, text)}
                onRemove={() => handleRemove(item.id)}
                onAddAfter={() => handleAddAfter(item.id)}
                onPrev={() => handlePrev(item.id)}
                onNext={() => handleNext(item.id)}
                onMergeBackspace={(text) => handleMergeBackspace(item.id, text)}
                onFocusRow={() => setFocusedRowId(item.id)}
                onBlurRow={() =>
                  setFocusedRowId((curr) => (curr === item.id ? null : curr))
                }
              />
            </Reveal>
          )
        })}
        {isEditingFilled && (
          <div className="flex items-center px-4 py-2">
            <span className="text-xs text-gray-400">
              Press{' '}
              <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 font-mono text-[10px] font-medium text-gray-600">
                Enter
              </kbd>{' '}
              to Add New Behavior
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface BehaviorRowProps {
  item: BehaviorItem
  autoFocus: boolean
  focusCursor?: FocusCursor
  readOnly: boolean
  shakeKey: number
  isSelected?: boolean
  rowRef?: (el: HTMLDivElement | null) => void
  onChange: (text: string) => void
  onRemove: () => void
  onAddAfter: () => void
  onPrev: () => boolean
  onNext: () => boolean
  onMergeBackspace: (currentText: string) => boolean
  onFocusRow: () => void
  onBlurRow: () => void
}

function BehaviorRow({
  item,
  autoFocus,
  focusCursor,
  readOnly,
  shakeKey,
  isSelected = false,
  rowRef,
  onChange,
  onRemove,
  onAddAfter,
  onPrev,
  onNext,
  onMergeBackspace,
  onFocusRow,
  onBlurRow,
}: BehaviorRowProps) {
  const ref = useAutoGrowTextarea(item.text)
  const shakeControls = useAnimation()

  useEffect(() => {
    if (shakeKey > 0) {
      shakeControls.start({
        x: [0, -8, 8, -6, 6, -3, 3, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      })
    }
  }, [shakeKey, shakeControls])

  useEffect(() => {
    if (!autoFocus || readOnly) return
    const el = ref.current
    if (!el) return
    el.focus()
    if (focusCursor === 'start') {
      el.setSelectionRange(0, 0)
    } else if (focusCursor === 'end') {
      const len = el.value.length
      el.setSelectionRange(len, len)
    } else if (typeof focusCursor === 'number') {
      el.setSelectionRange(focusCursor, focusCursor)
    }
  }, [autoFocus, readOnly, focusCursor, ref])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return
    const el = e.currentTarget
    const start = el.selectionStart
    const end = el.selectionEnd
    const value = el.value
    const noModifiers = !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey
    const collapsed = start === end

    // Enter (no modifiers) → insert new behavior after this one.
    if (e.key === 'Enter' && noModifiers) {
      e.preventDefault()
      onAddAfter()
      return
    }

    // Backspace at the start → merge into previous behavior.
    if (e.key === 'Backspace' && noModifiers && collapsed && start === 0) {
      if (onMergeBackspace(value)) e.preventDefault()
      return
    }

    // ArrowUp on the first line (no shift) → previous row, cursor at end.
    if (e.key === 'ArrowUp' && !e.shiftKey) {
      const beforeCursor = value.slice(0, start)
      if (!beforeCursor.includes('\n') && onPrev()) e.preventDefault()
      return
    }

    // ArrowDown on the last line (no shift) → next row, cursor at start.
    if (e.key === 'ArrowDown' && !e.shiftKey) {
      const afterCursor = value.slice(end)
      if (!afterCursor.includes('\n') && onNext()) e.preventDefault()
      return
    }

    // ArrowLeft at the very start (no selection) → previous row at end.
    if (
      e.key === 'ArrowLeft' &&
      !e.shiftKey &&
      collapsed &&
      start === 0
    ) {
      if (onPrev()) e.preventDefault()
      return
    }

    // ArrowRight at the very end (no selection) → next row at start.
    if (
      e.key === 'ArrowRight' &&
      !e.shiftKey &&
      collapsed &&
      start === value.length
    ) {
      if (onNext()) e.preventDefault()
      return
    }
  }

  return (
    <motion.div
      ref={rowRef}
      animate={shakeControls}
      className="group flex items-start gap-2"
    >
      <div
        className={cn(
          'flex flex-1 items-start gap-3.5 rounded-md',
          isSelected ? 'bg-gray-100' : 'group-hover:bg-gray-50',
        )}
      >
        <div className="self-stretch w-0.5 shrink-0 rounded-full bg-gray-200" />
        <textarea
          ref={ref}
          value={item.text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocusRow}
          onBlur={onBlurRow}
          readOnly={readOnly}
          placeholder="Describe the behavior…"
          rows={1}
          style={{ wordBreak: 'break-word' }}
          className="flex-1 min-w-0 resize-none overflow-hidden bg-transparent py-1 text-sm leading-6 text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        onClick={onRemove}
        disabled={readOnly}
        aria-label="Remove behavior"
        className="h-7 w-7 mt-0.5 shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  )
}
