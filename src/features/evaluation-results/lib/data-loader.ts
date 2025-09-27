import type { EvaluationData, EvaluationRecord } from '../types'

export async function loadEvaluationData(): Promise<EvaluationRecord[]> {
  try {
    const response = await fetch('/MockData/llm_jailbreak_samples_v1.5.json')
    if (!response.ok) {
      throw new Error(`Failed to load data: ${response.statusText}`)
    }
    
    const data: EvaluationData = await response.json()
    return data.records || []
  } catch (error) {
    console.error('Error loading evaluation data:', error)
    throw error
  }
}