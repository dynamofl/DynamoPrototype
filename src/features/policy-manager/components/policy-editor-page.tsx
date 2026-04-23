/**
 * PolicyEditorPage - Full-page document-style policy editor
 * Layout follows the evaluation creation flow pattern (max-w-2xl centered)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Plus, Sparkles, Link, Globe, ScanText, X, GripVertical } from 'lucide-react'
import type { TableRow } from '@/types/table'

interface PolicySection {
  id: string
  type: 'allowed' | 'disallowed'
  title: string
  content: string
}

const SECTION_TEMPLATES = [
  { type: 'allowed' as const, title: 'Allowed Behaviors' },
  { type: 'disallowed' as const, title: 'Disallowed Behaviors' }
]

export function PolicyEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = !!id

  const [policyName, setPolicyName] = useState('Untitled Policy')
  const [description, setDescription] = useState('')
  const [sections, setSections] = useState<PolicySection[]>([])
  const [status, setStatus] = useState<'draft' | 'active' | 'inactive'>('draft')
  const [autoSaved, setAutoSaved] = useState(false)
  const [policyData, setPolicyData] = useState<TableRow | null>(null)

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load existing policy if editing
  useEffect(() => {
    if (isEditing && id) {
      try {
        const stored = localStorage.getItem('policies')
        const policies: TableRow[] = stored ? JSON.parse(stored) : []
        const policy = policies.find(p => p.id === id)
        if (policy) {
          setPolicyData(policy)
          setPolicyName(policy.name || 'Untitled Policy')
          setDescription(policy.description || '')
          setStatus(policy.status as 'draft' | 'active' | 'inactive')

          const restoredSections: PolicySection[] = []
          if (policy.allowedBehavior) {
            restoredSections.push({
              id: 'allowed-' + Date.now(),
              type: 'allowed',
              title: 'Allowed Behaviors',
              content: policy.allowedBehavior as string
            })
          }
          if (policy.disallowedBehavior) {
            restoredSections.push({
              id: 'disallowed-' + Date.now(),
              type: 'disallowed',
              title: 'Disallowed Behaviors',
              content: policy.disallowedBehavior as string
            })
          }
          setSections(restoredSections)
        }
      } catch (error) {
        console.error('Failed to load policy:', error)
      }
    }
  }, [id, isEditing])

  // Auto-save with debounce
  const triggerAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    setAutoSaved(false)

    saveTimeoutRef.current = setTimeout(() => {
      savePolicy(false)
      setAutoSaved(true)
    }, 1000)
  }, [policyName, description, sections, status])

  useEffect(() => {
    if (policyName || description || sections.length > 0) {
      triggerAutoSave()
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [policyName, description, sections])

  const savePolicy = (publish: boolean) => {
    try {
      const stored = localStorage.getItem('policies')
      const policies: TableRow[] = stored ? JSON.parse(stored) : []

      const allowedSection = sections.find(s => s.type === 'allowed')
      const disallowedSection = sections.find(s => s.type === 'disallowed')

      const policyPayload: TableRow = {
        id: isEditing && id ? id : (policyData?.id || Date.now().toString()),
        name: policyName.trim() || 'Untitled Policy',
        description: description.trim(),
        category: policyData?.category || '',
        type: policyData?.type || '',
        version: policyData?.version || '1.0',
        effectiveDate: policyData?.effectiveDate || new Date().toISOString().split('T')[0],
        owner: policyData?.owner || '',
        content: '',
        allowedBehavior: allowedSection?.content || '',
        disallowedBehavior: disallowedSection?.content || '',
        status: publish ? 'active' : status,
        createdAt: policyData?.createdAt || new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      }

      const existingIndex = policies.findIndex(p => p.id === policyPayload.id)
      if (existingIndex !== -1) {
        policies[existingIndex] = policyPayload
      } else {
        policies.unshift(policyPayload)
      }

      localStorage.setItem('policies', JSON.stringify(policies))
      setPolicyData(policyPayload)

      if (publish) {
        setStatus('active')
      }
    } catch (error) {
      console.error('Failed to save policy:', error)
    }
  }

  const handlePublish = () => {
    savePolicy(true)
    setAutoSaved(true)
  }

  const handleExitEditing = () => {
    savePolicy(false)
    navigate('/policy-manager')
  }

  const addSection = (type: 'allowed' | 'disallowed') => {
    const template = SECTION_TEMPLATES.find(t => t.type === type)
    if (!template) return
    if (sections.some(s => s.type === type)) return

    setSections([...sections, {
      id: `${type}-${Date.now()}`,
      type: template.type,
      title: template.title,
      content: ''
    }])
  }

  const removeSection = (sectionId: string) => {
    setSections(sections.filter(s => s.id !== sectionId))
  }

  const updateSectionContent = (sectionId: string, content: string) => {
    setSections(sections.map(s =>
      s.id === sectionId ? { ...s, content } : s
    ))
  }

  const handleSectionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    sectionId: string
  ) => {
    if (e.key === 'Enter') {
      const textarea = e.currentTarget
      const cursorPosition = textarea.selectionStart
      const section = sections.find(s => s.id === sectionId)
      if (!section) return
      const currentValue = section.content

      if (e.shiftKey) {
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n' +
          currentValue.substring(cursorPosition)
        updateSectionContent(sectionId, newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 1
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }, 0)
      } else {
        e.preventDefault()
        const newValue =
          currentValue.substring(0, cursorPosition) +
          '\n• ' +
          currentValue.substring(cursorPosition)
        updateSectionContent(sectionId, newValue)
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
          textarea.style.height = 'auto'
          textarea.style.height = textarea.scrollHeight + 'px'
        }, 0)
      }
    }
  }

  const handleSectionContentChange = (sectionId: string, value: string) => {
    const section = sections.find(s => s.id === sectionId)
    if (!section) return

    const isPaste = Math.abs(value.length - section.content.length) > 1

    if (isPaste) {
      const lines = value.split('\n')
      const formattedLines = lines.map(line => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('•')) {
          return `• ${trimmedLine}`
        }
        return line
      })
      updateSectionContent(sectionId, formattedLines.join('\n'))
    } else {
      if (section.content === '' && value.length === 1 && value !== '•') {
        updateSectionContent(sectionId, `• ${value}`)
      } else {
        updateSectionContent(sectionId, value)
      }
    }
  }

  const availableSections = SECTION_TEMPLATES.filter(
    template => !sections.some(s => s.type === template.type)
  )

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200'
      case 'draft': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'inactive': return 'bg-gray-100 text-gray-600 border-gray-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'active': return 'Active'
      case 'draft': return 'Draft'
      case 'inactive': return 'Inactive'
      default: return 'Draft'
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header Bar — white strip with border */}
      <div className="bg-gray-0 border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left: Policy Name + Status */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-450 text-gray-900 truncate max-w-[300px]">
              {policyName || 'Untitled Policy'}
            </span>
            <Badge className={getStatusBadgeClass()}>
              {getStatusLabel()}
            </Badge>
          </div>

          {/* Right: Auto Save + Actions */}
          <div className="flex items-center gap-4">
            {autoSaved && (
              <span className="flex items-center gap-1.5 text-sm text-gray-500">
                <Check className="w-3.5 h-3.5" />
                Auto Saved
              </span>
            )}
            <Button onClick={handlePublish}>
              Publish Changes
            </Button>
            <button
              onClick={handleExitEditing}
              className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              Exit Editing
            </button>
          </div>
        </div>
      </div>

      {/* Body Area — gray background with white content card */}
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="mx-auto px-6 py-6" style={{ maxWidth: '960px' }}>
          {/* White content card */}
          <div className="bg-gray-0 rounded-lg border border-gray-200 shadow-sm p-8">
            {/* Editable Title */}
            <input
              type="text"
              value={policyName}
              onChange={(e) => setPolicyName(e.target.value)}
              placeholder="Untitled Policy"
              className="w-full text-2xl font-450 text-gray-800 italic bg-transparent border-none outline-none placeholder:text-gray-400 mb-6"
            />

            {/* Description Area */}
            <div className="mb-8">
              <textarea
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = Math.max(e.target.scrollHeight, 160) + 'px'
                }}
                placeholder="Start with typing the policy description here"
                className="w-full min-h-[160px] p-5 text-sm text-gray-700 bg-blue-50/50 rounded-lg border-none outline-none resize-none placeholder:text-gray-400"
                style={{ height: 'auto', minHeight: '160px' }}
              />
            </div>

            {/* Added Sections */}
            {sections.map((section) => (
              <div key={section.id} className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300" />
                    <h3 className="text-sm font-450 text-gray-700">{section.title}</h3>
                  </div>
                  <button
                    onClick={() => removeSection(section.id)}
                    className="p-1 text-gray-400 hover:text-gray-600 rounded cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={section.content}
                  onChange={(e) => {
                    handleSectionContentChange(section.id, e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.max(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={(e) => handleSectionKeyDown(e, section.id)}
                  placeholder={`• Start typing ${section.title.toLowerCase()}...`}
                  className="w-full min-h-[120px] p-4 text-[0.8125rem] text-gray-700 bg-gray-50 rounded-lg border border-gray-200 outline-none resize-none placeholder:text-gray-400 focus:border-gray-300 focus:ring-0"
                  style={{ height: 'auto', minHeight: '120px' }}
                />
                <p className="text-xs text-gray-400 mt-1.5">
                  Press Enter for new bullet point, Shift + Enter for line break.
                </p>
              </div>
            ))}

            {/* Add Section */}
            {availableSections.length > 0 && (
              <div className="mt-6">
                <p className="text-sm font-450 text-gray-500 mb-3">Add Section</p>
                <div className="space-y-2">
                  {availableSections.map((template) => (
                    <button
                      key={template.type}
                      onClick={() => addSection(template.type)}
                      className="flex items-center gap-3 w-full text-left px-1 py-1.5 text-sm text-gray-700 hover:text-gray-900 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 text-gray-400">
                        <Plus className="w-3.5 h-3.5" />
                      </div>
                      {template.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Floating Toolbar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="inline-flex items-center gap-1 bg-gray-0 border border-gray-200 rounded-xl shadow-lg px-2 py-2 whitespace-nowrap">
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Sparkles className="w-4 h-4" />
            <span>Auto Generate Behaviors</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Link className="w-4 h-4" />
            <span>Extract from Files</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Globe className="w-4 h-4" />
            <span>Refer Web</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <ScanText className="w-4 h-4" />
            <span>Proofread Policy</span>
          </button>
        </div>
      </div>
    </div>
  )
}
