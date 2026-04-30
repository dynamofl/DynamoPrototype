import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  File as FileIcon,
  Loader2,
  MessageCircleDashed,
  Paperclip,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type UploadStatus = 'uploading' | 'completed'

interface AttachedFile {
  id: string
  file: File
  status: UploadStatus
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const getFileTypeLabel = (file: File): string => {
  const name = file.name.toLowerCase()
  if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv'))
    return 'Spreadsheet'
  if (name.endsWith('.pdf')) return 'PDF'
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'Document'
  if (name.endsWith('.ppt') || name.endsWith('.pptx')) return 'Presentation'
  if (name.endsWith('.txt') || name.endsWith('.md')) return 'Text'
  if (name.endsWith('.json')) return 'JSON'
  return 'File'
}

const truncateMiddle = (value: string, head = 20, tail = 8): string => {
  if (value.length <= head + tail + 3) return value
  return `${value.slice(0, head)}...${value.slice(-tail)}`
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
}

const suggestionsListVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.05, delayChildren: 0.05 },
  },
}

const SUGGESTIONS = [
  "Ensure AI system don't give financial advice",
  'Prevent the model from providing legal advice or interpretations',
  'Restrict generation of unsafe health or drug-related guidance',
]

interface CreateNewPolicyStepProps {
  onSubmit: (objective: string, files: File[]) => void
  animateOnMount?: boolean
}

export function CreateNewPolicyStep({
  onSubmit,
  animateOnMount = true,
}: CreateNewPolicyStepProps) {
  const [objective, setObjective] = useState('')
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const chipsScrollRef = useRef<HTMLDivElement>(null)
  const scrollDragRef = useRef<{
    pointerId: number
    startX: number
    scrollLeft: number
    active: boolean
  } | null>(null)

  const canSubmit = objective.trim().length > 0

  const handleSubmit = () => {
    if (!canSubmit) return
    const completedFiles = attachedFiles
      .filter((f) => f.status === 'completed')
      .map((f) => f.file)
    onSubmit(objective.trim(), completedFiles)
  }

  const addFiles = (files: File[]) => {
    if (files.length === 0) return

    const entries: AttachedFile[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      status: 'uploading',
    }))

    setAttachedFiles((prev) => [...prev, ...entries])

    entries.forEach((entry) => {
      const delay = 1500 + Math.random() * 1500
      window.setTimeout(() => {
        setAttachedFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id ? { ...f, status: 'completed' } : f,
          ),
        )
      }, delay)
    })
  }

  const handleFilesPicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []))
    event.target.value = ''
  }

  const handleRemoveFile = (id: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.stopPropagation()
    dragCounterRef.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.dataTransfer.types.includes('Files')) return
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounterRef.current = Math.max(0, dragCounterRef.current - 1)
    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    event.stopPropagation()
    dragCounterRef.current = 0
    setIsDragging(false)
    addFiles(Array.from(event.dataTransfer.files ?? []))
  }

  const handleChipsPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    const target = event.target as HTMLElement
    if (target.closest('button')) return
    const container = chipsScrollRef.current
    if (!container) return
    scrollDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
      active: false,
    }
  }

  const handleChipsPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = scrollDragRef.current
    const container = chipsScrollRef.current
    if (!drag || !container) return
    const dx = event.clientX - drag.startX
    if (!drag.active && Math.abs(dx) > 4) {
      drag.active = true
      container.setPointerCapture(drag.pointerId)
    }
    if (drag.active) {
      event.preventDefault()
      container.scrollLeft = drag.scrollLeft - dx
    }
  }

  const handleChipsPointerEnd = () => {
    const drag = scrollDragRef.current
    const container = chipsScrollRef.current
    if (drag?.active && container?.hasPointerCapture(drag.pointerId)) {
      container.releasePointerCapture(drag.pointerId)
    }
    scrollDragRef.current = null
  }

  return (
    <motion.div
      className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-3 py-8"
      variants={containerVariants}
      initial={animateOnMount ? 'hidden' : false}
      animate="visible"
    >
      <motion.div className="flex flex-col gap-1 px-3" variants={sectionVariants}>
        <h2 className="text-base font-medium tracking-tight text-gray-900">
          Describe the Objective of the Policy in Simple Words
        </h2>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            className="border-b border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900"
          >
            Show Best Practices
          </button>
          <button
            type="button"
            className="flex items-center gap-1 border-b border-dashed border-gray-300 text-xs text-gray-500 hover:text-gray-900"
          >
            Read Docs
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      </motion.div>

      <motion.div
        className={`flex flex-col py-2 rounded-2xl transition-colors ${
          isDragging
            ? 'bg-gray-200 ring-2 ring-inset ring-gray-400'
            : 'bg-gray-100'
        }`}
        variants={sectionVariants}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {attachedFiles.length > 0 && (
          <div
            ref={chipsScrollRef}
            className="flex select-none gap-2 overflow-x-auto px-4 mt-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onPointerDown={handleChipsPointerDown}
            onPointerMove={handleChipsPointerMove}
            onPointerUp={handleChipsPointerEnd}
            onPointerCancel={handleChipsPointerEnd}
          >
            {attachedFiles.map((item) => (
              <div
                key={item.id}
                className="flex w-[280px] shrink-0 items-center gap-2 rounded-lg bg-gray-0 border border-gray-200 p-2"
              >
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gray-100">
                  {item.status === 'uploading' ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : (
                    <FileIcon className="h-5 w-5 text-gray-600" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                  <span
                    className="truncate text-sm leading-5 text-gray-900"
                    title={item.file.name}
                  >
                    {truncateMiddle(item.file.name)}
                  </span>
                  <span className="truncate text-xs leading-5 text-gray-500">
                    {item.status === 'uploading'
                      ? 'Uploading ...'
                      : `${getFileTypeLabel(item.file)} · ${formatFileSize(item.file.size)}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFile(item.id)}
                  aria-label={`Remove ${item.file.name}`}
                  className="shrink-0 self-start text-gray-500 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
        <textarea
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Start typing here..."
          rows={5}
          className="w-full px-4 py-2 resize-none bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <div className="flex items-center justify-between  px-2">
          <div className="flex items-center align-center">
            <Button
              type="button"
              variant="ghost"
              size="default"
              className="gap-1 text-gray-500"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
              Attach Reference Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xlsx,.xls,.csv,.txt,.md"
              className="hidden"
              onChange={handleFilesPicked}
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            aria-label="Submit"
            className="h-8 w-8 rounded-full p-0 mr-1 mb-2"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <motion.div className="flex flex-col gap-4  pt-2" variants={sectionVariants}>
        <p className="text-xs text-gray-500 px-3">Suggestions</p>
        <motion.div
          className="flex flex-col gap-0.5 px-1"
          variants={suggestionsListVariants}
        >
          {SUGGESTIONS.map((suggestion) => (
            <motion.button
              key={suggestion}
              type="button"
              variants={sectionVariants}
              onClick={() => setObjective(suggestion)}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-gray-900 hover:bg-gray-100"
            >
              <MessageCircleDashed className="h-4 w-4 shrink-0 text-gray-400" />
              <span>{suggestion}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
