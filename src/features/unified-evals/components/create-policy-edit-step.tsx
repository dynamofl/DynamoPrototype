import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import {
  BookOpenCheck,
  Check,
  Globe,
  Link as LinkIcon,
  Sparkles,
  X,
} from 'lucide-react'
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
  proposed?: boolean
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

      <ProposedReviewBar
        allowed={allowed}
        disallowed={disallowed}
        onAllowedChange={onAllowedChange}
        onDisallowedChange={onDisallowedChange}
        disabled={isTyping}
      />
    </div>
  )
}

interface ProposedReviewBarProps {
  allowed: BehaviorItem[]
  disallowed: BehaviorItem[]
  onAllowedChange: (next: BehaviorItem[]) => void
  onDisallowedChange: (next: BehaviorItem[]) => void
  disabled: boolean
}

function ProposedReviewBar({
  allowed,
  disallowed,
  onAllowedChange,
  onDisallowedChange,
  disabled,
}: ProposedReviewBarProps) {
  const allowedCount = allowed.filter((b) => b.proposed).length
  const disallowedCount = disallowed.filter((b) => b.proposed).length
  const total = allowedCount + disallowedCount

  if (total === 0) {
    return (
      <DefaultActionBar
        allowed={allowed}
        disallowed={disallowed}
        onAllowedChange={onAllowedChange}
        onDisallowedChange={onDisallowedChange}
      />
    )
  }

  const sectionLabel =
    allowedCount > 0 && disallowedCount > 0
      ? 'Behaviors'
      : allowedCount > 0
        ? 'Allowed Behavior'
        : 'Disallowed Behavior'

  const acceptAll = () => {
    if (allowedCount > 0) {
      onAllowedChange(
        allowed.map((b) => (b.proposed ? { ...b, proposed: false } : b)),
      )
    }
    if (disallowedCount > 0) {
      onDisallowedChange(
        disallowed.map((b) => (b.proposed ? { ...b, proposed: false } : b)),
      )
    }
  }

  const rejectAll = () => {
    if (allowedCount > 0) {
      onAllowedChange(allowed.filter((b) => !b.proposed))
    }
    if (disallowedCount > 0) {
      onDisallowedChange(disallowed.filter((b) => !b.proposed))
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-2xl items-center gap-6 rounded-xl border border-gray-200 bg-gray-0 px-4 py-3 shadow-lg">
        <span className="text-sm text-gray-700">
          Generate {sectionLabel}:{' '}
          <span className="font-medium text-gray-900">{total} Added</span>
        </span>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="sm"
            onClick={acceptAll}
            disabled={disabled}
          >
            Accept All
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={rejectAll}
            disabled={disabled}
          >
            Reject All
          </Button>
        </div>
      </div>
    </div>
  )
}

type OpenAction =
  | 'auto-generate'
  | 'extract-files'
  | 'refer-web'
  | 'proofread'
  | null

interface DefaultActionBarProps {
  allowed: BehaviorItem[]
  disallowed: BehaviorItem[]
  onAllowedChange: (next: BehaviorItem[]) => void
  onDisallowedChange: (next: BehaviorItem[]) => void
}

function DefaultActionBar({
  allowed,
  disallowed,
  onAllowedChange,
  onDisallowedChange,
}: DefaultActionBarProps) {
  const [openAction, setOpenAction] = useState<OpenAction>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!openAction) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpenAction(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [openAction])

  const toggle = (action: Exclude<OpenAction, null>) =>
    setOpenAction((curr) => (curr === action ? null : action))

  const addProposedBehaviors = (allowedCount: number, disallowedCount: number) => {
    if (allowedCount > 0) {
      const next = Array.from({ length: allowedCount }, (_, i) => ({
        id: createBehaviorId(),
        text: `Generated allowed behavior ${i + 1}`,
        proposed: true,
      }))
      onAllowedChange([...allowed, ...next])
    }
    if (disallowedCount > 0) {
      const next = Array.from({ length: disallowedCount }, (_, i) => ({
        id: createBehaviorId(),
        text: `Generated disallowed behavior ${i + 1}`,
        proposed: true,
      }))
      onDisallowedChange([...disallowed, ...next])
    }
    setOpenAction(null)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-30 flex justify-center px-4">
      <div
        ref={containerRef}
        className="pointer-events-auto relative"
      >
        {openAction === 'auto-generate' && (
          <AutoGeneratePopover onGenerate={addProposedBehaviors} />
        )}
        {openAction === 'extract-files' && (
          <ExtractFilesPopover
            onExtract={() => addProposedBehaviors(2, 1)}
          />
        )}
        {openAction === 'refer-web' && (
          <ReferWebPopover onExtract={() => addProposedBehaviors(1, 1)} />
        )}
        {openAction === 'proofread' && (
          <ProofreadPopover onProofread={() => addProposedBehaviors(1, 1)} />
        )}

        <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-gray-0 px-2 py-1.5 shadow-lg">
          <FloatingActionItem
            icon={Sparkles}
            label="Auto Generate Behaviors"
            active={openAction === 'auto-generate'}
            onClick={() => toggle('auto-generate')}
          />
          <FloatingActionItem
            icon={LinkIcon}
            label="Extract from Files"
            active={openAction === 'extract-files'}
            onClick={() => toggle('extract-files')}
          />
          <FloatingActionItem
            icon={Globe}
            label="Refer Web"
            active={openAction === 'refer-web'}
            onClick={() => toggle('refer-web')}
          />
          <FloatingActionItem
            icon={BookOpenCheck}
            label="Proofread Policy"
            active={openAction === 'proofread'}
            onClick={() => toggle('proofread')}
          />
        </div>
      </div>
    </div>
  )
}

interface FloatingActionItemProps {
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  onClick?: () => void
}

function FloatingActionItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: FloatingActionItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-900 hover:bg-gray-50',
        active && 'bg-gray-100',
      )}
    >
      <Icon className="h-4 w-4 text-gray-700" />
      {label}
    </button>
  )
}

interface AutoGeneratePopoverProps {
  onGenerate: (allowedCount: number, disallowedCount: number) => void
}

function AutoGeneratePopover({ onGenerate }: AutoGeneratePopoverProps) {
  const [allowedCount, setAllowedCount] = useState(3)
  const [disallowedCount, setDisallowedCount] = useState(3)

  return (
    <PopoverShell title="Auto Generate Behaviors">
      <SliderRow
        label="Allowed Behaviors"
        value={allowedCount}
        onChange={setAllowedCount}
      />
      <SliderRow
        label="Disallowed Behaviors"
        value={disallowedCount}
        onChange={setDisallowedCount}
        className="mt-3"
      />
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => onGenerate(allowedCount, disallowedCount)}
        >
          Generate
        </Button>
      </div>
    </PopoverShell>
  )
}

interface SliderRowProps {
  label: string
  value: number
  onChange: (next: number) => void
  className?: string
}

function SliderRow({ label, value, onChange, className }: SliderRowProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between px-1">
        <span className="text-sm text-gray-700">{label}</span>
        <span className="text-sm tabular-nums text-gray-900">{value}</span>
      </div>
      <input
        type="range"
        min={1}
        max={10}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 w-full accent-gray-900"
      />
    </div>
  )
}

interface ExtractFilesPopoverProps {
  onExtract: () => void
}

function ExtractFilesPopover({ onExtract }: ExtractFilesPopoverProps) {
  const [files, setFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <PopoverShell title="Extract from Files">
      <div
        onClick={() => inputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center hover:border-gray-400 cursor-pointer"
      >
        <p className="text-sm text-gray-500">Drop files or</p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
        >
          Upload Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            setFiles((prev) => [...prev, ...Array.from(e.target.files ?? [])])
            e.target.value = ''
          }}
        />
      </div>
      {files.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1 px-1">
          {files.map((f, i) => (
            <li key={i} className="truncate text-xs text-gray-700">
              {f.name}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={files.length === 0}
          onClick={onExtract}
        >
          Extract
        </Button>
      </div>
    </PopoverShell>
  )
}

interface ReferWebPopoverProps {
  onExtract: () => void
}

function ReferWebPopover({ onExtract }: ReferWebPopoverProps) {
  const [url, setUrl] = useState('')

  return (
    <PopoverShell title="Refer Web">
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://example.com/policy-reference"
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
      />
      <p className="mt-2 px-1 text-xs text-gray-500">
        We'll extract content from this link and propose updates to your policy
        description, allowed and disallowed behaviors.
      </p>
      <div className="mt-4 flex justify-end">
        <Button
          type="button"
          size="sm"
          disabled={!url.trim()}
          onClick={onExtract}
        >
          Extract
        </Button>
      </div>
    </PopoverShell>
  )
}

interface ProofreadPopoverProps {
  onProofread: () => void
}

function ProofreadPopover({ onProofread }: ProofreadPopoverProps) {
  return (
    <PopoverShell title="Proofread Policy">
      <p className="px-1 text-sm text-gray-600">
        Analyze the current policy and propose improvements to the description
        and behaviors. You'll review each suggestion before it's applied.
      </p>
      <div className="mt-4 flex justify-end">
        <Button type="button" size="sm" onClick={onProofread}>
          Run Proofread
        </Button>
      </div>
    </PopoverShell>
  )
}

function PopoverShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="absolute inset-x-0 bottom-full mb-2 rounded-xl border border-gray-200 bg-gray-0 p-4 shadow-md">
      <p className="px-1 pb-3 text-xs font-medium text-gray-700">{title}</p>
      {children}
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

  const handleGenerate = (rowId: string, count: number) => {
    const idx = items.findIndex((it) => it.id === rowId)
    if (idx < 0) return
    const generated: BehaviorItem[] = Array.from({ length: count }, (_, i) => ({
      id: createBehaviorId(),
      text: `Generated behavior ${i + 1}`,
      proposed: true,
    }))
    onChange([
      ...items.slice(0, idx),
      ...generated,
      ...items.slice(idx + 1),
    ])
    setFocusRequest({ id: generated[0].id, cursor: 'end' })
  }

  const handleAcceptProposed = (rowId: string) => {
    onChange(
      items.map((it) =>
        it.id === rowId ? { ...it, proposed: false } : it,
      ),
    )
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
                onGenerate={(count) => handleGenerate(item.id, count)}
                onAcceptProposed={() => handleAcceptProposed(item.id)}
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
  onGenerate: (count: number) => void
  onAcceptProposed: () => void
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
  onGenerate,
  onAcceptProposed,
}: BehaviorRowProps) {
  const [generateCount, setGenerateCount] = useState(3)
  const isGenerateMode = item.text.trim().toLowerCase() === '/generate'
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

  const isProposed = item.proposed === true

  return (
    <motion.div
      ref={rowRef}
      animate={shakeControls}
      className="group relative flex items-start gap-2"
    >
      <div
        className={cn(
          'flex flex-1 items-start gap-3.5 rounded-md',
          isProposed
            ? 'bg-gray-50'
            : isSelected
              ? 'bg-gray-100'
              : 'group-hover:bg-gray-50',
        )}
      >
        <div
          className={cn(
            'self-stretch w-0.5 shrink-0 rounded-full',
            isProposed ? 'bg-blue-500' : 'bg-gray-200',
          )}
        />
        <textarea
          ref={ref}
          value={item.text}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={onFocusRow}
          onBlur={onBlurRow}
          readOnly={readOnly}
          placeholder="Describe the behavior or /generate to generate behaviors"
          rows={1}
          style={{ wordBreak: 'break-word' }}
          className={cn(
            'flex-1 min-w-0 resize-none overflow-hidden bg-transparent py-1 text-sm leading-6 placeholder:text-gray-400 focus:outline-none',
            isProposed ? 'text-blue-700' : 'text-gray-900',
          )}
        />
      </div>
      {isProposed ? (
        <div className="flex shrink-0 items-center gap-1 mt-0.5">
          <button
            type="button"
            onClick={onAcceptProposed}
            disabled={readOnly}
            aria-label="Accept Behavior"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={readOnly}
            aria-label="Reject Behavior"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
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
      )}

      {isGenerateMode && !readOnly && (
        <div
          className="absolute left-3.5 top-full z-30 mt-1 w-72 rounded-lg border border-gray-200 bg-gray-0 p-3 shadow-md"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <p className="px-1 pb-2 text-xs font-medium text-gray-700">
            Generate Behaviors
          </p>
          <div className="flex items-center justify-between px-1">
            <span className="text-sm text-gray-700">Number</span>
            <span className="text-sm tabular-nums text-gray-900">
              {generateCount}
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={generateCount}
            onChange={(e) => setGenerateCount(Number(e.target.value))}
            className="mt-2 w-full accent-gray-900"
          />
          <div className="mt-3 flex justify-end">
            <Button
              type="button"
              size="sm"
              onClick={() => onGenerate(generateCount)}
            >
              Generate
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
