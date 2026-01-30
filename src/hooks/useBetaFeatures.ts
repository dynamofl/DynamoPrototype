import { useState, useEffect } from 'react'

const BETA_FEATURES_KEY = 'dynamo-beta-features'

interface BetaFeatures {
  reviewMode: boolean
  // Add more features here as needed
}

const DEFAULT_FEATURES: BetaFeatures = {
  reviewMode: false
}

/**
 * Custom hook for managing beta feature toggles with persistent storage
 * Uses localStorage to persist feature states across browser sessions
 */
export function useBetaFeatures() {
  const [features, setFeatures] = useState<BetaFeatures>(() => {
    // Initialize from localStorage or default to all disabled
    try {
      const stored = localStorage.getItem(BETA_FEATURES_KEY)
      return stored ? { ...DEFAULT_FEATURES, ...JSON.parse(stored) } : DEFAULT_FEATURES
    } catch (error) {
      console.warn('Failed to load beta features state from localStorage:', error)
      return DEFAULT_FEATURES
    }
  })

  // Update localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem(BETA_FEATURES_KEY, JSON.stringify(features))
    } catch (error) {
      console.warn('Failed to save beta features state to localStorage:', error)
    }
  }, [features])

  const getBetaFeature = (key: keyof BetaFeatures): boolean => {
    return features[key]
  }

  const setBetaFeature = (key: keyof BetaFeatures, value: boolean) => {
    setFeatures(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const toggleBetaFeature = (key: keyof BetaFeatures) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return {
    features,
    getBetaFeature,
    setBetaFeature,
    toggleBetaFeature
  }
}
