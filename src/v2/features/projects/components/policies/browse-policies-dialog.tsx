import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PolicyListView } from './policy-list-view'
import { PolicyPreviewPanel } from './policy-preview-panel'
import { addPolicies, addPolicy, loadPolicies } from './policy-storage'
import { POLICY_TEMPLATES, POLICY_CATEGORIES } from './constants'
import type { PolicyTemplate } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function loadSavedTemplateIds(projectId: string): Set<string> {
  const saved = loadPolicies(projectId)
  const ids = new Set<string>()
  for (const p of saved) {
    if (p.templateId) ids.add(p.templateId)
  }
  return ids
}

export function BrowsePoliciesDialog({ open, onOpenChange }: Props) {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [hoveredTemplate, setHoveredTemplate] = useState<PolicyTemplate | null>(null)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Load saved selections when dialog opens
  useEffect(() => {
    if (open && projectId) {
      const saved = loadSavedTemplateIds(projectId)
      setSavedIds(saved)
      setSelectedIds(saved)
    }
  }, [open, projectId])

  const searchLower = search.toLowerCase()
  const filtered = POLICY_TEMPLATES.filter(t => {
    const matchesSearch = !search || t.name.toLowerCase().includes(searchLower) || t.description.toLowerCase().includes(searchLower)
    const matchesCategory = !activeCategory || t.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const toggleTemplate = (templateId: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(templateId)) next.delete(templateId)
      else next.add(templateId)
      return next
    })
  }

  const handleSave = () => {
    if (!projectId) return
    // Only add templates that are newly selected (not already saved)
    const newIds = [...selectedIds].filter(id => !savedIds.has(id))
    if (newIds.length > 0) {
      const templates = POLICY_TEMPLATES.filter(t => newIds.includes(t.id))
      addPolicies(
        projectId,
        templates.map(t => ({
          name: t.name,
          description: t.description,
          allowed: t.allowed,
          disallowed: t.disallowed,
          templateId: t.id,
        }))
      )
    }
    onOpenChange(false)
    navigate(`/v2/projects/${projectId}/policies`)
  }

  const handleStartFresh = () => {
    if (!projectId) return
    addPolicy(projectId, {
      name: 'Untitled Policy',
      description: '',
      allowed: [],
      disallowed: [],
    })
    onOpenChange(false)
    navigate(`/v2/projects/${projectId}/policies`)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedIds(savedIds)
      setHoveredTemplate(null)
      setSearch('')
      setActiveCategory(null)
      onOpenChange(false)
    }
  }

  const selectedCount = selectedIds.size

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="xl" className="!p-0 !overflow-hidden">
        {/* Header — full width */}
        <div className="flex items-center pl-6 pr-4 py-4">
          <span className="text-[0.875rem] font-[500] text-gray-800">Browse Policy Templates</span>
        </div>

        {/* Search — full width */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="pl-9 text-[0.8125rem] border-gray-200"
            />
          </div>
        </div>

        {/* Category pills — full width */}
        <div className="px-4 pb-3 flex gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[0.75rem] font-[450] transition-colors',
              !activeCategory
                ? 'bg-gray-200 text-gray-800'
                : 'border-[0.5px] border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100'
            )}
          >
            All
          </button>
          {POLICY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                'px-2.5 py-1 rounded-full text-[0.75rem] font-[450] transition-colors',
                activeCategory === cat
                  ? 'bg-gray-200 text-gray-800'
                  : 'border-[0.5px] border-gray-300 bg-transparent text-gray-600 hover:bg-gray-100'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Body — split into list + preview */}
        <div className="flex h-[32rem]">
          {/* Left: policy list */}
          <div
            className="w-1/2 shrink-0 overflow-y-auto"
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            <PolicyListView
              templates={filtered}
              selectedIds={selectedIds}
              hoveredTemplateId={hoveredTemplate?.id ?? null}
              onToggle={toggleTemplate}
              onHover={setHoveredTemplate}
            />
          </div>

          {/* Right: preview panel */}
          <div className="flex-1 flex flex-col pl-2 px-6 pb-2 overflow-hidden">
            <PolicyPreviewPanel template={hoveredTemplate} />
          </div>
        </div>

        {/* Footer — full width */}
        <div className="flex items-center justify-between px-5 py-5">
          <DialogClose asChild>
            <Button variant="outline" size="default">Cancel</Button>
          </DialogClose>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="default" onClick={handleStartFresh} className="gap-1">
              <Plus />
              Create Own Policy
            </Button>
            <Button size="default" onClick={handleSave} disabled={selectedCount === 0}>
              Add Selected
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
