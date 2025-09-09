import { useState, useEffect } from 'react'

const EXPERIMENTS_TOGGLE_KEY = 'dynamo-experiments-enabled'

/**
 * Custom hook for managing the experiments toggle state with persistent storage
 * Uses localStorage to persist the toggle state across browser sessions
 */
export function useExperimentsToggle() {
  const [experimentsEnabled, setExperimentsEnabled] = useState<boolean>(() => {
    // Initialize from localStorage or default to false
    try {
      const stored = localStorage.getItem(EXPERIMENTS_TOGGLE_KEY)
      return stored ? JSON.parse(stored) : false
    } catch (error) {
      console.warn('Failed to load experiments toggle state from localStorage:', error)
      return false
    }
  })

  // Update localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(EXPERIMENTS_TOGGLE_KEY, JSON.stringify(experimentsEnabled))
    } catch (error) {
      console.warn('Failed to save experiments toggle state to localStorage:', error)
    }
  }, [experimentsEnabled])

  const toggleExperiments = () => {

    setExperimentsEnabled(prev => !prev)
  }

  const setExperiments = (enabled: boolean) => {
    setExperimentsEnabled(enabled)
  }

  return {
    experimentsEnabled,
    toggleExperiments,
    setExperiments
  }
}
