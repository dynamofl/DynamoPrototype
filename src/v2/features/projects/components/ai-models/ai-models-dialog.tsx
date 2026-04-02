import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import useMeasure from 'react-use-measure'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { fetchProviderModels } from '@/features/ai-systems/lib/provider-services'
import { loadState as loadProviderState } from '../ai-providers/provider-storage'
import { PROVIDERS } from '../ai-providers/constants'
import { loadSelectedModels, saveSelectedModels } from './model-storage'
import { contentVariants } from './constants'
import { ModelListView } from './model-list-view'
import { ModelDetailView } from './model-detail-view'
import type { AIModel } from '@/features/ai-systems/types/types'
import type { ProviderModels, SelectedModel } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiModelsDialog({ open, onOpenChange }: Props) {
  const { projectId } = useParams<{ projectId: string }>()
  const [providerModels, setProviderModels] = useState<ProviderModels[]>([])
  const [selectedModels, setSelectedModels] = useState<SelectedModel[]>(() =>
    loadSelectedModels(projectId ?? '')
  )
  const [detailModel, setDetailModel] = useState<{ model: AIModel; providerId: string; providerName: string; iconType: string } | null>(null)
  const [measureRef, bounds] = useMeasure()
  const [snapshotHeight, setSnapshotHeight] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const fetchModels = useCallback(async () => {
    if (!projectId) return
    const providerState = loadProviderState(projectId)
    const connected = Object.entries(providerState).filter(
      ([, s]) => s.keys.some(k => k.validated)
    )

    if (connected.length === 0) {
      setProviderModels([])
      return
    }

    const initial: ProviderModels[] = connected.map(([providerId]) => {
      const def = PROVIDERS.find(p => p.id === providerId)
      return {
        providerId,
        providerName: def?.name ?? providerId,
        iconType: def?.iconType ?? 'Custom',
        models: [],
        loading: true,
      }
    })
    setProviderModels(initial)

    for (const [providerId, state] of connected) {
      const def = PROVIDERS.find(p => p.id === providerId)
      if (!def) continue
      const validKey = state.keys.find(k => k.validated)
      if (!validKey) continue

      try {
        const models = await fetchProviderModels(def.providerType, validKey.value)
        setProviderModels(prev =>
          prev.map(p => p.providerId === providerId ? { ...p, models, loading: false } : p)
        )
      } catch {
        setProviderModels(prev =>
          prev.map(p => p.providerId === providerId ? { ...p, loading: false, error: 'Failed to load models' } : p)
        )
      }
    }
  }, [projectId])

  useEffect(() => {
    if (open) fetchModels()
  }, [open, fetchModels])

  const toggleModel = (model: AIModel, providerId: string, providerName: string) => {
    setSelectedModels(prev => {
      const exists = prev.some(m => m.modelId === model.id)
      const updated = exists
        ? prev.filter(m => m.modelId !== model.id)
        : [...prev, { modelId: model.id, providerId, providerName }]
      saveSelectedModels(projectId ?? '', updated)
      return updated
    })
  }

  const toggleAllModels = (models: AIModel[], providerId: string, providerName: string, select: boolean) => {
    setSelectedModels(prev => {
      const modelIds = new Set(models.map(m => m.id))
      const without = prev.filter(m => !modelIds.has(m.modelId))
      const updated = select
        ? [...without, ...models.map(m => ({ modelId: m.id, providerId, providerName }))]
        : without
      saveSelectedModels(projectId ?? '', updated)
      return updated
    })
  }

  const viewDetail = (model: AIModel, providerId: string, providerName: string) => {
    const def = PROVIDERS.find(p => p.id === providerId)
    setReady(true)
    setSnapshotHeight(bounds.height || null)
    setDetailModel({ model, providerId, providerName, iconType: def?.iconType ?? 'Custom' })
  }

  const handleBack = () => {
    setSnapshotHeight(bounds.height || null)
    setDetailModel(null)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setDetailModel(null)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent size="md" className="!p-0 !overflow-hidden">
        <MotionConfig transition={{ duration: 0.5, type: 'spring', bounce: 0 }}>
          <motion.div
            animate={{ height: ready && bounds.height ? bounds.height : 'auto' }}
            transition={ready && snapshotHeight !== null
              ? { duration: 0.5, type: 'spring', bounce: 0 }
              : { duration: 0 }
            }
            className={ready ? 'overflow-hidden' : ''}
          >
            <div ref={measureRef}>
              <AnimatePresence mode="popLayout" initial={false}>
                {detailModel ? (
                  <motion.div
                    key={`detail-${detailModel.model.id}`}
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ModelDetailView
                      model={detailModel.model}
                      providerId={detailModel.providerId}
                      providerName={detailModel.providerName}
                      iconType={detailModel.iconType}
                      onBack={handleBack}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="list"
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ModelListView
                      providerModels={providerModels}
                      selectedModels={selectedModels}
                      onToggleModel={toggleModel}
                      onToggleAllModels={toggleAllModels}
                      onViewDetail={viewDetail}
                      onSave={() => onOpenChange(false)}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </MotionConfig>
      </DialogContent>
    </Dialog>
  )
}
