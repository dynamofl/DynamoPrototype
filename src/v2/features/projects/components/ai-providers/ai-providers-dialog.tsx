import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import useMeasure from 'react-use-measure'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { uid, loadState, saveState, validateKey } from './provider-storage'
import { contentVariants } from './constants'
import { ProviderListView } from './provider-list-view'
import { ProviderDetailView } from './provider-detail-view'
import type { ProviderDef, ProviderKey, ProviderState } from './types'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AiProvidersDialog({ open, onOpenChange }: Props) {
  const { projectId } = useParams<{ projectId: string }>()
  const [state, setState] = useState<Record<string, ProviderState>>(() =>
    loadState(projectId ?? '')
  )
  const [selectedProvider, setSelectedProvider] = useState<ProviderDef | null>(null)
  const [measureRef, bounds] = useMeasure()
  const [snapshotHeight, setSnapshotHeight] = useState<number | null>(null)
  const [ready, setReady] = useState(false)

  const openProviderDetail = (provider: ProviderDef) => {
    if (!state[provider.id]) {
      setState(prev => ({
        ...prev,
        [provider.id]: { open: true, keys: [{ id: uid(), name: 'Default', value: '', validated: false, validating: false }] },
      }))
    }
    setReady(true)
    setSnapshotHeight(bounds.height || null)
    setSelectedProvider(provider)
  }

  const updateKey = (providerId: string, keyId: string, field: Partial<ProviderKey>) => {
    setState(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        keys: prev[providerId].keys.map(k => k.id === keyId ? { ...k, ...field } : k),
      },
    }))
  }

  const addKey = (providerId: string) => {
    setState(prev => ({
      ...prev,
      [providerId]: {
        ...prev[providerId],
        keys: [
          ...prev[providerId].keys,
          { id: uid(), name: '', value: '', validated: false, validating: false },
        ],
      },
    }))
  }

  const removeKey = (providerId: string, keyId: string) => {
    setState(prev => {
      const keys = prev[providerId].keys.filter(k => k.id !== keyId)
      if (keys.length === 0) {
        const next = { ...prev }
        delete next[providerId]
        return next
      }
      return { ...prev, [providerId]: { ...prev[providerId], keys } }
    })
  }

  const handleValidate = async (providerId: string, keyId: string, value: string) => {
    updateKey(providerId, keyId, { validating: true, error: undefined })
    const result = await validateKey(providerId, value)
    setState(prev => {
      const updated = {
        ...prev,
        [providerId]: {
          ...prev[providerId],
          keys: prev[providerId].keys.map(k =>
            k.id === keyId ? { ...k, validating: false, validated: result.valid, error: result.error } : k
          ),
        },
      }
      saveState(projectId ?? '', updated)
      return updated
    })
  }

  const handleBack = () => {
    setSnapshotHeight(bounds.height || null)
    if (selectedProvider) {
      const s = state[selectedProvider.id]
      if (s && s.keys.every(k => !k.value)) {
        setState(prev => {
          const next = { ...prev }
          delete next[selectedProvider.id]
          return next
        })
      }
    }
    setSelectedProvider(null)
  }

  const handleClose = (v: boolean) => {
    if (!v) {
      setSelectedProvider(null)
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
                {selectedProvider ? (
                  <motion.div
                    key={`detail-${selectedProvider.id}`}
                    variants={contentVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    <ProviderDetailView
                      provider={selectedProvider}
                      state={state}
                      onUpdateKey={updateKey}
                      onAddKey={addKey}
                      onRemoveKey={removeKey}
                      onValidate={handleValidate}
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
                    <ProviderListView
                      state={state}
                      onSelectProvider={openProviderDetail}
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
